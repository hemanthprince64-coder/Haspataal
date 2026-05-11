# Haspataal - App Flow & User Journey

## Table of Contents
1. [Overall Navigation Structure](#1-overall-navigation-structure)
2. [Patient Portal Flow](#2-patient-portal-flow)
3. [Hospital Portal Flow](#3-hospital-portal-flow)
4. [Admin Portal Flow](#4-admin-portal-flow)
5. [Shared Flows (Auth)](#5-shared-flows-auth)
6. [Interactive Flow Diagrams](#6-interactive-flow-diagrams)

---

## 1. Overall Navigation Structure

### Route Groups (Next.js App Router)

Haspataal uses Next.js route groups to organize the three main portals:

```
/(patient)           → Patient Portal (public-facing)
/(hospital)          → Hospital Management System
/(admin)             → Admin Panel (super admin)
/api/                → API routes (backend endpoints)
```

**Why route groups?**
- Clean URLs without the group prefix
- Separate layouts per portal
- Independent authentication strategies
- Easy code splitting and team ownership

---

## 2. Patient Portal Flow

### 2.1 User Journey Overview

```
Splash Screen
    ↓
Landing Page (Portal Selection)
    ↓
Login (Phone OTP) or Register
    ↓
OTP Verification
    ↓
Onboarding (First-time user)
    ↓
Home Dashboard
    ↓
[Core User Actions]
    ├─ Search Doctors
    ├─ Book Appointment
    ├─ View Appointments
    ├─ View Care Journeys
    └─ Manage Profile
```

### 2.2 Detailed Flow

#### A. Entry & Authentication

**Step 1: Landing Page (`/`)**
- Hero section with value proposition
- Portal cards:
  - "I'm a Patient" → `/(patient)/`
  - "Hospital Login" → `/(hospital)/login`
  - "Admin Login" → `/admin/login`

**Step 2: Patient Portal Entry (`/(patient)/`)**
- PortalCards component showing:
  - "Find Doctors" → `/search`
  - "My Appointments" → `/appointments`
  - "My Profile" → `/profile`
  - "Care Journeys" → `/care-journeys`

**Step 3: Login Flow (`/(patient)/login`)**
- Phone number input (10 digits)
- "Send OTP" button
- OTP input (6 digits)
- "Verify & Login" button
- On success: redirect to `/` (patient portal home)

**Step 4: Registration Flow (`/(patient)/register`)**
- Multi-step form or single-page:
  1. Personal Info (name, DOB, gender, phone, email)
  2. Address (address line, city, state, pincode)
  3. Medical Info (blood group, allergies, existing conditions)
  4. Terms acceptance & consent
- On submit: create patient record (status = `pending_verification`)
- Auto-login, redirect to onboarding

**Step 5: OTP Verification**
- OTP sent via SMS (integrated SMS provider)
- OTP stored in Supabase `auth.otp` table with expiry (5 min)
- Verification against hashed OTP
- On success: create session cookie, redirect

#### B. Onboarding (First-Time User)

**Page: `/(patient)/onboarding`**
- Welcome message: "Let's set up your profile"
- Quick profile completion:
  - Upload profile picture
  - Add emergency contact
  - Set health reminders (medications, appointments)
- Skip option available
- Redirect to patient home (`/(patient)/`)

#### C. Patient Home (`/(patient)/page.tsx`)

**LayoutComponents:**
- TopBar: User avatar, notifications bell, search, logout
- Sidebar (mobile: bottom nav): Home, Appointments, Doctors, Profile
- Main content area: Upcoming appointments, recent activity

**Features:**
- Upcoming appointments card (next 7 days)
- Quick action: "Book Appointment"
- Recent care journeys
- Health tips / notifications

#### D. Doctor Search (`/(patient)/search`)

**Search Page (`/search`):**
- Search bar with placeholder: "Search by doctor name, specialty..."
- Filter sidebar:
  - Specialty (dropdown: Cardiology, Dermatology, General Physician, etc.)
  - Hospital (multiselect)
  - Location / Pincode
  - Availability (date picker)
  - Fee range (slider)
  - Experience (min years)
- Results grid: DoctorCard components
  - Photo, name, specialization
  - Hospital name, years exp
  - Consultation fee
  - Rating (future)
  - "Book" button
- Pagination / infinite scroll

**Doctor Profile Page (`/(patient)/doctors/[id]`):**
- Doctor info header (photo, name, specialization)
- Hospital affiliation
- Availability calendar (next 14 days)
- Time slot selector
- "Book Appointment" button
- About section (experience, education)
- Patient reviews (future)

#### E. Appointment Booking Flow

**Step 1: Select Date & Time**
- Calendar view showing available dates
- Click date → shows available time slots
- Select time slot
- Continue button

**Step 2: Booking Form**
- Reason for visit (textarea, required)
- Symptoms (textarea)
- Previous medical records upload (optional)
- Confirm button

**Step 3: Confirmation**
- Success message: "Appointment booked!"
- Appointment details card:
  - Doctor name & hospital
  - Date & time
  - Reference number
  - Status: "Pending Confirmation"
- Actions: "Add to Calendar" (ICS download), "Back to Home"

**API Call:**
```
POST /api/appointments
{
  "doctor_id": 123,
  "hospital_id": 456,
  "appointment_date": "2026-05-20",
  "time_slot": "10:00 AM",
  "reason": "Routine checkup",
  "notes": "..."
}
```

**Backend Effects:**
- Create `appointments` record (status = `pending`)
- Notify doctor via in-app notification
- Optional: Send SMS/email confirmation to patient

#### F. Appointment Management (`/(patient)/appointments`)

**List View:**
- Tabs: "Upcoming", "Past", "Cancelled"
- Each appointment card:
  - Doctor name, hospital, specialization
  - Date, time, status badge
  - Reason snippet
  - Actions: Reschedule, Cancel, View Details

**Reschedule Flow:**
- Open doctor's availability for that date
- Select new time slot
- Confirm → update DB, notify doctor

**Cancel Flow:**
- Confirmation modal: "Are you sure?"
- Reason for cancellation (optional)
- Confirm → update status to `cancelled`, notify doctor

#### G. Care Journeys (`/(patient)/care-journeys`)

**Care Journey List:**
- Each journey card:
  - Title (e.g., "Diabetes Management")
  - Assigned doctor
  - Start date, end date
  - Progress bar (milestones completed)
  - Status badge (Active, Completed, Pending)

**Care Journey Detail:**
- Timeline view of milestones
- Doctor notes
- Prescriptions list
- Appointment history linked to journey
- Messages with care team (future)

---

## 3. Hospital Portal Flow

### 3.1 User Journey Overview

```
Hospital Login Page
    ↓
Hospital Admin Dashboard
    ↓
[Management Modules]
    ├─ Doctor Management
    ├─ Appointment Management
    ├─ Staff Management
    ├─ Care Journeys
    └─ Analytics & Reports
```

### 3.2 Detailed Flow

#### A. Hospital Authentication

**Login Page (`/(hospital)/login`):**
- Email input
- Password input
- "Login" button
- "Forgot Password?" link (future)

**On Success:**
- Create session cookie
- Redirect to `/hospital/dashboard`

**Session Management:**
- Session stored in Redis with expiry (24 hours)
- Protected routes via middleware
- Logout invalidates session

#### B. Hospital Dashboard (`/(hospital)/dashboard`)

**Layout:**
- Sidebar: Dashboard, Doctors, Appointments, Staff, Care Journeys, Reports, Settings
- Topbar: Hospital name, user profile dropdown (settings, logout), notifications
- Main content: KPI cards + charts

**Dashboard KPI Cards:**
- Today's Appointments (number)
- This Month's Revenue (amount)
- Active Patients (count)
- Doctor Availability (available / total)

**Charts:**
- Appointments trend (line chart, last 30 days)
- Revenue by department (bar chart)
- Patient demographics (pie chart)
- Doctor utilization (heatmap)

#### C. Doctor Management

**List (`/(hospital)/doctors`):**
- Table with columns: Name, Specialization, Phone, Email, Experience, Fees, Status, Actions
- Filter by specialization
- Search by name/phone
- "Add Doctor" button → opens modal/form

**Add/Edit Doctor Modal:**
- Form fields:
  - Name, phone, email
  - Specialization (dropdown)
  - Experience (years)
  - Consultation fee
  - Password (for doctor portal access - optional)
  - Status (active/inactive)
- On submit: create `doctors` record, optionally send invite email

**View Doctor Profile (`/(hospital)/doctors/[id]`):**
- Full details
- Upcoming appointments
- Patient history
- Ability to edit

#### D. Appointment Management (`/(hospital)/appointments`)

**Appointment List:**
- Calendar view + list view toggle
- Filter by:
  - Date range
  - Doctor
  - Status (pending, confirmed, completed, cancelled, no-show)
  - Patient (search)
- Table columns:
  - Date, Time, Patient Name, Doctor, Reason, Status, Actions

**Actions on Appointment:**
- Confirm: Change status to `confirmed`
- Complete: Change status to `completed` (trigger post-appointment workflow)
- Cancel: Change status to `cancelled` (notify patient)
- Add Note: Open notes modal
- Reschedule: Change date/time (notify patient)

**Bulk Actions:**
- Select multiple appointments → Export to CSV
- Mark multiple as confirmed

#### E. Care Journey Management (`/(hospital)/care-journeys`)

**Create Care Journey:**
- Select patient (search from `patients` table)
- Choose primary doctor
- Set journey title, description
- Define milestones (title, due date, description)
- Set priority (low, medium, high)
- Start date, end date
- Save → creates `care_journey` and `care_journey_milestones` records

**Care Journey List:**
- Cards with progress bars
- Filter by patient, doctor, status, priority
- Search by title

**Care Journey Detail:**
- Patient info
- Assigned doctor
- Current status + actions (update status)
- Milestones checklist (complete individually)
- Timeline view of updates
- Notes section

#### F. Staff Management (`/(hospital)/staff`)

**Staff List:**
- Table of hospital staff (doctors + non-medical)
- Actions: Edit, Deactivate, Reset Password

**Add Staff:**
- Role dropdown (Doctor, Nurse, Receptionist, Admin)
- Same form as doctor (minus specialization for non-doctors)

#### G. Reports (`/(hospital)/reports`)

**Report Types:**
1. **Appointment Report**
   - Date range picker
   - Metrics: Total appointments, by status, by doctor, by day of week
   - Export CSV

2. **Revenue Report**
   - Date range
   - Total revenue
   - Revenue by doctor
   - Revenue by service type (future)

3. **Doctor Performance**
   - Appointments per doctor
   - Patient satisfaction (future)
   - No-show rate

4. **Patient Demographics**
   - Age distribution
   - Gender split
   - Top areas (pincode)

**Analytics Dashboard:**
- Interactive charts (Recharts)
- Filters applied globally
- Date range picker

#### H. Settings (`/(hospital)/settings`)

**Hospital Profile:**
- Name, address, phone, email
- Logo upload (to Supabase storage)
- Working hours (daily schedule)

**User Settings:**
- Change password
- Notification preferences (email, SMS, in-app)

---

## 4. Admin Portal Flow

### 4.1 Admin Dashboard (`/admin/dashboard`)

**Metrics:**
- Total hospitals (active/pending)
- Total patients, doctors
- Platform revenue (future)
- System health indicators

**Recent Activity Feed:**
- New hospital registrations
- High-priority support tickets (future)

### 4.2 Hospital Management (`/admin/hospitals`)

**List:**
- Table: Hospital name, email, phone, status, created date, actions
- Filters: Status (pending, active, suspended, rejected)

**Actions:**
- Approve hospital (change status `pending` → `active`)
- Reject hospital (with reason)
- Suspend hospital (temporary block)
- View hospital details (modal)

### 4.3 Admin Settings
- Platform-wide configuration
- Feature flags
- Notification templates

---

## 5. Shared Flows (Auth)

### 5.1 Middleware Behavior (`middleware.ts`)

**Protected Route Logic:**
```typescript
1. Inspect request URL
2. Check for session cookie
3. If cookie exists & valid → allow
4. If cookie invalid/missing:
   - If route is in (patient) group → redirect to /login
   - If route is in (hospital) group → redirect to /hospital/login
   - If route is in (admin) group → redirect to /admin/login
5. Token refresh if near expiry
```

### 5.2 Session Lifecycle

```
Login → Create JWT → Set HTTP-only cookie → Redirect
         ↓
    Cookie sent with each request
         ↓
    Middleware validates JWT signature
         ↓
    Token decodes user ID + role
         ↓
    Render page or API route
         ↓
    Token expires (1 hour)
         ↓
    Refresh token used to get new JWT OR re-login
```

### 5.3 Logout Flow

```
Click Logout → POST /api/auth/logout
    ↓
Server: Invalidate session in Redis
    ↓
Clear session cookie (set expiry 0)
    ↓
Redirect to login page
```

---

## 6. Interactive Flow Diagrams

### 6.1 Complete Navigation Map

```
Home (Landing)
├─ → / (patient portal entry)
│   ├─ → /login
│   ├─ → /register
│   ├─ → /onboarding
│   ├─ → /search (find doctors)
│   │   └─ → /doctors/[id] (doctor profile)
│   │       └─ → /book (appointment booking flow)
│   ├─ → /appointments
│   │   ├─ → /appointments/[id] (details)
│   │   └─ → /appointments/[id]/reschedule
│   └─ → /profile
│
├─ → /hospital/login
│   └─ → /hospital/dashboard
│       ├─ → /hospital/doctors
│       ├─ → /hospital/appointments
│       ├─ → /hospital/staff
│       ├─ → /hospital/care-journeys
│       ├─ → /hospital/reports
│       └─ → /hospital/settings
│
├─ → /admin/login
│   └─ → /admin/dashboard
│       ├─ → /admin/hospitals
│       └─ → /admin/settings
│
└─ → /api/* (REST endpoints)
```

### 6.2 Booking Flow State Machine

```
[Start: Patient clicks "Book" on doctor profile]
    ↓
[Select Date]
    ↓
[Select Time Slot]
    ↓
[Enter Reason & Symptoms]
    ↓
[Confirm Booking]
    ↓
[API: POST /api/appointments]
    ↓
[Success?] → Yes → [Show Success UI, send notifications]
    ↓  No
[Show Error Message] → [Allow retry]
```

### 6.3 Authentication Decision Tree

```
User arrives at portal
    ↓
Which portal? (patient / hospital / admin)
    ↓
Is user authenticated? (check session cookie)
    ↓
Yes → Redirect to portal dashboard
    ↓
No → Show login page
    ↓
After login → Validate credentials
    ↓
Valid? → Yes → Create session → Redirect to dashboard
    ↓  No
Show error → Return to login
```

---

## 7. Edge Cases & Error States

| Scenario | Flow |
|----------|------|
| **No internet** | Show offline banner, cached data only |
| **OTP not received** | "Resend OTP" button (60s cooldown) |
| **Session expired** | Auto-redirect to login with `?redirect=` param |
| **Doctor unavailable** | Gray out slots, show "Fully booked" |
| **Appointment conflict** | Show error: "You already have an appointment at this time" |
| **Hospital not approved** | Show "Pending approval" message on login attempt |
| **404 Page** | Custom 404 page with portal navigation |
| **403 Forbidden** | Access denied page explaining role requirement |

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-12  
**Owner**: Haspataal Product & Design Team
