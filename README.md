# Haspataal MVP

**Version**: 1.0.0  
**Stack**: Next.js 14+ (App Router), React, Vanilla CSS, In-Memory Data Store

## Overview
Haspataal is a dual-platform healthcare system connecting patients with hospitals. It is designed as a minimalist MVP to demonstrate core workflows without heavy backend dependencies.

- **Patient Portal**: `http://localhost:3000/` - Search doctors, book appointments, view history.
- **Hospital Portal**: `http://localhost:3000/hospital` - Staff login, dashboards, billing, and reports.

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm (Node Package Manager)

### Installation
1.  Open your terminal in this directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

This project uses the Next.js **App Router**.

```
/app
├── (patient)          # Patient-facing routes (haspataal.com simulation)
│   ├── book           # Appointment booking logic
│   ├── login          # Patient authentication
│   ├── profile        # Patient history & profile
│   ├── search         # Doctor discovery
│   └── page.js        # Landing page
├── (hospital)         # Hospital-facing routes (haspataal.in simulation)
│   ├── dashboard      # Protected staff area (Billing, Reports)
│   ├── login          # Staff authentication
│   ├── register       # Hospital onboarding
│   └── page.js        # Hospital landing page
├── actions.js         # Server Actions (Backend Logic for Forms)
└── global.css         # Global design system & variables

/lib
├── data.js            # Mock Database (In-Memory JSON Store)
└── services.js        # Business Logic & Service Layer
```

## Developer Notes

### Data Persistence
> **Note**: This MVP uses an **in-memory database** (`lib/data.js`). 
> **Restarting the server (stopping the terminal) will RESET all data.**
> To make data persistent, replace `lib/data.js` with a connection to PostgreSQL or MongoDB.

### Authentication
Authentication is simulated via **Cookies**.
- **Hospital Staff**: Checks `session_user` cookie.
- **Patients**: Checks `session_patient` cookie.
- Logic is handled in `app/actions.js` and `lib/services.js`.

### Styling
- We use **Vanilla CSS** with CSS Variables defined in `app/globals.css`.
- No Tailwind or Bootstrap is used, keeping the project lightweight and easy to customize.

## Feature Verification

### 1. Hospital Workflow
- **Register**: Go to `/hospital/register`. Create a new hospital (e.g., "Apollo", City: "Mumbai").
- **Login**: Use the mobile number and password created.
- **Billing**: Go to "OPD & Billing" to create a visit for a patient.
- **Reports**: Verify the visit appears in Reports.

### 2. Patient Workflow
- **Search**: Go to `/search`. Filter by city created above.
- **Book**: Select a doctor and book a slot.
- **History**: Go to `/profile` (requires login) to see the appointment.

## Exporting & Sharing
To share this project with other developers:
1.  Delete the `node_modules` folder (it is heavy and can be re-installed).
2.  Zip the entire `haspataal` folder.
3.  Send the Zip file. The other developer just needs to unzip and run `npm install` then `npm run dev`.
