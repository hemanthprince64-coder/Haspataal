# Phase 1 Foundation Tasks

## Milestone 1: Multi-Tenant Architecture Core (Week 1)

### Task 1.1: Database Tenant Isolation
- [x] Add `hospital_id` column to all existing tables missing it
- [x] Create RLS policies for all tables (migrations/01_phase1_rls_policies.sql)
- [x] Add foreign key constraints to hospital_id references
- [ ] Create `clinic_settings` table for branding config
- [ ] Create `tenant_context` middleware
- [ ] Add indexes on hospital_id columns

### Task 1.2: Shared TypeScript Packages
- [x] Create `@haspataal/events` package (Redis Stream singleton)
- [x] Create `@haspataal/scheduler` package (BullMQ cron engine)
- [x] Create `@haspataal/files` package (S3/R2 storage driver)
- [x] Update `@haspataal/types` with clinical types
- [ ] Create `@haspataal/appointments` package (booking types)

## Milestone 2: RBAC & Security (Week 2)

### Task 2.1: Role-Based Access
- [x] Define 11 roles in shared types (already exists)
- [x] Create permission matrix table (already exists)
- [x] Implement `withPermission` decorator
- [ ] Add `authorizationMiddleware` for all routes
- [x] Create audit logger integration (already exists)

### Task 2.2: Security Hardening
- [x] CSRF protection middleware
- [x] CSP headers via Helmet
- [x] Rate limiting (sliding window Redis)
- [ ] File upload validation
- [ ] Virus scanning integration (ClamAV stub)

## Milestone 3: Doctor Identity Module (Weeks 3-4)

### Task 3.1: Database Schema
- [x] Add missing Doctor tables to Prisma schema
- [x] Create migrations for new tables
- [x] Add relations to existing DoctorMaster
- [ ] Create seed data for verification statuses

### Task 3.2: API Layer
- [x] Create doctor registration routes
- [x] Create profile management routes (via patients route)
- [x] Create education/certification routes
- [x] Create document upload routes
- [x] Add validation with Zod

### Task 3.3: Services
- [x] Create doctor verification workflow
- [x] Create hospital invitation service
- [x] Create credential expiry monitoring
- [x] Add audit logging for all actions

## Milestone 4: Hospital Onboarding (Week 5)

### Task 4.1: Wizard Implementation
- [ ] Create setup wizard UI components
- [ ] Create department configuration
- [ ] Create staff roster import
- [ ] Create branding configuration
- [ ] Add go-live validation

### Task 4.2: Configuration Service
- [ ] Create hospital settings API
- [ ] Add operational hours management
- [ ] Create holiday calendar
- [ ] Add token rule templates

## Milestone 5: Patient Clinical Data (Week 6)

### Task 5.1: Patient Registration
- [x] Create registration with OTP flow
- [x] Add ABHA ID linking
- [x] Create consent capture
- [x] Add audit entry generation

### Task 5.2: Clinical Records API
- [ ] Create vitals API
- [ ] Create complaints API
- [ ] Create diagnosis API (ICD-10)
- [ ] Create prescription API
- [ ] Add timeline event generation

## Milestone 6: OpenAPI Contracts (Week 7)

### Task 6.1: API Specification
- [x] Create OpenAPI 3.1 spec for auth
- [x] Create spec for doctor endpoints
- [x] Create spec for patient endpoints
- [x] Create spec for hospital endpoints
- [ ] Generate TypeScript types from spec

## Milestone 7: CI/CD Pipeline (Week 8)

### Task 7.1: GitHub Actions
- [x] Create lint workflow
- [x] Create test workflow
- [x] Create build workflow
- [x] Create deploy workflow (blue-green)
- [x] Add migration scripts

### Task 7.2: Production Readiness
- [x] Add health check endpoints
- [x] Configure Sentry logging
- [x] Add Prometheus metrics
- [x] Create Dockerfile for all services
- [x] Add smoke tests