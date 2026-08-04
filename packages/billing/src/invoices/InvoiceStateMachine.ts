export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
}

export class InvoiceStateMachine {
  private static readonly VALID_TRANSITIONS: Record<InvoiceStatus, Set<InvoiceStatus>> = {
    [InvoiceStatus.DRAFT]: new Set([InvoiceStatus.ISSUED, InvoiceStatus.VOIDED]),
    [InvoiceStatus.ISSUED]: new Set([
      InvoiceStatus.PARTIALLY_PAID,
      InvoiceStatus.PAID,
      InvoiceStatus.VOIDED,
    ]),
    [InvoiceStatus.PARTIALLY_PAID]: new Set([InvoiceStatus.PAID, InvoiceStatus.VOIDED]),
    [InvoiceStatus.PAID]: new Set([]), // Terminal state for now (refunds out of scope for 10A)
    [InvoiceStatus.VOIDED]: new Set([]), // Terminal state
  };

  /**
   * Checks if a transition from currentStatus to nextStatus is valid.
   */
  public static isValidTransition(
    currentStatus: InvoiceStatus,
    nextStatus: InvoiceStatus,
  ): boolean {
    return this.VALID_TRANSITIONS[currentStatus].has(nextStatus);
  }

  /**
   * Asserts that a transition is valid, throwing an error if it is not.
   */
  public static assertValidTransition(
    currentStatus: InvoiceStatus,
    nextStatus: InvoiceStatus,
  ): void {
    if (!this.isValidTransition(currentStatus, nextStatus)) {
      throw new Error(`Invalid invoice state transition from ${currentStatus} to ${nextStatus}`);
    }
  }
}
