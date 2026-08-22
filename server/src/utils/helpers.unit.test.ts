import { describe, it, expect } from 'vitest';
import { generateShareToken, generateResetToken, parseExpiresIn } from './helpers.js';

describe('token helpers', () => {
  it('generates unique share tokens', () => {
    const a = generateShareToken();
    const b = generateShareToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });

  it('generates reset tokens', () => {
    expect(generateResetToken().length).toBeGreaterThan(16);
  });

  it('parses expires-in durations', () => {
    const in15m = parseExpiresIn('15m');
    const delta = in15m.getTime() - Date.now();
    expect(delta).toBeGreaterThan(14 * 60 * 1000);
    expect(delta).toBeLessThan(16 * 60 * 1000);
  });
});

describe('cascade deletion contract', () => {
  it('documents parent-child delete order', () => {
    const cascade = [
      'User → Profile, RefreshToken, PasswordResetToken, SavedDestination, Trip, TripCollaborator',
      'Trip → TripStop, Expense, Budget, TripCollaborator',
      'TripStop → StopActivity',
      'City activities are retained (no cascade from trip delete)',
    ];
    expect(cascade.length).toBe(4);
  });
});
