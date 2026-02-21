// apps/api/src/routes/predict.ts
import { Router } from 'express';
import { prisma } from 'db';

export const predictRouter: Router = Router();

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
    // BANNED 제외하고 4개를 뽑음
    const raw: MoveRow[] = await prisma.moveUsage.findMany({
      where: {
        statsVersionId: session.statsVersionId,
        speciesId: s.speciesId,
        formId: s.formId, // null 가능 (Prisma가 null 조건을 무시할 수도 있어 스키마에 따라 다름)
      },
      orderBy: { probability: 'desc' },
      take: 50,
      select: { moveId: true, probability: true },
    });

    const banned = bannedSetBySlot.get(s.id) ?? new Set<string>();
    const locked = lockedSetBySlot.get(s.id) ?? new Set<string>();

    // 확정 기술(Locked)은 p=1.0으로 고정
    const guaranteedMoves: { move_id: string; p: number; locked: boolean }[] = [];
    for (const lid of locked) {
      guaranteedMoves.push({ move_id: lid, p: 1.0, locked: true });
    }

    const remainingSlotCount = Math.max(0, 4 - guaranteedMoves.length);

    // Banned 되었거나 이미 Locked 된 기술 제외
    const filtered = raw.filter(r => !banned.has(r.moveId) && !locked.has(r.moveId));

    const remainingTop = filtered.slice(0, remainingSlotCount);
    // 남은 자리(4-k)를 채울 후보들의 확률을 다시 1.0 분모로 재계산(동적 예측)
    const norm = normalizeTop4(remainingTop);

    const finalMoves = [
      ...guaranteedMoves,
      ...norm.map(m => ({ move_id: m.move_id, p: m.p, locked: false }))
    ];

    predictions.push({
      slot: s.slot,
      slot_id: s.id,          // ✅ 핵심: DB slot id
      species_id: s.speciesId,
      moves: finalMoves,
    });
  }

  return res.json({
    session_id: sessionId,
    stats_version_id: session.statsVersionId,
    predictions,
  });
});
