# Haspataal - Product Requirements Document

## 1. Overview

Haspataal is a unified Healthcare Operating System for India, connecting patients, doctors, and hospitals through a secure, high-performance platform. It's a B2B2C healthcare platform that provides:

- **Patient Portal** - Web and mobile access for patients to book appointments, view health records, and manage their healthcare journey
- **Hospital Management System (HMS)** - Comprehensive dashboard for hospitals to manage doctors, staff, appointments, and care journeys
- **Admin Panel** - Super admin interface for platform oversight and management
- **ABDM Integration** - ABHA linking and consent management (India's Ayushman Bharat Digital Mission)

## 2. Goals & Objectives

### Primary Goals
- Streamline healthcare appointment booking and management
- Digitize patient health records and care journeys
- Enable hospitals to efficiently manage staff and operations
- Provide actionable analytics and reporting
- Ensure PHI (Protected Health Information) security and compliance with Indian healthcare regulations

### Success Metrics
- 10,000+ monthly active patients within 6 months
- 500+ hospitals onboarded within 1 year
- 5,000+ doctors on platform
- Average appointment booking time < 2 minutes
- Patient satisfaction score > 4.5/5.0
- Zero security breaches / PHI leaks

## 3. Requirements

### Functional Requirements

#### Patient-Facing Features
1. **Authentication**
   - Phone-based OTP login
   - User registration with personal details (name, DOB, gender, blood group, pincode)
   - Session management

2. **Doctor Discovery & Booking**
   - Search doctors by specialty, hospital, location
   - Filter by availability, fees, experience
   - View doctor profiles (specialization, experience, fees, hospital affiliation)
   - Book appointments with time slot selection
   - Appointment management (view, reschedule, cancel)

3. **Health Records**
   - View personal health history
   - Access past appointments and prescriptions
   - Track ongoing care journeys

4. **Profile Management**
   - Edit personal information
   - Manage emergency contacts
   - View appointment history

#### Hospital-Facing Features
1. **Authentication**
   - Email + password login for hospital admins
   - Session-based authentication
   - Role-based access control

2. **Hospital Dashboard**
   - Overview metrics (today's appointments, revenue, patient count)
   - Analytics charts (weekly/monthly trends)
   - Quick actions menu

3. **Staff Management**
   - Add/edit/remove doctors
   - Manage doctor profiles (specialization, fees, experience, schedule)
   - Manage hospital staff accounts

4. **Appointment Management**
   - View all appointments (filterable by date, doctor, status)
   - Update appointment status (confirmed, completed, cancelled, no-show)
   - Add notes to appointments
   - Bulk operations

5. **Care Journeys**
   - Create structured care plans for patients
   - Assign doctors to care journeys
   - Track progress with status updates
   - Set priorities and timelines

6. **Reports & Analytics**
   - Appointment statistics
   - Revenue reports
   - Doctor performance metrics
   - Patient demographic analysis
   - Export to CSV/PDF

#### Admin Features
1. **Platform Administration**
   - View all hospitals
   - Approve/reject hospital registrations
   - Monitor platform health metrics
   - Manage system-wide settings

2. **User Management**
   - Admin can manage all user accounts
   - View audit logs

## 4. User Experience (UX)

### User Personas

#### Patient Persona
- **Age Range**: 18-65
- **Tech Comfort**: Moderate to high
- **Primary Goal**: Quick and easy appointment booking with trusted doctors
- **Pain Points**: Long phone queues, unclear doctor availability, no centralized records
- **Preferred Channels**: Mobile-first, web as backup

#### Hospital Admin Persona
- **Role**: Hospital manager / admin staff
- **Primary Goal**: Efficiently manage doctors, appointments, and patient flow
- **Pain Points**: Paper-based systems, manual scheduling, no analytics
- **Tech Comfort**: Moderate

#### Doctor Persona
- **Primary Goal**: View schedule, see patient history, manage appointments
- **Pain Points**: Double-booking, missing patient context, manual record-keeping

### Key User Journeys

1. **Patient Registration → Doctor Search → Appointment Booking → Appointment Completion → Care Journey Creation**
2. **Hospital Admin → Doctor Onboarding → Schedule Setup → Daily Appointment Management → Weekly Reporting**

### UI/UX Principles
- Clean, medical-grade aesthetic with calming colors
- Minimal cognitive load - clear CTAs and intuitive navigation
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 AA)
- Fast load times (< 2s)

## 5. Non-Functional Requirements

### Security & Compliance
- End-to-end encryption for PHI
- JWT-based authentication with secure cookies
- Role-based access control (RBAC)
- Audit logging for all data access
- HIPAA-inspired controls (adapting to Indian regulations)
- Regular security audits

### Performance
- Page load time < 2 seconds
- API response time < 500ms (p95)
- Support 10,000 concurrent users
- Database query optimization with proper indexing

### Reliability & Availability
- 99.5% uptime target
- Automated backups (daily)
- Disaster recovery plan
- Graceful degradation for non-critical features

### Scalability
- Horizontal scaling capability
- Database connection pooling
- Caching layer (Redis) for sessions and frequently accessed data
- Infrastructure as Code (Docker, docker-compose)

### Maintainability
- Clean Architecture / Domain-Driven Design
- Comprehensive logging (pino)
- Monitoring and alerting (Sentry)
- Type-safe TypeScript codebase
- Automated testing (unit + E2E)

## 6. Out of Scope (V1)

- Telemedicine / video consultations
- Online payments integration
- Pharmacy / medicine delivery
- Lab test booking
- Insurance claim processing
- Multi-language support (English only initially)
- Hospital inventory management

## 7. Future Roadmap (Phase 2+)

- Telemedicine integration
- Payment gateway integration
- Lab test booking and report management
- Pharmacy integration
- Insurance claim automation
- AI-powered symptom checker (MedChat AI)
- Multi-language support (Hindi, regional languages)
- Mobile app (React Native / Expo)

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Product Team
