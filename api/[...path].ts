import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const tmpDbPath = '/tmp/dev.db';
const sourceDbPath = path.join(rootDir, 'server', 'prisma', 'dev.db');

// Ensure writable database file in Vercel Serverless AWS Lambda (/tmp environment)
if (fs.existsSync('/tmp')) {
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
    try {
      fs.copyFileSync(sourceDbPath, tmpDbPath);
    } catch (err) {
      console.error('Failed to copy seeded database to /tmp:', err);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${sourceDbPath}`;
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'globetrotter-production-jwt-secret-key-2026';
}
if (!process.env.JWT_REFRESH_SECRET) {
  process.env.JWT_REFRESH_SECRET = 'globetrotter-production-jwt-refresh-secret-key-2026';
}

import { createApp } from '../server/src/app.js';

const app = createApp();

export default function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  return app(req, res);
}
