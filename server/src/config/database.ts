import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:.')) {
  const rootDir = process.cwd();
  const serverDbFile = path.resolve(rootDir, 'server/prisma/dev.db');
  const rootDbFile = path.resolve(rootDir, 'prisma/dev.db');
  if (fs.existsSync(serverDbFile)) {
    process.env.DATABASE_URL = `file:${serverDbFile}`;
  } else if (fs.existsSync(rootDbFile)) {
    process.env.DATABASE_URL = `file:${rootDbFile}`;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
