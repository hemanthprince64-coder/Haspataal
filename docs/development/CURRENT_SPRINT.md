---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Current Sprint: Phase 10 - Billing Engine

## Objective
Implement a billing system integrating with Laboratory, Radiology, and Pharmacy.

## Key Goals
- **Financial Treasury:** GST-compliant billing with HSN mapping.
- **Service Bundling:** Support for packages.
- **Automated Invoicing:** Prefix + Series sequencing.
- **Integration:** Trigger `BILL_GENERATED` domain event upon completion.

## Definition of Done
- Must pass `npm run test` and `npm run lint`.
- Must include DB migrations for `Bill` and `Invoice` entities.
- Must emit `BILL_GENERATED`.
- Must verify RLS scoping for multi-tenant isolation.
