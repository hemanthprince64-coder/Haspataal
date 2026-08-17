import { Prisma } from '@haspataal/db';
import { describe, it, expect } from 'vitest';

import { Money, CurrencyMismatchError } from '../pricing/Money';

describe('Money Value Object', () => {
  it('correctly adds and subtracts within the same currency', () => {
    const m1 = new Money(500, 'INR');
    const m2 = new Money(250, 'inr'); // test case insensitivity in constructor

    const sum = m1.add(m2);
    expect(sum.toNumber()).toBe(750);
    expect(sum.currency).toBe('INR');

    const diff = m1.subtract(m2);
    expect(diff.toNumber()).toBe(250);
  });

  it('rejects cross-currency operations', () => {
    const m1 = new Money(500, 'INR');
    const m2 = new Money(50, 'USD');

    expect(() => m1.add(m2)).toThrow(CurrencyMismatchError);
    expect(() => m1.subtract(m2)).toThrow(CurrencyMismatchError);
    expect(() => m1.compare(m2)).toThrow(CurrencyMismatchError);
  });

  it('correctly compares money', () => {
    const m1 = new Money(100);
    const m2 = new Money(200);
    const m3 = new Money(100);

    expect(m1.compare(m2)).toBe(-1);
    expect(m2.compare(m1)).toBe(1);
    expect(m1.compare(m3)).toBe(0);
    expect(m1.equals(m3)).toBe(true);
    expect(m1.equals(m2)).toBe(false);
  });

  it('allocates correctly with remainder', () => {
    const total = new Money(100);
    // Allocate 1:1:1 -> 33.33, 33.33, 33.33 -> sum = 99.99
    // Remainder is 0.01 -> added to first -> 33.34
    const shares = total.allocate([1, 1, 1]);

    expect(shares[0].toNumber()).toBe(33.34);
    expect(shares[1].toNumber()).toBe(33.33);
    expect(shares[2].toNumber()).toBe(33.33);

    const sum = shares[0].add(shares[1]).add(shares[2]);
    expect(sum.equals(total)).toBe(true);
  });
});
