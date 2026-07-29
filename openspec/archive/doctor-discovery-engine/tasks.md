## 1. Database Schema & Migrations

- [x] 1.1 Add DoctorSearchIndex table to Prisma schema (exist)
- [x] 1.2 Add DoctorPublicProfile table to Prisma schema (exist)
- [x] 1.3 Add latitude/longitude fields to HospitalsMaster (exist)
- [x] 1.4 Create search index update triggers
- [x] 1.5 Run Prisma migration to Supabase

## 2. Core Services

- [x] 2.1 Create DoctorDiscoveryService with search aggregation
- [x] 2.2 Create DoctorAvailabilityService with availability computation
- [x] 2.3 Add search index refresh job to BullMQ
- [x] 2.4 Create Haversine distance calculation utility
- [x] 2.5 Add search result caching with Redis

## 3. API Endpoints

- [x] 3.1 Implement GET /api/doctors/search endpoint
- [x] 3.2 Implement GET /api/doctors/{id}/availability endpoint
- [x] 3.3 Implement GET /api/doctors/public endpoint
- [x] 3.4 Add Zod validation for search filters
- [x] 3.5 Add pagination to search results

## 4. Integration

- [x] 4.1 Connect discovery service to patient portal
- [x] 4.2 Trigger index update on doctor verification
- [x] 4.3 Trigger index update on affiliation changes
- [x] 4.4 Add events for search index updates
- [x] 4.5 Update RLS policies for read-only discovery access

## 5. Testing

- [x] 5.1 Create unit tests for availability computation
- [x] 5.2 Create unit tests for search filtering
- [x] 5.3 Create integration tests for search endpoints
- [x] 5.4 Create workflow tests for index updates
- [x] 5.5 Add smoke tests for discovery API

## 6. Documentation

- [x] 6.1 Update API.md with new endpoints
- [x] 6.2 Update DATABASE.md with new tables
- [x] 6.3 Update PATIENT.md with search features
- [x] 6.4 Update DOCTOR.md with discovery workflow
- [x] 6.5 Update ANALYTICS.md with search metrics