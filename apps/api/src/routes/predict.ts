// apps/api/src/routes/predict.ts
import { Router } from 'express';
import { prisma } from 'db';
import axios from 'axios';

export const predictRouter: Router = Router();

// 캐시를 위한 In-Memory Map (운영 환경에서는 Redis 등 권장)
const formatSetsCache = new Map<string, any>();

function toId(text: string) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

type MoveRow = { moveId: string; probability: number };
type LockedRow = { slotId: string; moveId: string; status: string };

// 확률 재정규화(Top4만)
function normalizeTop4(rows: MoveRow[]) {
  const sum = rows.reduce((acc, r) => acc + (r.probability || 0), 0) || 1;
  return rows.map(r => ({
    move_id: r.moveId,
    p: (r.probability || 0) / sum,
  }));
}

/**
 * POST /api/predict/moves
 * body: { session_id: string }
 *
 * 응답의 slot_id는 "반드시 DB battle_opponent_slots.id" 이어야 함
 * (절대 새 UUID 생성 금지)
 */
predictRouter.post('/moves', async (req, res) => {
  const sessionId = String(req.body?.session_id || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'session_id required' });

  // 세션 확인 + statsVersionId 확보
  const session = await prisma.battleSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      statsVersionId: true,
      formatId: true,
    },
  });
  if (!session) return res.status(404).json({ error: 'session not found' });

  // ✅ DB 슬롯을 읽고, 그 id를 그대로 slot_id로 반환해야 함
  const slots = await prisma.battleOpponentSlot.findMany({
    where: { sessionId },
    orderBy: { slot: 'asc' },
    select: {
      id: true,        // <- DB PK
      slot: true,      // 1|2|3
      speciesId: true,
      formId: true,
    },
  });

  // 슬롯이 없으면 그대로 빈 배열 반환
  if (!slots.length) {
    return res.json({
      session_id: sessionId,
      stats_version_id: session.statsVersionId,
      predictions: [],
    });
  }

  // 슬롯별 LOCKED/BANNED 상태 읽기(LOCKED만 locked=true 표시)
  const slotIds = slots.map((s: any) => s.id);

  const lockedRows: LockedRow[] = await prisma.battleOpponentMove.findMany({
    where: { slotId: { in: slotIds } },
    select: { slotId: true, moveId: true, status: true },
  });

  const lockedSetBySlot = new Map<string, Set<string>>();
  const bannedSetBySlot = new Map<string, Set<string>>();

  for (const r of lockedRows) {
    if (r.status === 'LOCKED') {
      const set = lockedSetBySlot.get(r.slotId) ?? new Set<string>();
      set.add(r.moveId);
      lockedSetBySlot.set(r.slotId, set);
    } else if (r.status === 'BANNED') {
      const set = bannedSetBySlot.get(r.slotId) ?? new Set<string>();
      set.add(r.moveId);
      bannedSetBySlot.set(r.slotId, set);
    }
  }

  // 예측 생성
  const predictions = [];

  for (const s of slots) {
    // move_usage에서 top 후보를 넉넉히 가져온 뒤(예: 50개)
    // 모든 활성화된 포맷(OU, Ubers, VGC 등)의 통계를 취합하여 최고 픽률을 채택 (포괄적 샘플 커버리지)
    const allUsages = await prisma.moveUsage.findMany({
      where: {
        speciesId: s.speciesId,
        formId: s.formId,
        statsVersion: { status: 'ACTIVE' },
      },
      select: { moveId: true, probability: true },
    });

    const maxProbMap = new Map<string, number>();
    for (const u of allUsages) {
      const current = maxProbMap.get(u.moveId) || 0;
      if (typeof u.probability === 'number' && u.probability > current) {
        maxProbMap.set(u.moveId, u.probability);
      }
    }

    const raw: MoveRow[] = Array.from(maxProbMap.entries())
      .map(([moveId, probability]) => ({ moveId, probability }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 50);

    const banned = bannedSetBySlot.get(s.id) ?? new Set<string>();
    const locked = lockedSetBySlot.get(s.id) ?? new Set<string>();

    // 확정 기술(Locked)은 p=1.0으로 고정, 통계에 아예 없는 기술이면 warning 부여
    const guaranteedMoves: { move_id: string; p: number; locked: boolean; warning?: boolean }[] = [];
    for (const lid of locked) {
      const isViable = raw.some(r => r.moveId === lid);
      guaranteedMoves.push({ move_id: lid, p: 1.0, locked: true, warning: !isViable });
    }

    const remainingSlotCount = Math.max(0, 4 - guaranteedMoves.length);

    // Banned 되었거나 이미 Locked 된 기술 제외
    let filtered = raw.filter(r => !banned.has(r.moveId) && !locked.has(r.moveId));

    // -- 동적 재계산 로직 (Dynamic Recalculation based on Locked Moves & Sets) --
    if (session.formatId) {
      try {
        if (!formatSetsCache.has('gen9')) {
          console.log(`Fetching global sets for gen9...`);
          const res = await axios.get(`https://play.pokemonshowdown.com/data/sets/gen9.json`);
          formatSetsCache.set('gen9', res.data);
        }

        const setsData = formatSetsCache.get('gen9');
        if (setsData) {
          const searchId = s.formId ? toId(s.formId) : toId(s.speciesId);
          const allSetMovesList: Set<string>[] = [];

          // gen9.json 구조: { "gen9ou": { "dex": { "Garchomp": { "Swords Dance": { moves: [...] } } } } }
          for (const format in setsData) {
            const formatData = setsData[format];
            if (formatData && formatData.dex) {
              const targetKey = Object.keys(formatData.dex).find(k => toId(k) === searchId);
              if (targetKey) {
                const pkmnSets = formatData.dex[targetKey];
                for (const setName in pkmnSets) {
                  const setObj = pkmnSets[setName];
                  if (setObj && setObj.moves && Array.isArray(setObj.moves)) {
                    let setMoveIds = new Set<string>();
                    for (const m of setObj.moves) {
                      if (Array.isArray(m)) m.forEach((mx: string) => setMoveIds.add(toId(mx)));
                      else setMoveIds.add(toId(m));
                    }
                    allSetMovesList.push(setMoveIds);
                  }
                }
              }
            }
          }

          if (allSetMovesList.length > 0) {
            const allStandardMoves = new Set<string>();
            allSetMovesList.forEach(s => s.forEach(m => allStandardMoves.add(m)));

            let validSets = allSetMovesList;
            if (locked.size > 0) {
              validSets = allSetMovesList.filter(setMoves => {
                return Array.from(locked).every(l => setMoves.has(l));
              });
            }

            const validPartnerMoves = new Set<string>();
            validSets.forEach(s => s.forEach(m => validPartnerMoves.add(m)));

            for (const candidate of filtered) {
              if (locked.size > 0) {
                if (allStandardMoves.has(candidate.moveId) && !validPartnerMoves.has(candidate.moveId)) {
                  // 1) 이건 스모곤 정석 세트 덱에 존재하는 스킬이긴 한데, "현재 유저가 확정한 스킬(예: 역린)"과 단 한 번도 같이 쓰인 적 없는 스킬임. 
                  // 즉 명백한 '상호 배타적' 기믹/정석 스킬(예: 역린 vs 드태)이므로 확률을 깎는다.
                  candidate.probability *= 0.05;
                } else if (validPartnerMoves.has(candidate.moveId)) {
                  // 2) 정석 세트 조합에 부합하는 연계 스킬. 조금 더 상위 노출하도록 가중치.
                  candidate.probability *= 1.2;
                }
                // 3) 그 외(예: 회오리불꽃). 아예 정석에 등록도 안 된 비주류 오프 메타 스킬이라 allStandardMoves에 없음. 
                // 통계 원본 확률을 건드리지 않고 그대로 존중함!
              }
            }
            filtered = filtered.sort((a, b) => b.probability - a.probability);
          }
        }
      } catch (e) {
        console.error("Set fetch error for dynamic prediction:", e);
      }
    }

    const remainingTop = filtered.slice(0, remainingSlotCount);
    const norm = normalizeTop4(remainingTop);

    const finalMoves = [
      ...guaranteedMoves.map(m => ({ move_id: m.move_id, p: m.p, locked: m.locked, warning: m.warning })),
      ...norm.map(m => ({ move_id: m.move_id, p: m.p, locked: false }))
    ];

    // -- 도구 (Item) 예측 로직 추가 --
    const itemUsages = await prisma.itemUsage.findMany({
      where: {
        speciesId: s.speciesId,
        formId: s.formId,
        statsVersion: { status: 'ACTIVE' },
      },
      select: { itemId: true, probability: true },
    });

    const itemMaxMap = new Map<string, number>();
    for (const u of itemUsages) {
      const current = itemMaxMap.get(u.itemId) || 0;
      if (typeof u.probability === 'number' && u.probability > current) {
        itemMaxMap.set(u.itemId, u.probability);
      }
    }

    const itemsRaw = Array.from(itemMaxMap.entries())
      .map(([itemId, probability]) => ({ itemId, probability }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5); // top 5 items

    const sumItems = itemsRaw.reduce((acc, r) => acc + (r.probability || 0), 0) || 1;
    const finalItems = itemsRaw.map(r => ({
      item_id: r.itemId,
      p: (r.probability || 0) / sumItems,
    }));

    predictions.push({
      slot: s.slot,
      slot_id: s.id,
      species_id: s.speciesId,
      moves: finalMoves,
      items: finalItems,
    });
  }

  return res.json({
    session_id: sessionId,
    stats_version_id: session.statsVersionId,
    predictions,
  });
});
