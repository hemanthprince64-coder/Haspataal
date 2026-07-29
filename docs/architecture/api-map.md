# API Map

This file lists the API endpoints (API Routes and core Service Actions) exposed by the applications.

## API INVENTORY

| Method | Route / Action Name | Purpose | Used By |
| --- | --- | --- | --- |
| POST | `/api/auth/logout` | Logout current user and clear session | Both Portals / Next.js Middleware |
| POST | `loginHospital` | Hospital login Action | Hospital Portal Login Page |
| POST | `registerHospital` | Hospital registration Action | Hospital Portal Register Page |
| POST | `createVisitAction` | Create patient HMS visit Action | Reception / Doctor Dashboard |
| POST | `completeVisitHospital` | Complete visit and trigger AI care journey | Doctor Dashboard |
| POST | `addDoctorAction` | Add new doctor | Hospital Admin Dashboard |
| POST | `removeDoctorAction` | Remove/archive doctor | Hospital Admin Dashboard |
| POST | `patientLogin` | Patient login via OTP verification | Patient Portal Login Page |
| POST | `requestOtpAction` | Request OTP code generation | Patient Portal Login Page |
| POST | `patientRegister` | Register new patient account | Patient Portal Register Page |
| GET | `/api/hospitals` | List hospitals with filters | Patient Portal Search |
| GET | `/api/diagnostics` | Diagnostics list and pricing | Hospital HMS / Patient Portal |
