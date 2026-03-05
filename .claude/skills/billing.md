# Skill: Billing & Revenue Management

## Overview
End-to-end billing system covering OPD/IPD billing, diagnostic pricing, and platform commission management.

## Components

### OPD/IPD Billing
- Visit-based billing for outpatient and inpatient services
- Itemized charges linked to visits
- Support for packages and bundled pricing

### Diagnostic Pricing
- Hospital-specific pricing via `hospital_diagnostic_pricing`
- Panel pricing via `hospital_panel_pricing`
- Diagnostic orders generate billable items

### Commission Management
- Platform commission calculated per appointment/service
- Commission rates configurable per hospital
- Settlement reports for admin dashboard

### Invoice Generation
- Auto-generated invoices post-visit
- PDF export capability
- GST/tax calculation support

### Revenue Analytics
- Hospital-level revenue dashboards
- Platform-wide revenue metrics for admin
- Date-range filtering and comparison

## Billing Flow
```
Service rendered → Visit record created
    → Charges calculated (fees + diagnostics + commissions)
    → Invoice generated
    → Payment processed
    → Settlement to hospital (minus commission)
    → Audit log entry
```

## Related Files
- `app/(hospital)/hospital/dashboard/billing/` — Hospital billing UI
- `prisma/schema.prisma` — Visit, DiagnosticOrder, DiagnosticOrderItem models
- `haspataal-in/` — Provider-side billing management
