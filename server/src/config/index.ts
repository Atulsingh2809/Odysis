import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.SERVER_PORT ?? '3001', 10),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  databaseUrl: requireEnv('DATABASE_URL', 'postgresql://globetrotter:globetrotter@localhost:5432/globetrotter?schema=public'),
  jwt: {
    secret: requireEnv('JWT_SECRET', 'dev-jwt-secret-change-in-production-min-32-chars'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production-min-32'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  authRateLimit: {
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX ?? '20', 10),
  },
  isDev: (process.env.NODE_ENV ?? 'development') !== 'production',
};
