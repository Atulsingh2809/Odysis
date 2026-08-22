import { describe, it, expect, vi } from 'vitest';
import { ZodError, z } from 'zod';
import { errorHandler } from './errorHandler.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { Request, Response, NextFunction } from 'express';

function mockRes() {
  const res = {
    statusCode: 200,
    body: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as unknown as NextFunction;

  it('maps AppError to structured JSON', () => {
    const res = mockRes();
    errorHandler(new NotFoundError('Trip not found', 'TRIP_NOT_FOUND'), req, res, next);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      success: false,
      message: 'Trip not found',
      code: 'TRIP_NOT_FOUND',
    });
  });

  it('maps unauthorized and forbidden', () => {
    const res1 = mockRes();
    errorHandler(new UnauthorizedError(), req, res1, next);
    expect(res1.statusCode).toBe(401);

    const res2 = mockRes();
    errorHandler(new ForbiddenError(), req, res2, next);
    expect(res2.statusCode).toBe(403);
  });

  it('maps ZodError to 400 VALIDATION_ERROR', () => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'nope' });
    expect(parsed.success).toBe(false);
    const res = mockRes();
    errorHandler(parsed.success ? new Error('unexpected') : (parsed.error as ZodError), req, res, next);
    expect(res.statusCode).toBe(400);
    expect((res.body as { code: string }).code).toBe('VALIDATION_ERROR');
  });
});
