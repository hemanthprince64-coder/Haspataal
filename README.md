# Haspataal - Hospital Management Platform

Haspataal is a comprehensive B2B2C platform connecting hospitals, doctors, and patients. It streamlines OPD management, appointment booking, and health record maintenance.

## Project Structure

-   `haspataal-in`: The main Next.js web application (Patient Portal, Hospital Admin, Super Admin).
-   `haspataal-mobile`: The React Native (Expo) mobile application for patients.
-   `workers`: Background job processors (e.g., notifications).

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   PostgreSQL
-   Redis (for background jobs)

### 1. Web Application (`haspataal-in`)

1.  Navigate to the directory:
    ```bash
    cd haspataal-in
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env` (see `.env.example`).
4.  Run database migrations:
    ```bash
    npx prisma migrate dev
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3001`.

### 2. Mobile App (`haspataal-mobile`)

1.  Navigate to the directory:
    ```bash
    cd haspataal-mobile
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Expo development server:
    ```bash
    npx expo start
    ```
4.  Scan the QR code with the Expo Go app on your phone.

## 🛠️ Key Features

-   **Hospital Management**: Manage doctors, staff, and appointments.
-   **Patient Portal**: Book appointments, view health records.
-   **ABDM Integration**: ABHA linking and consent management (Sandbox).
-   **Analytics**: Admin and Hospital dashboards powerd by Recharts and PostHog.

## 📚 Documentation
-   [Deployment Guide](./DEPLOYMENT.md)
-   [ABDM Guide](./ABDM_GUIDE.md)
