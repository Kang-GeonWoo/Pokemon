// apps/api/src/routes/battle.ts
import { Router } from 'express';
import { prisma } from 'db';
import crypto from 'crypto';

export const battleRouter: Router = Router();

function now() {
  return new Date();
}

/**
 * POST /api/battle/session
 * body:
 * {
 *   user_id?: string,
 *   format_id?: string (default gen9ou),
 *   ruleset_snapshot_id?: string (없으면 최신),
 *   stats_version_id?: string (없으면 format의 ACTIVE 최신)
 * }
 */
battleRouter.post('/session', async (req, res) => {
  const userId = String(req.body?.user_id || 'local-dev-user');
  const formatId = String(req.body?.format_id || 'gen9ou');

  const format = await prisma.format.findUnique({
    where: { formatId },
    select: { id: true, formatId: true, name: true },
  });
  if (!format) return res.status(404).json({ error: `format not found: ${formatId}` });

  let rulesetSnapshotId = String(req.body?.ruleset_snapshot_id || '');
  if (!rulesetSnapshotId) {
    const snap = await prisma.rulesetSnapshot.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!snap) return res.status(404).json({ error: 'No ruleset snapshot found' });
    rulesetSnapshotId = snap.id;
  }

  let statsVersionId = String(req.body?.stats_version_id || '');
  if (!statsVersionId) {
    const sv = await prisma.statsVersion.findFirst({
      where: { formatId: format.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (!sv) return res.status(404).json({ error: `No ACTIVE stats_version for ${formatId}` });
    statsVersionId = sv.id;
  }

  // users FK 충족: 없으면 생성 (users: id, email, display_name 필수)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@local.dev`,
      displayName: userId,
    },
  });

  const session = await prisma.battleSession.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      formatId: format.id, // formats.id (PK)
      rulesetSnapshotId,
      statsVersionId,
      updatedAt: now(),
    },
    select: {
      id: true,
      userId: true,
      formatId: true,
      rulesetSnapshotId: true,
      statsVersionId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({ session });
});

/**
 * GET /api/battle/session/:id
 * - 세션 + (가능하면) user/format/ruleset/stats + opponent slots + locked/banned moves
 *
 * 주의: prisma relation 이름이 다르면 include/select에서 에러날 수 있어서
 * 우선 "관계 없이" 안전하게 구성(필요한 건 따로 조회)으로 구현.
 */
battleRouter.get('/session/:id', async (req, res) => {
  const debugSlots = await prisma.battleOpponentSlot.findMany({
    take: 10,
  });
  console.log('DEBUG battleOpponentSlot sample:', debugSlots);
  const sessionId = String(req.params.id || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'session id required' });

  const session = await prisma.battleSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      formatId: true,
      rulesetSnapshotId: true,
      statsVersionId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!session) return res.status(404).json({ error: 'session not found' });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, displayName: true, createdAt: true },
  });

  const format = await prisma.format.findUnique({
    where: { id: session.formatId },
    select: { id: true, formatId: true, name: true, isActive: true, createdAt: true },
  });

  const ruleset = await prisma.rulesetSnapshot.findUnique({
    where: { id: session.rulesetSnapshotId },
    select: { id: true, snapshotDate: true, createdAt: true },
  });

  const stats = await prisma.statsVersion.findUnique({
    where: { id: session.statsVersionId },
    select: { id: true, formatId: true, month: true, status: true, createdAt: true },
  });

  const slots = await prisma.battleOpponentSlot.findMany({
    where: { sessionId },
    orderBy: { slot: 'asc' },
    select: { id: true, slot: true, speciesId: true, formId: true },
  });

  const slotIds = slots.map((s: any) => s.id);

  const moves = slotIds.length
    ? await prisma.battleOpponentMove.findMany({
      where: { slotId: { in: slotIds } },
      select: { id: true, slotId: true, moveId: true, status: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })
    : [];

  const movesBySlot: Record<string, Array<{ id: string; slotId: string; moveId: string; status: string; updatedAt: Date }>> = {};
  for (const m of moves) {
    if (!movesBySlot[m.slotId]) movesBySlot[m.slotId] = [];
    movesBySlot[m.slotId].push(m);
  }

  const slotsWithMoves = slots.map((s: any) => ({
    ...s,
    moves: movesBySlot[s.id] || [],
  }));

  return res.json({
    session,
    user,
    format,
    ruleset_snapshot: ruleset,
    stats_version: stats,
    opponent: { slots: slotsWithMoves },
  });
});

/**
 * POST /api/battle/opponent/slot
 * body:
 * {
 *   session_id: string,
 *   slot: 1|2|3,
 *   species_id: string,
 *   form_id?: string|null
 * }
 *
 * battle_opponent_slots: UNIQUE(session_id, slot)
 */
battleRouter.post('/opponent/slot', async (req, res) => {
  const sessionId = String(req.body?.session_id || '');
  const slot = Number(req.body?.slot);
  const speciesId = String(req.body?.species_id || '').trim();
  const formId = req.body?.form_id ?? null;

  if (!sessionId) return res.status(400).json({ error: 'session_id required' });
  if (![1, 2, 3, 4, 5, 6].includes(slot)) return res.status(400).json({ error: 'slot must be between 1 and 6' });
  if (!speciesId) return res.status(400).json({ error: 'species_id required (e.g. kingambit)' });

  const existing = await prisma.battleOpponentSlot.findFirst({
    where: { sessionId, slot },
    select: { id: true },
  });

  let row;

  if (existing) {
    // 슬롯이 바뀌면 그 슬롯에 저장된 LOCKED/BANNED는 무의미해지므로 삭제
    await prisma.battleOpponentMove.deleteMany({ where: { slotId: existing.id } });

    row = await prisma.battleOpponentSlot.update({
      where: { id: existing.id },
      data: { speciesId, formId },
    });
  } else {
    row = await prisma.battleOpponentSlot.create({
      data: { id: crypto.randomUUID(), sessionId, slot, speciesId, formId },
    });
  }

  return res.json({ slot: row });


  return res.json({ slot: row });
});

/**
 * POST /api/battle/opponent/move
 * body:
 * {
 *   slot_id: string,
 *   move_id: string,
 *   status: 'LOCKED'|'BANNED'  (default LOCKED)
 * }
 */
battleRouter.post('/opponent/move', async (req, res) => {
  const slotId = String(req.body?.slot_id || '');
  const moveId = String(req.body?.move_id || '').trim();
  const status = String(req.body?.status || 'LOCKED').toUpperCase();

  if (!slotId) return res.status(400).json({ error: 'slot_id required' });
  if (!moveId) return res.status(400).json({ error: 'move_id required (e.g. suckerpunch)' });
  if (!['LOCKED', 'BANNED'].includes(status)) {
    return res.status(400).json({ error: "status must be 'LOCKED' or 'BANNED'" });
  }

  const existing = await prisma.battleOpponentMove.findFirst({
    where: { slotId, moveId },
    select: { id: true },
  });

  const row = existing
    ? await prisma.battleOpponentMove.update({
      where: { id: existing.id },
      data: { status, updatedAt: now() },
    })
    : await prisma.battleOpponentMove.create({
      data: { id: crypto.randomUUID(), slotId, moveId, status, updatedAt: now() },
    });

  return res.json({ move: row });
});

/**
 * POST /api/battle/opponent/move/clear
 * body: { slot_id: string, move_id: string }
 * - 해당 슬롯의 특정 move LOCKED/BANNED 기록 삭제(해제)
 */
battleRouter.post('/opponent/move/clear', async (req, res) => {
  const slotId = String(req.body?.slot_id || '').trim();
  const moveId = String(req.body?.move_id || '').trim();
  if (!slotId) return res.status(400).json({ error: 'slot_id required' });
  if (!moveId) return res.status(400).json({ error: 'move_id required' });

  await prisma.battleOpponentMove.deleteMany({ where: { slotId, moveId } });
  return res.json({ ok: true });
});

/**
 * POST /api/battle/opponent/reset
 * body: { session_id: string }
 * - 세션의 opponent 슬롯/무브 전체 초기화
 */
battleRouter.post('/opponent/reset', async (req, res) => {
  const sessionId = String(req.body?.session_id || '').trim();
  if (!sessionId) return res.status(400).json({ error: 'session_id required' });

  const slots = await prisma.battleOpponentSlot.findMany({
    where: { sessionId },
    select: { id: true },
  });
  const slotIds = slots.map((s: { id: string }) => s.id);

  if (slotIds.length) {
    await prisma.battleOpponentMove.deleteMany({ where: { slotId: { in: slotIds } } });
  }
  await prisma.battleOpponentSlot.deleteMany({ where: { sessionId } });

  return res.json({ ok: true });
});
