# Haspataal Financial Invariants

These invariants represent the core non-negotiable rules for the Haspataal Financial and Billing bounded context. They must be enforced at the Aggregate Root and Database boundaries at all times.

1. **ChargeItems are immutable after creation.**
   Once a `ChargeItem` is created from a clinical event, it cannot be modified. Any changes must be done by voiding and creating a new charge or issuing an adjustment.

2. **Invoice totals are sums of ChargeItems only.**
   An `Invoice` never calculates its own prices using external business logic. Totals are derived strictly by summing `netAmount`, `discountAmount`, and `gstAmount` of the locked `ChargeItems`.

3. **Payments never modify invoices directly.**
   When a payment is made, it creates a `BillingPayment` (or `PaymentIntent` -> `Payment`). The `Invoice` balance may reflect this through joins or materialized views, but the payment itself is an independent, append-only record.

4. **Refunds create new financial records.**
   If money needs to be returned, it must not mutate the original payment to negative. A new `Refund` record must be created, tied to the original transaction.

5. **Adjustments never overwrite history.**
   If an invoice balance is written off, modified, or discounted post-issuance, it is done via an `Adjustment` record. The original `Invoice` snapshot remains identical.

6. **All money movements are append-only.**
   Double-entry accounting principles apply. Never update rows to change a financial transaction state in a way that destroys the prior value.

7. **Every financial event is auditable.**
   Actions like `INVOICE_GENERATED`, `INVOICE_PRINTED`, and `PAYMENT_INITIATED` must produce a `BillingAudit` record with IP, user-agent, and device-id metadata for dispute resolution.

8. **Every financial record is tenant-scoped.**
   Every `Invoice`, `ChargeItem`, and `Payment` MUST carry the `hospitalId`. Row-Level Security (RLS) policies strictly enforce tenant isolation.

9. **Financial aggregates are deterministic.**
   Given a set of `ChargeItems`, generating an `Invoice` must always produce the identical resulting totals, regardless of time elapsed or who generated it.

10. **Invoice snapshots are immutable forever.**
    At the moment of issuance, an `Invoice` embeds a permanent JSON snapshot of `hospital`, `patient`, `doctor`, `encounter`, `pricing`, and `lineItems`. If the hospital changes its GST number tomorrow, yesterday's invoice must render with yesterday's GST number.

11. **Creating a PaymentIntent reserves the right to collect an amount; it does not represent receipt of money.**
    A `PaymentIntent` calculates and claims an available portion of the `Invoice` balance to prevent double-charging, but the invoice is not considered paid until the intent reaches `CAPTURED` and a `PaymentAllocation` is created.

12. **Allocations are immutable.**
    `PaymentAllocation` acts as a ledger. Once an allocation is made, it cannot be modified or deleted, only REVERSED.

13. **Allocated Amount <= Payment Remaining Amount.**
    A `Payment` can never be over-allocated. The sum of all allocations for a payment must not exceed the payment's original amount.

14. **Allocated Amount <= Invoice Outstanding Balance.**
    An `Invoice` can never be over-allocated. The invoice balance must never become negative.

15. **Payments cannot be allocated after refund or void.**
    A `Payment` must be in a valid `CAPTURED` state to be allocated.

16. **Currencies must match.**
    The currency of the `Payment` and `Invoice` must match, unless explicit FX engines exist.

17. **Allocations must be idempotent.**
    Duplicate allocations (e.g. from retried webhooks) must be caught using an idempotency key.

18. **Allocations never edit historical invoices or ChargeItems.**
    The ledger only applies the allocated amount towards the balance.

19. **Every allocation publishes a versioned accounting event.**
    e.g. `PAYMENT_ALLOCATED`, `PAYMENT_PARTIALLY_ALLOCATED`.
