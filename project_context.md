# Haspataal Project Context

## Overview
**Haspataal** is a dual-portal healthcare management platform serving both patients and hospitals. Built with Next.js 14 (App Router), React 18, and Supabase, it features a modern responsive UI using Tailwind CSS and Radix UI components.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 14.2.3 (App Router) |
| Language | JavaScript (ES6+) + JSX |
| Styling | Tailwind CSS 3.4.1 |
| UI Components | Radix UI + shadcn/ui |
| Backend/DB | Supabase (@supabase/supabase-js 2.43.0) |
| State Management | React Hooks, Redux (@reduxjs/toolkit, react-redux) |
| Forms | React Hook Form 7.51.5 |
| Validation | Zod 3.23.8 |
| Charts | Chart.js 4.4.2 + react-chartjs-2 5.2.0 |
| Notifications | Sonner 1.4.41 |
| Rich Text | Novel (editor) |
| OTP Input | react-otp-input 3.1.1 |

---

## Project Structure

```
haspataal/
├── app/                          # Next.js App Router
│   ├── (hospital)/               # Hospital portal route group
│   │   ├── hospital/
│   │   │   ├── page.js           # Hospital portal entry
│   │   │   ├── dashboard/
│   │   │   │   ├── layout.tsx    # Dashboard layout (Sidebar + Topbar)
│   │   │   │   ├── page.tsx      # Dashboard home
│   │   │   │   ├── reports/
│   │   │   │   ├── appointments/
│   │   │   │   ├── staff/
│   │   │   │   ├── help/
│   │   │   │   └── settings/
│   │   └── layout.tsx            # Hospital portal layout
│   ├── (patient)/                # Patient portal route group
│   │   ├── layout.tsx            # Patient portal layout
│   │   ├── page.js               # Patient portal entry
│   │   ├── search/               # Doctor search
│   │   ├── doctors/[id]/         # Doctor profile
│   │   ├── appointments/         # Appointments management
│   │   ├── login/                # Patient login
│   │   ├── register/             # Patient registration
│   │   └── components/           # Patient portal components
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication APIs
│   │   ├── test-db/              # Database test endpoint
│   │   └── send-otp/             # OTP sending API
│   ├── globals.css               # Global styles
│   └── layout.tsx                # Root layout
├── components/                   # Shared components
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── dropdown-menu.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── sheet.tsx
│       └── ...
├── lib/                          # Utility functions
│   ├── utils.ts                  # cn() utility
│   └── actions.js                # Server actions
├── store/                        # Redux store
│   └── store.ts                  # Redux configuration
├── providers/                    # Context providers
│   └── auth.js                   # Auth context/provider
├── utils/                        # Utility functions
│   └── utils.js                  # dateInput utils
├── public/                       # Static assets
│   └── (images)
├── scratch/                      # Development utilities
│   ├── create_missing_tables.js  # DB table creation
│   ├── fix_missing_column.js     # Schema fixes
│   ├── fix_hospital_login.js     # Login debugging
│   ├── list_tables.js            # DB introspection
│   └── ...
├── middleware.ts                 # Next.js middleware (auth)
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── components.json               # shadcn/ui config
└── package.json                  # Dependencies
```

---

## Key Dependencies

### Core
- next: ^14.2.3
- react: ^18
- react-dom: ^18
- typescript: ^5

### Database & Auth
- @supabase/supabase-js: ^2.43.0
- @supabase/ssr: ^0.3.0

### State Management
- @reduxjs/toolkit: ^2.2.5
- react-redux: ^9.1.2

### Forms & Validation
- react-hook-form: ^7.51.5
- @hookform/resolvers: ^3.6.0
- zod: ^3.23.8

### UI Components
- @radix-ui/* (various primitives)
- class-variance-authority: ^0.7.0
- clsx: ^2.1.1
- tailwind-merge: ^2.3.0
- lucide-react: ^0.379.0

### Features
- chart.js: ^4.4.2
- react-chartjs-2: ^5.2.0
- novel: ^0.5.0 (rich text editor)
- react-otp-input: ^3.1.1
- sonner: ^1.4.41 (toasts)

---

## Database Schema (Supabase)

### Tables

#### 1. **patients**
```sql
- id: int8 (PK)
- name: text
- phone: text (unique)
- email: text (unique)
- date_of_birth: date
- age: int8
- password: text (hashed)
- gender: text
- blood_group: text
- pincode: int8
- created_at: timestamptz
- status: text
- blocked: bool
```

#### 2. **hospitals**
```sql
- id: int8 (PK)
- name: text
- address: text
- phone: text (unique)
- email: text (unique)
- password: text (hashed)
- admin_id: int8
- created_at: timestamptz
- status: text
- blocked: bool
- website: text
```

#### 3. **doctors**
```sql
- id: int8 (PK)
- name: text
- phone: text (unique)
- email: text (unique)
- password: text (hashed)
- specialization: text
- hospital_id: int8 (FK -> hospitals)
- created_at: timestamptz
- status: text
- blocked: bool
- exp: int8 (years of experience)
- fees: int8 (consultation fees)
```

#### 4. **appointments**
```sql
- id: int8 (PK)
- patient_id: int8 (FK -> patients)
- doctor_id: int8 (FK -> doctors)
- hospital_id: int8 (FK -> hospitals)
- appointment_date: date
- time_slot: text
- status: text
- created_at: timestamptz
- reason: text
- notes: text
```

#### 5. **care_journey**
```sql
- id: int8 (PK)
- patient_id: int8 (FK -> patients)
- hospital_id: int8 (FK -> hospitals)
- title: text
- description: text
- start_date: date
- end_date: date
- status: text
- created_at: timestamptz
- updated_at: timestamptz
- priority: text
- assigned_doctor: int8 (FK -> doctors)
```

---

## Authentication Flow

### Patient Authentication
- Phone-based login with OTP
- Session management via Supabase Auth
- Middleware (`middleware.ts`) handles route protection

### Hospital Authentication
- Email + Password login (hashed passwords in hospitals table)
- Session-based authentication
- Logout via `/api/auth/logout`

### Auth Files
- `middleware.ts` - Route protection and redirects
- `providers/auth.js` - Auth context and logic
- `app/api/auth/logout/route.ts` - Logout API

---

## Portal Structure

### Patient Portal (`(patient)`)
**Route Group:** `(patient)`

| Route | Purpose |
|-------|---------|
| `/` | Portal entry - PortalCards for navigation |
| `/login` | Patient login with OTP |
| `/register` | Patient registration |
| `/search` | Doctor search |
| `/doctors/[id]` | Doctor profile & booking |
| `/appointments` | View/manage appointments |

**Components:**
- `Footer` - Portal navigation links
- `FooterLinks` - Individual link items
- `PortalCards` - Grid of portal options
- `PortalCard` - Individual card component

### Hospital Portal (`(hospital)`)
**Route Group:** `(hospital)`

| Route | Purpose |
|-------|---------|
| `/hospital` | Hospital portal entry/login |
| `/hospital/dashboard` | Dashboard overview |
| `/hospital/dashboard/reports` | Reports & analytics |
| `/hospital/dashboard/appointments` | Appointment management |
| `/hospital/dashboard/staff` | Staff management |
| `/hospital/dashboard/help` | Help documentation |
| `/hospital/dashboard/settings` | Hospital settings |

**Layout:** `dashboard/layout.tsx`
- `Sidebar` - Navigation sidebar
- `Topbar` - Header with user actions

---

## Configuration Files

### `next.config.js`
```javascript
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
}
```

### `tailwind.config.ts`
- Custom color scheme with CSS variables
- Dark mode support via class
- Custom border-radius, animations
- Extended colors: primary, secondary, destructive, muted, accent, popover, card

### `components.json`
- Style: default
- Base color: slate
- Component aliases: `@/components/*`
- Tailwind CSS v3

---

## Environment Variables (Expected)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Key Features

### Patient Features
1. **Phone-based login** - OTP authentication
2. **Doctor search** - Search doctors by specialty, hospital
3. **Appointment booking** - Book slots with doctors
4. **Appointment management** - View, reschedule, cancel
5. **Care journey tracking** - Track treatment progress

### Hospital Features
1. **Staff management** - Manage doctors and hospital staff
2. **Appointment management** - View and manage all appointments
3. **Analytics & reports** - Charts and data visualization
4. **Care journey management** - Create and track patient care plans
5. **Settings** - Hospital profile and configuration

---

## Component Library (shadcn/ui)

Pre-installed components in `components/ui/`:
- button, input, select
- dropdown-menu, popover, sheet
- card, badge, avatar
- dialog, toast, checkbox
- radio-group, textarea
- command (cmdk)
- calendar (date-picker)

---

## Development Utilities (`scratch/`)

| Script | Purpose |
|--------|---------|
| `create_missing_tables.js` | Create Supabase tables |
| `fix_missing_column.js` | Add missing columns |
| `fix_hospital_login.js` | Debug hospital login |
| `list_tables.js` | List all DB tables |
| `check_all_journey_columns.js` | Verify care_journey schema |
| `check_care_journey_columns.js` | Check specific columns |
| `check_passwords.js` | Password validation debugging |
| `find_valid_logins.js` | Find working logins |
| `get_logins.js` | Retrieve login credentials |

---

## Middleware Behavior

**File:** `middleware.ts`

- Handles authentication state
- Redirects unauthenticated users
- Protects `/hospital/dashboard/*` routes
- Manages session tokens

---

## Notes

- Uses **App Router** (app directory) - Next.js 14+ pattern
- **Route groups** for clean URLs: `(hospital)` and `(patient)`
- **Supabase** for database + authentication
- **Redux** for global state management
- **Tailwind CSS** for all styling
- **Radix UI** primitives with custom styling
- **Zod** for form validation
- **Sonner** for toast notifications
