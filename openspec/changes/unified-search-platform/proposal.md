# Unified Search & Discovery Platform

## 1. PROBLEM STATEMENT
Every Haspataal module (patients, doctors, hospitals, EMR, timeline, bills, care journeys) has isolated search. No unified discovery. SQL LIKE queries don't scale.

## 2. SOLUTION
Unified Search & Discovery Platform with PostgreSQL Full-Text Search (launch), OpenSearch-ready abstraction, multi-tenant security, event-driven indexing, and ranking engine.

## 3. SCOPE
All entities: patients, doctors, hospitals, departments, appointments, EMR, timeline, medicines, prescriptions, lab, radiology, bills, care journeys, pregnancy, vaccinations, chronic diseases, notifications.

## 4. SUCCESS CRITERIA
- Single search API returns ranked, permission-filtered results across all modules
- Sub-100ms p95 latency
- Event-driven indexing <500ms lag
- Multi-tenant isolation enforced at query level
- OpenSearch migration path without API changes