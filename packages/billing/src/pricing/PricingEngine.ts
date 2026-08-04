import { BillingSourceEvent } from '@haspataal/db';

export interface PriceCatalogEntry {
  sourceEvent: BillingSourceEvent | string;
  unitPrice: number;
  taxRate: number;
}

export class PriceCatalog {
  // A basic hardcoded catalog for Phase 10A MVP
  // In Phase 10B/C this will be backed by a database model `HospitalServicePricing`
  private static readonly catalog: Record<string, PriceCatalogEntry> = {
    CONSULTATION_COMPLETED: {
      sourceEvent: 'CONSULTATION_COMPLETED',
      unitPrice: 500,
      taxRate: 0.05,
    },
    LAB_RESULT_VERIFIED: { sourceEvent: 'LAB_RESULT_VERIFIED', unitPrice: 300, taxRate: 0 },
    RADIOLOGY_COMPLETED: { sourceEvent: 'RADIOLOGY_COMPLETED', unitPrice: 1500, taxRate: 0.18 },
    MEDICATION_DISPENSED: { sourceEvent: 'MEDICATION_DISPENSED', unitPrice: 100, taxRate: 0.12 },
    PROCEDURE_COMPLETED: { sourceEvent: 'PROCEDURE_COMPLETED', unitPrice: 5000, taxRate: 0.18 },
  };

  public static getEntryForEvent(event: string): PriceCatalogEntry {
    const entry = this.catalog[event];
    if (!entry) {
      // Default fallback pricing for unknown events
      return { sourceEvent: event, unitPrice: 0, taxRate: 0 };
    }
    return entry;
  }
}

export class PricingEngine {
  /**
   * Calculates the pricing details based on the event and quantity.
   */
  public static calculatePrice(sourceEvent: string, quantity: number = 1) {
    const entry = PriceCatalog.getEntryForEvent(sourceEvent);

    const grossAmount = entry.unitPrice * quantity;
    const taxAmount = grossAmount * entry.taxRate;
    const discountAmount = 0; // Future enhancement: Apply DiscountPolicy here
    const netAmount = grossAmount + taxAmount - discountAmount;

    return {
      unitPrice: entry.unitPrice,
      quantity,
      grossAmount,
      taxAmount,
      discountAmount,
      netAmount,
    };
  }
}
