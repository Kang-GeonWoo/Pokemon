import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Force load the root .env file so Prisma can find DATABASE_URL
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { metaRouter } from './routes/meta';
import { battleRouter } from './routes/battle';
import { predictRouter } from './routes/predict';
import metadataRouter from './routes/metadata';
import { authRouter } from './routes/auth';
import { Application } from 'express';

const app: Application = express();

// CORS: 웹(3000) 및 프로덕션(Vercel) 도메인 허용
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(
  cors({
    origin: function (origin, callback) {
      // origin이 없거나(서버 간 통신 등) 허용된 도메인인 경우 승인
      // 사용자가 CORS_ORIGIN 환경변수에 https:// 를 누락하고 적었을 경우를 방어합니다.
      const isAllowed = !origin || allowedOrigins.some(allowed =>
        origin === allowed || origin === `https://${allowed}` || origin === `http://${allowed}`
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        console.error(`[CORS Blocked] Unauthorized origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.use('/api/meta', metaRouter);
app.use('/api/battle', battleRouter);
app.use('/api/predict', predictRouter);
app.use('/api/metadata', metadataRouter);
app.use('/api/auth', authRouter);

export default app;
