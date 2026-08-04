import { describe, it, expect } from 'vitest';

import { InvoiceStateMachine, InvoiceStatus } from '../invoices/InvoiceStateMachine';
import { PricingEngine } from '../pricing/PricingEngine';

describe('InvoiceStateMachine', () => {
  it('should allow valid transitions', () => {
    expect(InvoiceStateMachine.isValidTransition(InvoiceStatus.DRAFT, InvoiceStatus.ISSUED)).toBe(
      true,
    );
    expect(
      InvoiceStateMachine.isValidTransition(InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID),
    ).toBe(true);
    expect(InvoiceStateMachine.isValidTransition(InvoiceStatus.ISSUED, InvoiceStatus.PAID)).toBe(
      true,
    );
    expect(
      InvoiceStateMachine.isValidTransition(InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID),
    ).toBe(true);
  });

  it('should deny invalid transitions', () => {
    expect(InvoiceStateMachine.isValidTransition(InvoiceStatus.PAID, InvoiceStatus.DRAFT)).toBe(
      false,
    );
    expect(InvoiceStateMachine.isValidTransition(InvoiceStatus.ISSUED, InvoiceStatus.DRAFT)).toBe(
      false,
    );
    expect(InvoiceStateMachine.isValidTransition(InvoiceStatus.VOIDED, InvoiceStatus.ISSUED)).toBe(
      false,
    );
  });

  it('should throw on invalid transitions in assert mode', () => {
    expect(() => {
      InvoiceStateMachine.assertValidTransition(InvoiceStatus.PAID, InvoiceStatus.DRAFT);
    }).toThrow(/Invalid invoice state transition/);
  });
});

describe('PricingEngine', () => {
  it('should deterministically calculate price for CONSULTATION_COMPLETED', () => {
    const result = PricingEngine.calculatePrice('CONSULTATION_COMPLETED', 1);
    expect(result.unitPrice).toBe(500);
    expect(result.quantity).toBe(1);
    expect(result.grossAmount).toBe(500);
    expect(result.taxAmount).toBe(25); // 500 * 0.05
    expect(result.netAmount).toBe(525);
  });

  it('should deterministically calculate price with quantity multiplier', () => {
    const result = PricingEngine.calculatePrice('MEDICATION_DISPENSED', 3);
    expect(result.unitPrice).toBe(100);
    expect(result.quantity).toBe(3);
    expect(result.grossAmount).toBe(300);
    expect(result.taxAmount).toBe(36); // 300 * 0.12
    expect(result.netAmount).toBe(336);
  });
});
