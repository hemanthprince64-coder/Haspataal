## 1. Master Data

- [x] 1.1 Create ICD-10 master table with codes and descriptions
- [x] 1.2 Create LOINC investigation codes table
- [x] 1.3 Create SNOMED CT concepts table (structure ready)
- [x] 1.4 Create Drug master with generic/brand mappings
- [x] 1.5 Create Investigation master with reference ranges
- [x] 1.6 Create Radiology master with modalities
- [x] 1.7 Create Procedure master with consumables
- [x] 1.8 Create Vaccine master
- [x] 1.9 Create Allergy master
- [x] 1.10 Create Clinical templates

## 2. Laboratory System

- [x] 2.1 Create LabOrder and LabOrderItem tables
- [x] 2.2 Implement sample collection barcode generation
- [x] 2.3 Create lab processing workflow
- [x] 2.4 Add critical value alerts
- [x] 2.5 Implement report generation
- [ ] 2.6 Add digital signature for pathologist
- [ ] 2.7 Integrate with timeline
- [ ] 2.8 Add notification integration

## 3. Pharmacy System

- [ ] 3.1 Create DrugStock, PurchaseOrder tables
- [ ] 3.2 Implement stock level tracking
- [ ] 3.3 Add purchase order generation
- [ ] 3.4 Create dispensing workflow
- [ ] 3.5 Add drug interaction checks
- [ ] 3.6 Implement expiry tracking
- [ ] 3.7 Add inventory audit
- [ ] 3.8 Connect to billing

## 4. IPD Admission

- [ ] 4.1 Create Admission table
- [ ] 4.2 Implement bed allocation service
- [ ] 4.3 Add admission consent capture
- [ ] 4.4 Create ward transfer workflow
- [ ] 4.5 Add expected discharge tracking
- [ ] 4.6 Integrate with billing

## 5. Ward Management

- [ ] 5.1 Create Bed dashboard API
- [ ] 5.2 Implement occupancy tracking
- [ ] 5.3 Add cleaning status
- [ ] 5.4 Create isolation room support
- [ ] 5.5 Add ward analytics

## 6. Nursing Module

- [ ] 6.1 Create NursingNote and MAR tables
- [ ] 6.2 Implement medication schedule
- [ ] 6.3 Add IV fluids tracking
- [ ] 6.4 Create shift handover
- [ ] 6.5 Add vitals charting
- [ ] 6.6 Implement escalation alerts

## 7. Operation Theatre

- [ ] 7.1 Create OT scheduling system
- [ ] 7.2 Implement WHO checklist
- [ ] 7.3 Add surgeon assignment
- [ ] 7.4 Create operation notes
- [ ] 7.5 Add recovery tracking

## 8. ICU/NICU/PICU

- [ ] 8.1 Create critical care dashboard
- [ ] 8.2 Implement ventilator data
- [ ] 8.3 Add scoring systems (APACHE, PRISM, PELOD)
- [ ] 8.4 Create infusion tracking
- [ ] 8.5 Add critical alerts

## 9. Billing Engine 2.0

- [ ] 9.1 Create dynamic billing service
- [ ] 9.2 Implement package billing
- [ ] 9.3 Add insurance workflows
- [ ] 9.4 Create refund processing
- [ ] 9.5 Add credit notes
- [ ] 9.6 Implement revenue analytics

## 10. Insurance & TPA

- [ ] 10.1 Create InsuranceVerification workflow
- [ ] 10.2 Implement claim submission
- [ ] 10.3 Add claim tracking
- [ ] 10.4 Create settlement dashboard

## 11. Medical Records

- [ ] 11.1 Create EMR complete view
- [ ] 11.2 Implement document management
- [ ] 11.3 Add version control
- [ ] 11.4 Integrate with timeline

## 12. Discharge Workflow

- [ ] 12.1 Create discharge summary generator
- [ ] 12.2 Implement medication list
- [ ] 12.3 Add follow-up scheduling
- [ ] 12.4 Create digital documents

## 13. Event Bus Integration

- [x] 13.1 Publish LabOrdered events
- [ ] 13.2 Publish SampleCollected events
- [x] 13.3 Publish LabCompleted events
- [ ] 13.4 Publish DrugDispensed events
- [ ] 13.5 Publish PatientAdmitted events
- [ ] 13.6 Publish all listed events

## 14. Security & RLS

- [ ] 14.1 Add RLS policies for lab tables
- [ ] 14.2 Add RLS policies for pharmacy tables
- [ ] 14.3 Add RLS policies for IPD tables
- [ ] 14.4 Add RLS policies for OT/ICU tables
- [ ] 14.5 Implement audit logging

## 15. Testing & Documentation

- [ ] 15.1 Create lab workflow tests
- [ ] 15.2 Create pharmacy tests
- [ ] 15.3 Create IPD admission tests
- [ ] 15.4 Create billing tests
- [ ] 15.5 Create integration tests
- [ ] 15.6 Update all documentation