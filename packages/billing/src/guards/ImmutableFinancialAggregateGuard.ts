export class ImmutableFinancialAggregateGuard {
  /**
   * Asserts that the financial record (e.g. Invoice, ChargeItem) is in a mutable state.
   * If it has been issued, finalized, or voided, it throws an error.
   */
  static assertMutable(status: string, resourceName: string = 'Financial record') {
    const immutableStates = ['ISSUED', 'INVOICED', 'FINALIZED', 'VOIDED', 'PAID', 'PARTIALLY_PAID'];
    if (immutableStates.includes(status)) {
      throw new Error(
        `ImmutableStateError: ${resourceName} cannot be modified because it is in '${status}' state.`,
      );
    }
  }

  /**
   * Asserts that the financial record is in a state where it can accept payments.
   */
  static assertPayable(status: string) {
    const payableStates = ['ISSUED', 'PARTIALLY_PAID'];
    if (!payableStates.includes(status)) {
      throw new Error(
        `InvalidStateError: Cannot process payments for a record in '${status}' state. Must be 'ISSUED' or 'PARTIALLY_PAID'.`,
      );
    }
  }

  /**
   * Asserts that the financial record is in a state where it can be voided.
   */
  static assertVoidable(status: string) {
    // Only records that have not received actual money should be trivially voidable.
    // If it's PAID or PARTIALLY_PAID, a refund + credit note process should be used.
    const voidableStates = ['DRAFT', 'UNBILLED', 'ISSUED'];
    if (!voidableStates.includes(status)) {
      throw new Error(`InvalidStateError: Cannot directly void a record in '${status}' state.`);
    }
  }
}
