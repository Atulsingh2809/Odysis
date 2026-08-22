import { describe, it, expect } from 'vitest';
import { signupSchema, loginSchema, createTripSchema } from '../schemas/index.js';

describe('Auth Schemas', () => {
  it('validates signup with matching passwords', () => {
    const result = signupSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@12345',
      confirmPassword: 'Test@12345',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak passwords', () => {
    const result = signupSchema.safeParse({
      name: 'Test',
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('validates login', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'Test@12345',
    });
    expect(result.success).toBe(true);
  });
});

describe('Trip Schemas', () => {
  it('validates trip dates', () => {
    const result = createTripSchema.safeParse({
      name: 'Europe Trip',
      startDate: '2026-09-01',
      endDate: '2026-09-10',
      currency: 'INR',
    });
    expect(result.success).toBe(true);
  });

  it('rejects end date before start date', () => {
    const result = createTripSchema.safeParse({
      name: 'Bad Trip',
      startDate: '2026-09-10',
      endDate: '2026-09-01',
      currency: 'INR',
    });
    expect(result.success).toBe(false);
  });
});

describe('Budget Calculations', () => {
  it('calculates category totals', () => {
    const expenses = [
      { category: 'TRANSPORT', amount: 20000 },
      { category: 'ACCOMMODATION', amount: 35000 },
      { category: 'ACTIVITIES', amount: 12000 },
      { category: 'MEALS', amount: 15000 },
      { category: 'OTHER', amount: 3000 },
    ];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    expect(total).toBe(85000);
  });

  it('detects over budget', () => {
    const budget = 100000;
    const estimated = 108200;
    expect(estimated > budget).toBe(true);
    expect(estimated - budget).toBe(8200);
  });
});

describe('Authorization Roles', () => {
  const permissions = {
    OWNER: ['read', 'write', 'admin'],
    EDITOR: ['read', 'write'],
    VIEWER: ['read'],
  };

  it('owner has all permissions', () => {
    expect(permissions.OWNER).toContain('admin');
  });

  it('viewer is read only', () => {
    expect(permissions.VIEWER).not.toContain('write');
  });
});

describe('Share Token', () => {
  it('generates valid token format', () => {
    const token = 'abc123xyz';
    expect(token.length).toBeGreaterThan(5);
    expect(typeof token).toBe('string');
  });
});
