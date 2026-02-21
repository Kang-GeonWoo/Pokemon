import axios from 'axios';
import { prisma, StatsStatus } from 'db';
import { toId } from './utils';
import path from 'path';
import dotenv from 'dotenv';
import zlib from 'zlib';

// Load root .env (E:\kang.geonwoo\pokemon\.env)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SMOGON_STATS_INDEX = 'https://www.smogon.com/stats/';

type ChaosData = {
  info?: any;
  data?: Record<string, any>;
};

// 최신 월(YYYY-MM) 폴더 찾기
async function getLatestMonths(limit = 6): Promise<string[]> {
  const res = await axios.get(SMOGON_STATS_INDEX, { responseType: 'text' });
  const html = res.data as string;

  // 예: 2025-02/
  const matches = [...html.matchAll(/href="(\d{4}-\d{2})\/"/g)].map(m => m[1]);
  const uniq = Array.from(new Set(matches)).sort(); // 오름차순
  uniq.reverse(); // 최신이 앞으로

  return uniq.slice(0, limit);
}

// chaos json.gz 다운로드 + gunzip + JSON parse
async function tryFetchChaosJsonGz(month: string, formatId: string, cutoff: number): Promise<ChaosData | null> {
  const url = `https://www.smogon.com/stats/${month}/chaos/${formatId}-${cutoff}.json.gz`;
  console.log(`Trying: ${url}`);

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    validateStatus: () => true,
  });

  if (res.status !== 200) return null;

  const buf = Buffer.from(res.data);
  const jsonText = zlib.gunzipSync(buf as any).toString('utf8');
  const parsed = JSON.parse(jsonText);
  return parsed as ChaosData;
}

async function fetchStatsForFormat(formatId: string) {
  // 1) DB에서 format 존재 확인 (fetch-rules 먼저 성공했어야 함)
  const format = await prisma.format.findUnique({
    where: { formatId },
  });

  if (!format) {
    console.warn(`Format ${formatId} not found in DB. run fetch:rules first.`);
    return;
  }

  // 2) 최신 month들 중에서 찾기
  const months = await getLatestMonths(12);

  // OU는 1695를 우선으로 시도 (없으면 다른 컷도 시도)
  const cutoffs = formatId === 'gen9ou'
    ? [1695, 1825, 1500, 0]
    : [0, 1500, 1630, 1760];

  let foundMonth: string | null = null;
  let chaos: ChaosData | null = null;
  let foundCutoff: number | null = null;

  for (const month of months) {
    for (const cutoff of cutoffs) {
      const data = await tryFetchChaosJsonGz(month, formatId, cutoff);
      if (data?.data && Object.keys(data.data).length > 0) {
        foundMonth = month;
        chaos = data;
        foundCutoff = cutoff;
        break;
      }
    }
    if (chaos) break;
  }

  if (!chaos || !foundMonth || foundCutoff === null) {
    console.warn(`No stats found for ${formatId} within latest months. Skipping.`);
    return;
  }

  console.log(`FOUND stats: format=${formatId}, month=${foundMonth}, cutoff=${foundCutoff}`);

  // 3) StatsVersion upsert
  const statsVersion = await prisma.statsVersion.upsert({
    where: {
      formatId_month: {
        formatId: format.id,   // formats.id (PK)
        month: foundMonth,     // YYYY-MM
      },
    },
    update: {},
    create: {
      formatId: format.id,
      month: foundMonth,
      status: StatsStatus.STAGING,
    },
  });

  // 4) Insert usage rows
  const pokemonData = chaos.data!;
  const speciesNames = Object.keys(pokemonData);

  // 간단 QC 기준
  const MIN_POKEMON_COUNT = 50;

  // 기존 데이터가 있을 수 있으니, 같은 statsVersionId의 하위 테이블을 먼저 정리(중복 방지)
  // (가장 단순하고 안전한 방식)
  await prisma.moveUsage.deleteMany({ where: { statsVersionId: statsVersion.id } });
  await prisma.itemUsage.deleteMany({ where: { statsVersionId: statsVersion.id } });
  await prisma.pokemonUsage.deleteMany({ where: { statsVersionId: statsVersion.id } });

  // usage 기준 정렬(없으면 0)
  const sorted = speciesNames.sort((a, b) => {
    const au = pokemonData[a]?.usage ?? 0;
    const bu = pokemonData[b]?.usage ?? 0;
    return bu - au;
  });

  let rank = 1;

  for (const speciesName of sorted) {
    const pData = pokemonData[speciesName];
    const speciesId = toId(speciesName);
    const formId = null;

    await prisma.pokemonUsage.create({
      data: {
        statsVersionId: statsVersion.id,
        speciesId,
        formId,
        usageRank: rank++,
        usageRate: pData.usage ?? 0,
        rawJson: pData,
      },
    });

    // Moves (상위 50개)
    const movesObj = pData?.Moves;
    if (movesObj && typeof movesObj === 'object') {
      const moves = Object.keys(movesObj)
        .map(name => ({ name, prob: movesObj[name] }))
        .sort((x, y) => (y.prob ?? 0) - (x.prob ?? 0))
        .slice(0, 50);

      for (const mv of moves) {
        await prisma.moveUsage.create({
          data: {
            statsVersionId: statsVersion.id,
            speciesId,
            formId,
            moveId: toId(mv.name),
            probability: mv.prob ?? 0,
          },
        });
      }
    }

    // Items (상위 10개)
    const itemsObj = pData?.Items;
    if (itemsObj && typeof itemsObj === 'object') {
      const items = Object.keys(itemsObj)
        .map(name => ({ name, prob: itemsObj[name] }))
        .sort((x, y) => (y.prob ?? 0) - (x.prob ?? 0))
        .slice(0, 10);

      for (const it of items) {
        await prisma.itemUsage.create({
          data: {
            statsVersionId: statsVersion.id,
            speciesId,
            formId,
            itemId: toId(it.name),
            probability: it.prob ?? 0,
          },
        });
      }
    }
  }

  console.log(`Inserted pokemon_usage for ${sorted.length} species.`);

  // 5) QC + 승격
  if (sorted.length >= MIN_POKEMON_COUNT) {
    await prisma.statsVersion.update({
      where: { id: statsVersion.id },
      data: { status: StatsStatus.ACTIVE },
    });
    console.log(`QC PASS -> StatsVersion ACTIVE (${foundMonth})`);
  } else {
    console.warn(`QC FAIL -> keep STAGING (${sorted.length} < ${MIN_POKEMON_COUNT})`);
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is missing. Check E:\\kang.geonwoo\\pokemon\\.env');
    process.exit(1);
  }

  // 여러 주요 포맷에서 데이터를 긁어옵니다.
  const TARGET_FORMATS = [
    'gen9ou',
    'gen9ubers',
    'gen9vgc2024regf',
    'gen9nationaldex',
    'gen9doublesou'
  ];

  for (const fmt of TARGET_FORMATS) {
    await fetchStatsForFormat(fmt);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
