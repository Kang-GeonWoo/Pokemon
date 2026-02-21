import { Router } from 'express';
import { prisma } from 'db';

export const metaRouter: Router = Router();

/**
 * GET /api/meta/ruleset/active
 * - ruleset_snapshots 최신 1개를 active로 간주
 */
metaRouter.get('/ruleset/active', async (_req, res) => {
  const snap = await prisma.rulesetSnapshot.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, snapshotDate: true, createdAt: true },
  });

  if (!snap) return res.status(404).json({ error: 'No ruleset snapshot found' });
  return res.json({ ruleset_snapshot_id: snap.id, snapshot_date: snap.snapshotDate, created_at: snap.createdAt });
});

/**
 * GET /api/meta/formats
 * - formats 목록
 */
metaRouter.get('/formats', async (_req, res) => {
  const formats = await prisma.format.findMany({
    where: { isActive: true },
    orderBy: { formatId: 'asc' },
    select: { id: true, formatId: true, name: true, isActive: true },
  });

  return res.json({ formats });
});

/**
 * GET /api/meta/stats/active?format_id=gen9ou
 * - stats_versions 중 ACTIVE 최신 1개
 */
metaRouter.get('/stats/active', async (req, res) => {
  const formatId = String(req.query.format_id || '').trim();
  if (!formatId) return res.status(400).json({ error: 'format_id required (e.g. gen9ou)' });

  const format = await prisma.format.findUnique({
    where: { formatId },
    select: { id: true, formatId: true, name: true },
  });
  if (!format) return res.status(404).json({ error: `format not found: ${formatId}` });

  const sv = await prisma.statsVersion.findFirst({
    where: { formatId: format.id, status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, formatId: true, month: true, status: true, createdAt: true },
  });

  if (!sv) return res.status(404).json({ error: `No ACTIVE stats_version for format_id=${formatId}` });

  return res.json({
    stats_version_id: sv.id,
    format_db_id: format.id,
    format_id: format.formatId,
    month: sv.month,
    status: sv.status,
    created_at: sv.createdAt,
  });
});
