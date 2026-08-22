import path from 'path';
import { fileURLToPath } from 'url';

// Set environment defaults for Vercel Serverless Function runtime
if (!process.env.DATABASE_URL) {
  const rootDir = process.cwd();
  process.env.DATABASE_URL = `file:${path.join(rootDir, 'server', 'prisma', 'dev.db')}`;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'globetrotter-production-jwt-secret-key-2026';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'globetrotter-production-jwt-refresh-secret-key-2026';
}

import { createApp } from '../server/src/app.js';

const app = createApp();

export default app;
