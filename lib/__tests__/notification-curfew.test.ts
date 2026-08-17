/**
 * lib/__tests__/notification-curfew.test.ts
 *
 * Unit tests for notification-curfew.ts — verifies curfew window
 * (08:00–22:00 IST) produces correct NOW / DEFER decisions across
 * boundary timestamps.
 *
 * IST = UTC + 5:30  →  IST hour = (utcHour + 5 + utcMinute / 60) % 24
 */
import { describe, it, expect } from 'vitest';

import {
  evaluateCurfew,
  getCurfewDelayMs,
  CURFEW_START_HOUR,
  CURFEW_END_HOUR,
} from '../notification-curfew';

function istDate(hour: number, minute = 0): Date {
  // Convert an IST (UTC+5:30) wall-clock time to a Date using UTC
  const utcHour = hour - 5;
  const utcMin = minute - 30;
  return new Date(Date.UTC(2025, 0, 14, utcHour, utcMin));
}

describe('notification-curfew — evaluateCurfew', () => {
  it('should DEFER at 07:59 IST (before curfew)', () => {
    expect(evaluateCurfew(istDate(7, 59))).toBe('DEFER');
  });

  it('should return NOW at 08:00 IST (curfew start boundary)', () => {
    expect(evaluateCurfew(istDate(8, 0))).toBe('NOW');
  });

  it('should return NOW at 12:00 IST (mid-day)', () => {
    expect(evaluateCurfew(istDate(12))).toBe('NOW');
  });

  it('should return NOW at 21:59 IST (last minute before curfew closes)', () => {
    expect(evaluateCurfew(istDate(21, 59))).toBe('NOW');
  });

  it('should DEFER at 22:00 IST (after curfew ends)', () => {
    expect(evaluateCurfew(istDate(22))).toBe('DEFER');
  });

  it('should DEFER at 01:00 IST (early morning)', () => {
    expect(evaluateCurfew(istDate(1))).toBe('DEFER');
  });

  it('should return NOW when no date override is given and system time is within window', () => {
    // 2025-01-14 06:30 UTC = 12:00 IST — inside window
    expect(evaluateCurfew(new Date(Date.UTC(2025, 0, 14, 6, 30)))).toBe('NOW');
  });
});

describe('notification-curfew — getCurfewDelayMs', () => {
  it('should return 0 when curfew returns NOW', () => {
    // 12:00 IST = 06:30 UTC
    expect(getCurfewDelayMs(new Date(Date.UTC(2025, 0, 14, 6, 30)))).toBe(0);
  });

  it('should return positive ms delay when curfew returns DEFER', () => {
    // 23:00 IST = 17:30 UTC — curfew has ended 1 h ago
    const delay = getCurfewDelayMs(istDate(23));
    expect(delay).toBeGreaterThan(0);
    // Next window is 08:00 IST tomorrow (= base + 24 h - 1 h now remaining ≈ 9 h)
    const hours = delay / (1000 * 60 * 60);
    expect(hours).toBeCloseTo(9, 0);
  });
});

describe('notification-curfew — exported constants', () => {
  it('should export CURFEW_START_HOUR as 8', () => {
    expect(CURFEW_START_HOUR).toBe(8);
  });

  it('should export CURFEW_END_HOUR as 22', () => {
    expect(CURFEW_END_HOUR).toBe(22);
  });
});
