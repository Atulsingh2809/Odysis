import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from '../config/index.js';
import type { AuthPayload } from '../middleware/auth.js';

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function generateRefreshToken(): string {
  return nanoid(64);
}

export function generateShareToken(): string {
  return nanoid(21);
}

export function generateResetToken(): string {
  return nanoid(32);
}

export function parseExpiresIn(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * multipliers[unit]);
}

export function success<T>(res: import('express').Response, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function paginated<T>(
  res: import('express').Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  });
}
