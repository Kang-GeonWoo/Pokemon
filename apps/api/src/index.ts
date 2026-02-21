// apps/api/src/index.ts
import app from './app';

const PORT = Number(process.env.PORT || 3001);

process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

import { prisma } from 'db';

app.listen(PORT, async () => {
  console.log(`\n============================`);
  console.log(`🚀 Server starting...`);
  console.log(`============================`);
  console.log(`[ENV] PORT: ${PORT}`);
  console.log(`[ENV] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[ENV] CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'Not Set'}`);
  console.log(`[ENV] DATABASE_URL Exists: ${!!process.env.DATABASE_URL}`);
  console.log(`[ENV] DIRECT_URL Exists: ${!!process.env.DIRECT_URL}`);

  try {
    await prisma.$connect();
    console.log(`✅ Prisma DB connected successfully.`);
  } catch (error) {
    console.error(`❌ Prisma DB connection failed:`, error);
    process.exit(1); // Exit if DB fails to connect on startup
  }

  console.log(`🚀 API Server is fully live on port ${PORT}`);
  console.log(`============================\n`);
});
