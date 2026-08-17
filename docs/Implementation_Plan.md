# Haspataal - Implementation Plan

## Project Overview
**Timeline:** 4-6 months (16-24 weeks)  
**Team Size:** 4-6 engineers, 1 PM, 1 Designer  
**Methodology:** Agile / Scrum (2-week sprints)

---

## Phase 0: Foundation (Weeks 1-3)

### Sprint 0.1: Project Setup & Infrastructure
**Duration:** 1 week  
**Team:** 2-3 engineers  
**Goals:** Repository, CI/CD, development environment, database foundation

#### Tasks
1. **Monorepo Setup**
   - Initialize Turborepo with Next.js, packages, services structure
   - Configure `turbo.json` pipelines
   - Set up shared `tsconfig.json`, ESLint, Prettier
   - Install and configure shadcn/ui base components

2. **Database Initialization**
   - Create Supabase project (dev + staging)
   - Initialize Prisma schema based on Backend Schema doc
   - Run initial migration
   - Create essential indexes
   - Configure RLS policies

3. **Authentication Foundation**
   - Implement JWT utilities (jose)
   - Build password hashing (bcrypt) + OTP generation
   - Create `/api/auth/request-otp` endpoint
   - Create `/api/auth/verify-otp` endpoint
   - Test OTP flow end-to-end

4. **CI/CD Pipeline**
   - GitHub Actions workflows:
     - `ci.yml`: lint, typecheck, test on PR
     - `build.yml`: Next.js build verification
     - `deploy-dev.yml`: auto-deploy to dev on merge to develop
   - Configure environment secrets
   - Set up Sentry for error tracking

5. **Development Environment**
   - Docker Compose file: PostgreSQL + Redis + app
   - `.env.example` template
   - README with local setup instructions
   - Pre-commit hooks (husky + lint-staged)

**Deliverables:**
- ✅ Monorepo with 3 apps (patient, hospital, admin)
- ✅ Database schema migrated and seeded
- ✅ Authentication endpoints working
- ✅ CI pipeline green
- ✅ Local dev setup documented

---

### Sprint 0.2: Core UI Components & Design System
**Duration:** 1 week  
**Team:** 2 engineers + 1 designer  
**Goals:** Component library, theming, layout primitives

#### Tasks
1. **Theme & Typography**
   - Configure Tailwind with design tokens (colors, fonts, spacing)
   - Set up CSS variables for light/dark mode
   - Implement `ThemeProvider` with toggle
   - Add Inter & Plus Jakarta Sans fonts

2. **Base Components (shadcn/ui)**
   - Extend existing components: Button, Input, Select
   - Add: Card, Badge, Avatar, DropdownMenu, Dialog, Sheet
   - Ensure accessibility (ARIA, keyboard nav)
   - Storybook setup (optional) for visual QA

3. **Layout Components**
   - `Sidebar` - collapsible navigation
   - `Topbar` - header with user menu
   - `Container` - responsive wrapper
   - `Breadcrumbs` - page navigation
   - `ErrorBoundary` - error handling

4. **Form Infrastructure**
   - `Form` wrapper (react-hook-form + zod)
   - Reusable form fields (FormInput, FormSelect, FormCheckbox)
   - Validation error display component
   - Zod schemas for common patterns (email, phone, password)

5. **Mock API Layer**
   - Create `msw` (Mock Service Worker) setup
   - Mock endpoints for patient list, doctor list
   - Enables parallel UI development without backend

**Deliverables:**
- ✅ Complete design system in Tailwind
- ✅ Component library with 15+ reusable components
- ✅ Mock server for frontend development
- ✅ Sample pages using component library

---

## Phase 1: Patient Portal (Weeks 4-8)

### Sprint 1.1: Patient Authentication & Onboarding
**Duration:** 1 week  
**Goals:** Login, registration, session management

#### Tasks
1. **Landing Page**
   - Hero section with CTA
   - Portal selection cards (Patient / Hospital / Admin)
   - Responsive layout

2. **Login Page (`/(patient)/login`)**
   - Phone number input (10-digit validation)
   - OTP request flow (mock SMS for now)
   - OTP verification form
   - Error handling + retry logic
   - Redirect to portal on success

3. **Registration Page (`/(patient)/register`)**
   - Multi-section form:
     - Personal details (name, DOB, gender)
     - Contact (phone, email, address)
     - Medical info (blood group, allergies)
   - Form validation with Zod
   - Success state + auto-login

4. **Session Management**
   - Session cookie setup (httpOnly, secure, sameSite)
   - Middleware protection for `/patient/*` routes
   - Logout endpoint and button

5. **Onboarding Flow**
   - First-time user welcome
   - Profile picture upload (Supabase storage)
   - Skip option
   - Redirect to dashboard

**Testing:**
- Unit: Form validation, phone format
- E2E: Login → Dashboard flow
- Security: OTP brute-force protection

**Deliverables:**
- ✅ Complete patient auth flow
- ✅ Working session management
- ✅ Onboarding experience

---

### Sprint 1.2: Doctor Search & Profile
**Duration:** 1 week  
**Goals:** Doctor discovery and details

#### Tasks
1. **Doctor Search Page (`/search`)**
   - Search bar with debounce
   - Filter sidebar (specialty, hospital, fees, availability)
   - Results grid with pagination
   - Loading states + skeletons

2. **Doctor Card Component**
   - Photo, name, specialization
   - Hospital, experience, fees
   - "Book" button
   - Hover effects

3. **Doctor Profile Page (`/doctors/[id]`)**
   - Detailed doctor info
   - Availability calendar (next 14 days)
   - Time slot selector
   - "Book Appointment" CTA
   - Reviews section (future)

4. **API Endpoints**
   - `GET /api/doctors` (with filters + pagination)
   - `GET /api/doctors/:id`
   - Integration with Prisma queries

**Testing:**
- Unit: Filter logic, search query builder
- E2E: Search → Filter → View Doctor → Book flow
- Performance: 100+ doctors loaded smoothly

**Deliverables:**
- ✅ Doctor discovery experience
- ✅ Search with filters
- ✅ Profile pages with booking

---

### Sprint 1.3: Appointment Booking Flow
**Duration:** 1 week  
**Goals:** Complete booking experience

#### Tasks
1. **Booking Page (`/book/[doctorId]`)**
   - Date picker (react-day-picker)
   - Time slot grid (disabled if booked)
   - Reason/symptoms form
   - Confirmation modal
   - Success page with ICS download

2. **Booking Logic**
   - Prevent double-booking (DB constraint + app check)
   - Appointment conflict detection
   - Status = `pending` upon creation

3. **Notifications**
   - Send in-app notification to doctor (future)
   - Email confirmation (Resend API)
   - SMS reminder (Msg91/Twilio)

4. **Appointment Management**
   - `/(patient)/appointments` page (list + tabs)
   - Reschedule flow (pick new slot)
   - Cancel flow with reason
   - View details

**Testing:**
- Unit: Conflict detection, availability logic
- E2E: Full booking, reschedule, cancel flows
- Integration: Notification delivery

**Deliverables:**
- ✅ End-to-end appointment booking
- ✅ Reschedule and cancel
- ✅ Confirmation notifications

---

### Sprint 1.4: Patient Dashboard & Care Journeys
**Duration:** 1 week  
**Goals:** Home dashboard + care journey tracking

#### Tasks
1. **Patient Home (`/(patient)/page`)**
   - KPI cards: Upcoming appointments (3), Active journeys (2)
   - Recent activity feed
   - Quick actions (Book, Search, Profile)
   - Responsive layout

2. **Care Journey List (`/care-journeys`)**
   - Journey cards with progress bar
   - Filter by status (Active, Completed)
   - Empty state when none

3. **Care Journey Detail (`/care-journeys/[id]`)**
   - Timeline of milestones
   - Doctor notes (read-only)
   - Change status action
   - Milestone checklist

4. **API Endpoints**
   - `GET /api/patients/me` (fetch patient + stats)
   - `GET /api/care-journeys` (patient's journeys)
   - `GET /api/care-journeys/:id`
   - `PATCH /api/care-journeys/:id/status`

5. **Charts & Analytics**
   - Appointment history line chart (Recharts)
   - Health metrics over time (future)

**Testing:**
- Unit: Date calculations, milestone logic
- E2E: View dashboard, journey list, journey detail
- Accessibility: Screen reader navigation

**Deliverables:**
- ✅ Patient dashboard with KPIs
- ✅ Care journey management
- ✅ Basic patient analytics

---

### Sprint 1.5: Polish & Optimization
**Duration:** 1 week  
**Goals:** UX polish, performance, offline support

#### Tasks
1. **Performance**
   - Image optimization with Next.js Image
   - Lazy loading of doctor list
   - Code splitting for heavy pages
   - Bundle size analysis

2. **UX Polish**
   - Toast notifications (sonner) for actions
   - Loading skeletons everywhere
   - Error boundaries + friendly error pages
   - Empty states with illustrations

3. **Mobile Optimization**
   - Mobile-first testing
   - Bottom nav bar for mobile
   - Touch-friendly buttons (min 44px)
   - Responsive tables (horizontal scroll)

4. **Offline Capability (Future)**
   - Service worker caching (Next.js PWA)
   - Offline indicator
   - Background sync for OTP (future)

**Testing:**
- Lighthouse audit (target > 90)
- Mobile testing on real devices
- Accessibility audit (axe-core)

**Deliverables:**
- ✅ Performance optimized (Lighthouse > 90)
- ✅ Mobile-responsive
- ✅ Production-ready patient portal

---

## Phase 2: Hospital Portal (Weeks 9-13)

### Sprint 2.1: Hospital Authentication & Layout
**Duration:** 1 week  
**Goals:** Hospital admin login, dashboard layout

#### Tasks
1. **Login Page (`/(hospital)/login`)**
   - Email + password form
   - Password visibility toggle
   - Error messages
   - Forgot password link (future)

2. **Dashboard Layout (`/(hospital)/dashboard/layout`)**
   - Sidebar navigation (collapsible)
   - Topbar (hospital name, user menu, notifications)
   - Responsive wrapper
   - Route structure for all hospital pages

3. **Authentication Middleware**
   - Protect `/hospital/*` routes
   - Check for hospital session (different from patient)
   - Redirect to login if not authenticated

4. **Session Management**
   - Login API endpoint
   - Session storage (Redis)
   - Logout endpoint
   - Password hashing with bcrypt

**Testing:**
- Unit: Password validation, session checks
- E2E: Hospital login/logout
- Security: Brute-force protection

**Deliverables:**
- ✅ Hospital auth flow
- ✅ Dashboard shell with navigation

---

### Sprint 2.2: Hospital Dashboard & KPIs
**Duration:** 1 week  
**Goals:** Analytics dashboard

#### Tasks
1. **Dashboard Home Page**
   - KPI cards grid:
     - Today's Appointments
     - This Month Revenue
     - Active Patients
     - Doctor Availability
   - Revenue trend chart (line chart, last 30 days)
   - Appointments by specialty (bar chart)
   - Recent activity table (last 10 appointments)

2. **API Endpoints**
   - `GET /api/hospital/dashboard/stats`
   - `GET /api/hospital/dashboard/revenue?period=30d`
   - `GET /api/hospital/dashboard/appointments?start=...&end=...`

3. **Charts Integration**
   - Recharts setup (LineChart, BarChart, PieChart)
   - Responsive chart containers
   - Loading + error states

4. **Date Range Picker**
   - Common across all reports
   - Presets: Today, Last 7 days, Last 30 days, This month
   - Custom date range

**Testing:**
- Unit: Date range calculations, aggregation queries
- E2E: Dashboard loads with mock data
- Performance: Charts render smoothly

**Deliverables:**
- ✅ Hospital dashboard with KPIs
- ✅ Interactive charts
- ✅ Date range filtering

---

### Sprint 2.3: Doctor Management
**Duration:** 1 week  
**Goals:** CRUD for doctors

#### Tasks
1. **Doctor List Page (`/hospital/doctors`)**
   - Table with columns: Name, Specialty, Phone, Exp, Fees, Status
   - Search + filter by specialty
   - Pagination (20 per page)
   - "Add Doctor" button → opens modal

2. **Add/Edit Doctor Modal**
   - Form with validation
   - Fields: Name, phone, email, specialization, exp, fees, password
   - Photo upload (optional)
   - Success toast on create

3. **API Endpoints**
   - `GET /api/hospital/doctors` (with filters)
   - `POST /api/hospital/doctors`
   - `PATCH /api/hospital/doctors/:id`
   - `DELETE /api/hospital/doctors/:id` (soft delete: blocked=true)

4. **Bulk Actions**
   - Export doctor list to CSV
   - Activate/deactivate multiple

**Testing:**
- Unit: Phone number validation, fee range
- E2E: Create doctor → appears in list → edit → delete
- Security: Ensure only hospital's own doctors accessible

**Deliverables:**
- ✅ Doctor CRUD interface
- ✅ Search + filter
- ✅ CSV export

---

### Sprint 2.4: Appointment Management (Hospital View)
**Duration:** 1 week  
**Goals:** Appointment scheduling oversight

#### Tasks
1. **Appointment List (`/hospital/appointments`)**
   - Dual view: Calendar + Table
   - Filters: Date range, doctor, status
   - Patient search
   - Status badges

2. **Appointment Actions**
   - Confirm → change status
   - Complete → mark finished, trigger notifications
   - Cancel → with reason, notify patient
   - Add notes (textarea) → saves to `notes` column
   - Reschedule (change date/time)

3. **Calendar Integration**
   - FullCalendar.js or custom calendar
   - Drag-and-drop rescheduling (future)
   - Click to view details

4. **API Enhancements**
   - `PATCH /api/appointments/:id/status`
   - `PATCH /api/appointments/:id/reschedule`
   - `POST /api/appointments/:id/notes`

**Testing:**
- Unit: Status transition rules
- E2E: Confirm appointment, see patient notified
- Integration: Calendar ↔ API

**Deliverables:**
- ✅ Appointment management (CRUD)
- ✅ Calendar view
- ✅ Bulk operations

---

### Sprint 2.5: Care Journey Management
**Duration:** 1 week  
**Goals:** Patient care plans

#### Tasks
1. **Care Journey List**
   - Card-based layout
   - Filter by patient, status, priority
   - Progress bar visualization
   - Search by title

2. **Create Journey Modal**
   - Select patient (autocomplete search)
   - Choose doctor
   - Set timeline (start/end)
   - Add milestones (dynamic form field array)
   - Priority selector

3. **Journey Detail Page**
   - Patient summary
   - Doctor info
   - Timeline of milestones
   - Status actions (Active → Completed)
   - Notes section

4. **Milestone Completion**
   - Checkbox to mark complete
   - Auto-updates progress
   - Notification to patient (future)

5. **API**
   - `GET /api/hospital/care-journeys`
   - `POST /api/hospital/care-journeys`
   - `PATCH /api/hospital/care-journeys/:id`
   - `POST /api/hospital/care-journeys/:id/milestones`

**Testing:**
- Unit: Date validation, milestone order
- E2E: Create journey → add milestones → mark complete
- Edge case: End date before start date

**Deliverables:**
- ✅ Care journey CRUD
- ✅ Milestone tracking
- ✅ Progress visualization

---

### Sprint 2.6: Reports & Analytics
**Duration:** 1 week  
**Goals:** Business intelligence for hospitals

#### Tasks
1. **Reports Page (`/hospital/reports`)**
   - Report type selector (sidebar)
   - Date range picker (global)
   - Export buttons (CSV, PDF)

2. **Report Types**
   - **Appointment Report**: Total, by status, by doctor, by day of week
   - **Revenue Report**: Total revenue, breakdown by service, trend line
   - **Doctor Performance**: Appointments per doctor, patient count, avg rating (future)
   - **Patient Demographics**: Age distribution, gender, top pincodes

3. **Visualizations**
   - Bar charts (revenue by doctor)
   - Pie charts (demographics)
   - Line charts (appointments trend)
   - Data tables with sortable columns

4. **Export Functionality**
   - CSV export using PapaParse
   - PDF report generation (future: @react-pdf/renderer)

5. **API**
   - `GET /api/hospital/reports/appointments?start=...&end=...`
   - `GET /api/hospital/reports/revenue?start=...&end=...`
   - `GET /api/hospital/reports/doctors?start=...&end=...`

**Testing:**
- Unit: Aggregation queries, date math
- E2E: Generate report → export CSV
- Performance: Queries return < 1s on large datasets (10k+ rows)

**Deliverables:**
- ✅ Comprehensive reports
- ✅ Interactive charts
- ✅ CSV export

---

## Phase 3: Admin Portal & Advanced Features (Weeks 14-18)

### Sprint 3.1: Admin Dashboard & Hospital Management
**Duration:** 1 week  
**Goals:** Super admin panel

#### Tasks
1. **Admin Login**
   - Separate login page (`/admin/login`)
   - Admin credentials stored securely
   - Role-based middleware

2. **Admin Dashboard**
   - Platform metrics: Total hospitals, patients, doctors
   - Revenue tracking (future)
   - Health status of services
   - Recent activity log

3. **Hospital Management**
   - List all hospitals with filters (pending, active, suspended)
   - Approve/reject hospital registrations
   - Suspend/unsuspend hospitals
   - View hospital details modal

4. **API**
   - `GET /api/admin/hospitals`
   - `PATCH /api/admin/hospitals/:id/status`

**Testing:**
- Unit: Status transition rules
- E2E: Admin approves hospital → hospital can login
- Security: Non-admin cannot access admin routes

**Deliverables:**
- ✅ Admin portal login
- ✅ Hospital approval workflow

---

### Sprint 3.2: Notifications System
**Duration:** 1 week  
**Goals:** In-app + email notifications

#### Tasks
1. **Notification Service**
   - Background worker (BullMQ + Redis)
   - Job types: send_email, send_sms, push_notification
   - Retry logic with exponential backoff

2. **In-App Notification Component**
   - Dropdown bell icon with unread count
   - Notification list (clickable)
   - Mark as read
   - Link to relevant page

3. **Notification Types**
   - Appointment confirmation
   - Appointment reminder (1 hour before)
   - Appointment cancellation
   - Care journey update
   - New doctor added (admin)
   - System alerts

4. **Email Notifications**
   - Resend API integration
   - Template-based emails
   - Queue for async sending

5. **SMS Notifications**
   - Msg91 or Twilio integration
   - OTP delivery
   - Appointment reminders

**Testing:**
- Unit: Job queue processing
- E2E: Book appointment → doctor gets notification
- Load test: 1000 notifications / minute

**Deliverables:**
- ✅ In-app notification system
- ✅ Email + SMS delivery
- ✅ Background job processing

---

### Sprint 3.3: Audit Logging & Compliance
**Duration:** 1 week  
**Goals:** PHI tracking and audit trail

#### Tasks
1. **Audit Log Table & RLS**
   - Create `audit_logs` table (see schema)
   - Partitioning strategy (by month)
   - Retention policy (2 years)

2. **Audit Middleware**
   - Interceptor for all API routes
   - Log: user_id, action, resource_type, resource_id, old_values, new_values, IP
   - Automatic for sensitive tables (patients, appointments, care_journeys)

3. **Admin Audit Views**
   - `/admin/audit-logs` page
   - Filters: user, action, date range
   - Export to CSV

4. **Security Enhancements**
   - Rate limiting on auth endpoints
   - Account lockout after 5 failed attempts
   - Password strength requirements

**Testing:**
- Unit: Audit log insertion
- E2E: Update patient → audit log created
- Performance: Logging overhead < 10ms

**Deliverables:**
- ✅ Full audit trail
- ✅ Admin audit viewer
- ✅ Rate limiting + lockout

---

### Sprint 3.4: ABDM Integration (Sandbox)
**Duration:** 2 weeks  
**Goals:** ABHA linking + consent framework

#### Tasks
1. **ABDM Sandbox Setup**
   - Register as Sandbox user
   - Get access token
   - Document API endpoints

2. **ABHA Link API**
   - Generate consent request
   - Handle callback from ABDM
   - Store ABHA address + consent ID

3. **Consent Management**
   - View active consents
   - Revoke consent
   - Consent expiry handling

4. **Health Data Fetch (Future)**
   - Integrate with ABDM Health Information Provider (HIP)
   - Fetch patient health records

**Testing:**
- Sandbox integration testing (ABDM provided test suite)
- E2E: Link ABHA → view consent → fetch test record

**Deliverables:**
- ✅ ABHA linking functional
- ✅ Consent management
- ⚠️ ABDM integration documentation (phase 2 complete)

---

## Phase 4: Advanced Features & Polish (Weeks 19-22)

### Sprint 4.1: Mobile App (React Native / Expo)
**Duration:** 2 weeks  
**Goals:** Patient mobile app

#### Tasks
1. **Expo Project Setup**
   - `haspataal-mobile` in monorepo
   - Expo Router for navigation
   - Shared design system (tokens via Expo)

2. **Core Screens**
   - Login (phone OTP)
   - Doctor search
   - Appointment booking
   - Appointments list
   - Profile

3. **API Integration**
   - Shared API client
   - Auth tokens in SecureStore
   - Offline queue for booking (future)

4. **Push Notifications**
   - Firebase Cloud Messaging (FCM)
   - Appointment reminders

**Testing:**
- Unit: React Native components
- E2E: Detox tests
- Real device testing (Android + iOS)

**Deliverables:**
- ✅ Mobile app MVP (iOS + Android)
- ✅ Push notifications
- ⚠️ App store submission (out of scope for dev)

---

### Sprint 4.2: Advanced Analytics
**Duration:** 1 week  
**Goals:** Deep insights

#### Tasks
1. **PostHog Integration**
   - Event tracking setup
   - User property enrichment
   - Funnel analysis: Signup → First appointment

2. **Custom Analytics Dashboard**
   - Real-time metrics
   - Cohort analysis
   - Retention curves

3. **Report Scheduling**
   - Email scheduled reports (daily, weekly, monthly)
   - PDF generation

**Deliverables:**
- ✅ Product analytics
- ✅ Scheduled reports

---

### Sprint 4.3: Performance & Scaling
**Duration:** 1 week  
**Goals:** Optimize for 10k+ users

#### Tasks
1. **Database Optimization**
   - Query analysis (EXPLAIN ANALYZE)
   - Add missing indexes
   - Connection pooling tune

2. **Caching Layer**
   - Redis cache for frequent queries (doctor lists, hospital info)
   - Cache invalidation strategy

3. **CDN Setup**
   - Configure CloudFlare
   - Static asset caching
   - Edge caching for API (if needed)

4. **Load Testing**
   - k6 or artillery load tests
   - Identify bottlenecks
   - Tune serverless functions / containers

**Deliverables:**
- ✅ < 200ms API p95
- ✅ Sub-second page loads
- ✅ Load tested to 10k concurrent users

---

### Sprint 4.4: Security Hardening
**Duration:** 1 week  
**Goals:** Compliance & security audit

#### Tasks
1. **Security Audit**
   - Dependency vulnerability scan (npm audit)
   - Penetration testing checklist
   - OWASP Top 10 review

2. **PHI Protection**
   - Verify RLS policies in production
   - Logging audit trail
   - Encrypt sensitive columns (future: pincode)

3. **GDPR / Indian Privacy Law**
   - Data export feature (user data export)
   - Data deletion / right to be forgotten
   - Consent management for marketing

4. **Backup & DR Drill**
   - Simulate database failure
   - Restore from backup
   - Document recovery procedure

**Deliverables:**
- ✅ Security audit passed
- ✅ PHI access logs verified
- ✅ Disaster recovery plan documented

---

## Phase 5: Launch Preparation (Weeks 23-24)

### Sprint 5.1: QA & Bug Fixes
**Duration:** 1 week  
**Goals:** Bug bash + polish

#### Tasks
1. **QA Testing**
   - Cross-browser testing (Chrome, Firefox, Safari, Edge)
   - Mobile device testing (iOS, Android)
   - Accessibility audit (axe, Lighthouse)
   - User Acceptance Testing (UAT) with pilot hospitals

2. **Bug Triage**
   - Critical bugs → fix immediately
   - Major bugs → schedule fix pre-launch
   - Minor bugs → post-launch backlog

3. **Documentation Finalization**
   - Update README with deployment instructions
   - API documentation (OpenAPI / Swagger)
   - Admin user guide
   - Hospital onboarding guide

**Deliverables:**
- ✅ UAT sign-off
- ✅ Bug-free MVP (threshold met)
- ✅ Documentation complete

---

### Sprint 5.2: Deployment & Launch
**Duration:** 1 week  
**Goals:** Go live

#### Tasks
1. **Production Infrastructure**
   - Provision production Supabase
   - Set up staging environment (mirror production)
   - Configure domain + SSL (Let's Encrypt)
   - CI/CD: deploy to staging on PR merge, manual prod deploy

2. **Data Migration**
   - Seed initial data (doctors, hospitals for pilot)
   - Migrate pilot users if applicable
   - Verify data integrity

3. **Monitoring & Alerting**
   - Sentry error alerts to Slack
   - Uptime monitoring (UptimeRobot)
   - Database size alerts
   - Error rate alerts (> 1%)

4. **Launch Checklist**
   - [ ] All environments healthy
   - [ ] Load balancer configured
   - [ ] CDN active
   - [ ] DNS propagated
   - [ ] SSL certificates valid
   - [ ] Backup schedule active
   - [ ] Rollback plan documented

5. **Go Live**
   - Deploy to production
   - Smoke test critical paths
   - Announce to pilot users

6. **Post-Launch**
   - 24/7 monitoring for first 72 hours
   - Daily health reports
   - Rapid response team on-call

**Deliverables:**
- ✅ Production deployment
- ✅ Monitoring active
- ✅ Pilot users onboarded

---

## Post-Launch (Weeks 25+)

### Ongoing Maintenance
- Weekly: Bug triage, hotfixes
- Bi-weekly: Feature releases
- Monthly: Security patches, dependency updates
- Quarterly: Performance review, capacity planning

### Support & Feedback
- Support channel (Slack / Discord)
- Feedback collection (in-app form)
- Feature request prioritization
- Analytics review (PostHog dashboards)

### Phase 2 Planning
- Telemedicine integration
- Payment gateway
- Lab test booking
- AI symptom checker
- Mobile app v2 with offline support

---

## Team Assignment Matrix

| Role | Count | Responsibilities |
|------|-------|-----------------|
| **Frontend Engineer** | 2 | Patient portal, Hospital portal UI, Component library |
| **Backend Engineer** | 2 | API endpoints, Database, Auth, Background jobs |
| **Full-Stack Engineer** | 1 | End-to-end features, Integrations |
| **Product Manager** | 1 | Roadmap, Requirements, Prioritization |
| **UI/UX Designer** | 1 | Figma designs, Design system, User research |
| **QA Engineer** | 1 (shared) | Test plans, E2E tests, UAT coordination |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Database performance degrades with scale** | Medium | High | Proactive indexing, read replicas, query optimization from Sprint 3.3 |
| **Auth security vulnerability** | Low | Critical | Regular security audits, dependency updates, rate limiting |
| **Supabase outage / vendor lock-in** | Low | High | Export scripts, cloud-agnostic design (Docker) |
| **Feature creep delays launch** | High | Medium | Strict MVP definition, phase 2 backlog |
| **Poor mobile UX** | Medium | Medium | Mobile-first design, real device testing |
| **Pilot hospital adoption low** | Medium | High | Involve hospitals early, gather feedback, iterate |

---

## Success Metrics (Post-Launch)

| Metric | Target | Timeline |
|--------|--------|----------|
| Daily Active Users (DAU) | 500+ | Month 1 |
| Monthly Active Users (MAU) | 5,000+ | Month 3 |
| Appointments booked | 1,000 / month | Month 3 |
| Average booking time | < 2 minutes | Ongoing |
| Error rate (500s) | < 0.1% | Ongoing |
| Page load (p95) | < 2s | Ongoing |
| Patient satisfaction (NPS) | > 50 | Month 3 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Product & Engineering Leadership  
**Related Documents**: PRD.md, TRD.md, AppFlow.md, UIUX_Design_Brief.md, Backend_Schema.md
