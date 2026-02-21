// apps/api/src/index.ts
import app from './app';

const PORT = Number(process.env.PORT || 3001);

process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Fatal Error] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000 (default)'}`);
});
