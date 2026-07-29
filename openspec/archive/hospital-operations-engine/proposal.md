## Why

Hospital operations are critical for running a real hospital. After consultation, the system must handle laboratory, radiology, pharmacy, billing, admission, ward, nursing, procedures, OT, ICU, discharge, and medical records workflows. This transforms Haspataal from OPD-only to a complete HMS.

## What Changes

- **New Services**: Laboratory, Radiology, Pharmacy, Billing, Admission, Ward, Nursing, OT, ICU modules
- **New APIs**: Endpoints for each operational module
- **New Workflows**: Complete end-to-end hospital workflows
- **Event Publishing**: All clinical and operational events
- **RLS Updates**: New policies for each module

## Capabilities

### New Capabilities
- `master-data` - ICD-10, SNOMED, LOINC, Drug, Investigation masters
- `laboratory-system` - Lab catalog, sample collection, processing, reporting
- `radiology-system` - Radiology orders, scheduling, DICOM, reporting
- `pharmacy-system` - Drug inventory, purchase, dispensing, audit
- `ipd-admission` - Admission, bed allocation, ward transfer
- `ward-management` - Bed dashboard, occupancy, nursing station
- `nursing-module` - Nursing notes, MAR, shift handover, vitals
- `operation-theatre` - OT scheduling, checklists, surgery notes
- `icu-module` - Critical care, ventilator data, scoring systems
- `billing-engine` - Dynamic billing, packages, insurance, refunds
- `insurance-tpa` - Verification, authorization, claims, settlement
- `medical-records` - EMR, document management, timeline, OCR
- `discharge-workflow` - Discharge summary, medication list, follow-up

## Impact

**APIs**: New endpoints for all operational modules
**Database**: New tables for lab, radio, pharmacy, IPD, OT, ICU
**Events**: All workflow events published to event bus
**Security**: RLS policies for multi-tenant access
**Integration**: Connects through existing services