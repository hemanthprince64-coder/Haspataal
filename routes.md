# Routes Map

This file documents all the Next.js App Router routes discovered across the application portals.

## ROUTES TABLE

| Route | App / File | Purpose | Auth Required |
| --- | --- | --- | --- |
| `/(agent)/agent/dashboard` | `patient-portal/(agent)/agent/dashboard/page.js` | Dashboard Subpage | Yes |
| `/(agent)/agent/login` | `patient-portal/(agent)/agent/login/page.js` | General Page | No |
| `/(agent)/agent/register` | `patient-portal/(agent)/agent/register/page.js` | General Page | No |
| `/(doctor)/doctor/register` | `patient-portal/(doctor)/doctor/register/page.js` | General Page | No |
| `/(hospital)/hospital/dashboard/analytics` | `patient-portal/(hospital)/hospital/dashboard/analytics/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/anc` | `patient-portal/(hospital)/hospital/dashboard/anc/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/billing` | `patient-portal/(hospital)/hospital/dashboard/billing/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/diagnostics` | `patient-portal/(hospital)/hospital/dashboard/diagnostics/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/doctors` | `patient-portal/(hospital)/hospital/dashboard/doctors/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/notifications` | `patient-portal/(hospital)/hospital/dashboard/notifications/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/opd` | `patient-portal/(hospital)/hospital/dashboard/opd/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/opd/triage` | `patient-portal/(hospital)/hospital/dashboard/opd/triage/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard` | `patient-portal/(hospital)/hospital/dashboard/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/pharmacy` | `patient-portal/(hospital)/hospital/dashboard/pharmacy/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/reports` | `patient-portal/(hospital)/hospital/dashboard/reports/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/reports/print/[visitId]` | `patient-portal/(hospital)/hospital/dashboard/reports/print/[visitId]/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/retention` | `patient-portal/(hospital)/hospital/dashboard/retention/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/settlements` | `patient-portal/(hospital)/hospital/dashboard/settlements/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/billing` | `patient-portal/(hospital)/hospital/dashboard/setup/billing/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/branches` | `patient-portal/(hospital)/hospital/dashboard/setup/branches/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/departments` | `patient-portal/(hospital)/hospital/dashboard/setup/departments/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/diagnostics` | `patient-portal/(hospital)/hospital/dashboard/setup/diagnostics/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/doctors` | `patient-portal/(hospital)/hospital/dashboard/setup/doctors/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/identity` | `patient-portal/(hospital)/hospital/dashboard/setup/identity/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/integrations` | `patient-portal/(hospital)/hospital/dashboard/setup/integrations/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/marketplace` | `patient-portal/(hospital)/hospital/dashboard/setup/marketplace/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/opd` | `patient-portal/(hospital)/hospital/dashboard/setup/opd/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup` | `patient-portal/(hospital)/hospital/dashboard/setup/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/pharmacy` | `patient-portal/(hospital)/hospital/dashboard/setup/pharmacy/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/retention` | `patient-portal/(hospital)/hospital/dashboard/setup/retention/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/staff` | `patient-portal/(hospital)/hospital/dashboard/setup/staff/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/setup/wards` | `patient-portal/(hospital)/hospital/dashboard/setup/wards/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/dashboard/wards` | `patient-portal/(hospital)/hospital/dashboard/wards/page.tsx` | Dashboard Subpage | Yes |
| `/(hospital)/hospital/login` | `patient-portal/(hospital)/hospital/login/page.js` | General Page | No |
| `/(hospital)/hospital` | `patient-portal/(hospital)/hospital/page.js` | General Page | No |
| `/(hospital)/hospital/register` | `patient-portal/(hospital)/hospital/register/page.js` | General Page | No |
| `/(hospital)/hospital/register/success` | `patient-portal/(hospital)/hospital/register/success/page.js` | General Page | No |
| `/(hospital)/hospital/setup` | `patient-portal/(hospital)/hospital/setup/page.tsx` | General Page | No |
| `/(hospital)/lab/dashboard` | `patient-portal/(hospital)/lab/dashboard/page.js` | Dashboard Subpage | Yes |
| `/(hospital)/lab/register` | `patient-portal/(hospital)/lab/register/page.js` | General Page | No |
| `/(patient)/addresses` | `patient-portal/(patient)/addresses/page.js` | General Page | No |
| `/(patient)/appointments` | `patient-portal/(patient)/appointments/page.js` | General Page | No |
| `/(patient)/book` | `patient-portal/(patient)/book/page.js` | General Page | No |
| `/(patient)/book/[id]` | `patient-portal/(patient)/book/[id]/page.js` | General Page | No |
| `/(patient)/contact` | `patient-portal/(patient)/contact/page.js` | General Page | No |
| `/(patient)/doctor/[id]` | `patient-portal/(patient)/doctor/[id]/page.js` | General Page | No |
| `/(patient)/emergency` | `patient-portal/(patient)/emergency/page.js` | General Page | No |
| `/(patient)/hospitals` | `patient-portal/(patient)/hospitals/page.tsx` | General Page | No |
| `/(patient)/hospitals/[id]` | `patient-portal/(patient)/hospitals/[id]/page.js` | General Page | No |
| `/(patient)/insurance` | `patient-portal/(patient)/insurance/page.js` | General Page | No |
| `/(patient)/lab-tests` | `patient-portal/(patient)/lab-tests/page.js` | General Page | No |
| `/(patient)/login` | `patient-portal/(patient)/login/page.js` | General Page | No |
| `/(patient)/medchat` | `patient-portal/(patient)/medchat/page.js` | General Page | No |
| `/(patient)/medical-history` | `patient-portal/(patient)/medical-history/page.js` | General Page | No |
| `/(patient)/medications` | `patient-portal/(patient)/medications/page.js` | General Page | No |
| `/(patient)` | `patient-portal/(patient)/page.tsx` | General Page | No |
| `/(patient)/pharmacy` | `patient-portal/(patient)/pharmacy/page.js` | General Page | No |
| `/(patient)/prescriptions` | `patient-portal/(patient)/prescriptions/page.js` | General Page | No |
| `/(patient)/profile/details` | `patient-portal/(patient)/profile/details/page.js` | General Page | No |
| `/(patient)/profile/edit` | `patient-portal/(patient)/profile/edit/page.js` | General Page | No |
| `/(patient)/profile` | `patient-portal/(patient)/profile/page.js` | General Page | No |
| `/(patient)/records` | `patient-portal/(patient)/records/page.js` | General Page | No |
| `/(patient)/recovery` | `patient-portal/(patient)/recovery/page.js` | General Page | No |
| `/(patient)/search` | `patient-portal/(patient)/search/page.tsx` | General Page | No |
| `/(patient)/tracker` | `patient-portal/(patient)/tracker/page.tsx` | General Page | No |
| `/(patient)/vaccinations` | `patient-portal/(patient)/vaccinations/page.js` | General Page | No |
| `/(patient)/vitals` | `patient-portal/(patient)/vitals/page.js` | General Page | No |
| `/(patient)/wallet` | `patient-portal/(patient)/wallet/page.js` | General Page | No |
| `/admin/dashboard/hospitals` | `patient-portal/admin/dashboard/hospitals/page.js` | Dashboard Subpage | Yes |
| `/admin/dashboard` | `patient-portal/admin/dashboard/page.js` | Dashboard Subpage | Yes |
| `/admin` | `patient-portal/admin/page.js` | General Page | No |
| `/api/ai/process-visit` | `patient-portal/api/ai/process-visit/route.ts` | API Endpoint | No |
| `/api/care/process-nudges` | `patient-portal/api/care/process-nudges/route.ts` | API Endpoint | No |
| `/api/hospital/anc/export` | `patient-portal/api/hospital/anc/export/route.ts` | API Endpoint | No |
| `/api/hospital/anc/profile` | `patient-portal/api/hospital/anc/profile/route.ts` | API Endpoint | No |
| `/api/hospital/anc/referral` | `patient-portal/api/hospital/anc/referral/route.ts` | API Endpoint | No |
| `/api/hospital/anc/visit` | `patient-portal/api/hospital/anc/visit/route.ts` | API Endpoint | No |
| `/api/hospital/asha/visit-log` | `patient-portal/api/hospital/asha/visit-log/route.ts` | API Endpoint | No |
| `/api/hospital/billing/gateways` | `patient-portal/api/hospital/billing/gateways/route.ts` | API Endpoint | No |
| `/api/hospital/billing/invoices` | `patient-portal/api/hospital/billing/invoices/route.ts` | API Endpoint | No |
| `/api/hospital/billing/invoices/[id]/finalize` | `patient-portal/api/hospital/billing/invoices/[id]/finalize/route.ts` | API Endpoint | No |
| `/api/hospital/billing/invoices/[id]/pay` | `patient-portal/api/hospital/billing/invoices/[id]/pay/route.ts` | API Endpoint | No |
| `/api/hospital/billing/profile` | `patient-portal/api/hospital/billing/profile/route.ts` | API Endpoint | No |
| `/api/hospital/billing/services` | `patient-portal/api/hospital/billing/services/route.ts` | API Endpoint | No |
| `/api/hospital/billing/services/[id]` | `patient-portal/api/hospital/billing/services/[id]/route.ts` | API Endpoint | No |
| `/api/hospital/billing/test-gateway` | `patient-portal/api/hospital/billing/test-gateway/route.ts` | API Endpoint | No |
| `/api/hospital/branches` | `patient-portal/api/hospital/branches/route.ts` | API Endpoint | No |
| `/api/hospital/branches/[id]` | `patient-portal/api/hospital/branches/[id]/route.ts` | API Endpoint | No |
| `/api/hospital/departments` | `patient-portal/api/hospital/departments/route.ts` | API Endpoint | No |
| `/api/hospital/departments/[id]` | `patient-portal/api/hospital/departments/[id]/route.ts` | API Endpoint | No |
| `/api/hospital/departments/[id]/units/reorder` | `patient-portal/api/hospital/departments/[id]/units/reorder/route.ts` | API Endpoint | No |
| `/api/hospital/departments/[id]/units` | `patient-portal/api/hospital/departments/[id]/units/route.ts` | API Endpoint | No |
| `/api/hospital/diagnostics/orders` | `patient-portal/api/hospital/diagnostics/orders/route.ts` | API Endpoint | No |
| `/api/hospital/diagnostics/orders/[id]/results` | `patient-portal/api/hospital/diagnostics/orders/[id]/results/route.ts` | API Endpoint | No |
| `/api/hospital/diagnostics/pricing` | `patient-portal/api/hospital/diagnostics/pricing/route.ts` | API Endpoint | No |
| `/api/hospital/doctors` | `patient-portal/api/hospital/doctors/route.ts` | API Endpoint | No |
| `/api/hospital/followups` | `patient-portal/api/hospital/followups/route.ts` | API Endpoint | No |
| `/api/hospital/identity` | `patient-portal/api/hospital/identity/route.ts` | API Endpoint | No |
| `/api/hospital/integrations` | `patient-portal/api/hospital/integrations/route.ts` | API Endpoint | No |
| `/api/hospital/ipd/admissions` | `patient-portal/api/hospital/ipd/admissions/route.ts` | API Endpoint | No |
| `/api/hospital/ipd/admissions/[id]/discharge` | `patient-portal/api/hospital/ipd/admissions/[id]/discharge/route.ts` | API Endpoint | No |
| `/api/hospital/ipd/beds` | `patient-portal/api/hospital/ipd/beds/route.ts` | API Endpoint | No |
| `/api/hospital/marketplace` | `patient-portal/api/hospital/marketplace/route.ts` | API Endpoint | No |
| `/api/hospital/notifications/mappings` | `patient-portal/api/hospital/notifications/mappings/route.ts` | API Endpoint | No |
| `/api/hospital/notifications` | `patient-portal/api/hospital/notifications/route.ts` | API Endpoint | No |
| `/api/hospital/notifications/templates` | `patient-portal/api/hospital/notifications/templates/route.ts` | API Endpoint | No |
| `/api/hospital/opd/appointments` | `patient-portal/api/hospital/opd/appointments/route.ts` | API Endpoint | No |
| `/api/hospital/opd/queue` | `patient-portal/api/hospital/opd/queue/route.ts` | API Endpoint | No |
| `/api/hospital/opd-config` | `patient-portal/api/hospital/opd-config/route.ts` | API Endpoint | No |
| `/api/hospital/pharmacy/dispense` | `patient-portal/api/hospital/pharmacy/dispense/route.ts` | API Endpoint | No |
| `/api/hospital/pharmacy/stock` | `patient-portal/api/hospital/pharmacy/stock/route.ts` | API Endpoint | No |
| `/api/hospital/pharmacy/suppliers` | `patient-portal/api/hospital/pharmacy/suppliers/route.ts` | API Endpoint | No |
| `/api/hospital/retention/rules` | `patient-portal/api/hospital/retention/rules/route.ts` | API Endpoint | No |
| `/api/hospital/roles-permissions` | `patient-portal/api/hospital/roles-permissions/route.ts` | API Endpoint | No |
| `/api/hospital/setup/activate` | `patient-portal/api/hospital/setup/activate/route.ts` | API Endpoint | No |
| `/api/hospital/setup/completion` | `patient-portal/api/hospital/setup/completion/route.ts` | API Endpoint | No |
| `/api/hospital/setup/marketplace` | `patient-portal/api/hospital/setup/marketplace/route.ts` | API Endpoint | No |
| `/api/hospital/setup/staff` | `patient-portal/api/hospital/setup/staff/route.ts` | API Endpoint | No |
| `/api/hospital/setup/stage` | `patient-portal/api/hospital/setup/stage/route.ts` | API Endpoint | No |
| `/api/hospital/setup/workflow` | `patient-portal/api/hospital/setup/workflow/route.ts` | API Endpoint | No |
| `/api/hospital/staff/invite` | `patient-portal/api/hospital/staff/invite/route.ts` | API Endpoint | No |
| `/api/hospital/staff/invites` | `patient-portal/api/hospital/staff/invites/route.ts` | API Endpoint | No |
| `/api/hospital/staff/permissions` | `patient-portal/api/hospital/staff/permissions/route.ts` | API Endpoint | No |
| `/api/hospital/staff` | `patient-portal/api/hospital/staff/route.ts` | API Endpoint | No |
| `/api/hospital/staff/[id]` | `patient-portal/api/hospital/staff/[id]/route.ts` | API Endpoint | No |
| `/api/hospital/units/[id]` | `patient-portal/api/hospital/units/[id]/route.ts` | API Endpoint | No |
| `/api/hospital/wards/beds` | `patient-portal/api/hospital/wards/beds/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/analytics/revenue` | `patient-portal/api/hospitals/[hospitalId]/analytics/revenue/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/dashboard/metrics` | `patient-portal/api/hospitals/[hospitalId]/dashboard/metrics/route.ts` | Dashboard Subpage | Yes |
| `/api/hospitals/[hospitalId]/events` | `patient-portal/api/hospitals/[hospitalId]/events/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/followups` | `patient-portal/api/hospitals/[hospitalId]/followups/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/followups/[followupId]/remind` | `patient-portal/api/hospitals/[hospitalId]/followups/[followupId]/remind/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/notifications/today` | `patient-portal/api/hospitals/[hospitalId]/notifications/today/route.ts` | API Endpoint | No |
| `/api/hospitals/[hospitalId]/retention/kpi` | `patient-portal/api/hospitals/[hospitalId]/retention/kpi/route.ts` | API Endpoint | No |
| `/api/marketplace/doctors` | `patient-portal/api/marketplace/doctors/route.ts` | API Endpoint | No |
| `/api/marketplace/hospitals` | `patient-portal/api/marketplace/hospitals/route.ts` | API Endpoint | No |
| `/api/sync/replay` | `patient-portal/api/sync/replay/route.ts` | API Endpoint | No |
| `/api/v1/escalations` | `patient-portal/api/v1/escalations/route.ts` | API Endpoint | No |
| `/api/v1/escalations/[id]` | `patient-portal/api/v1/escalations/[id]/route.ts` | API Endpoint | No |
| `/api/webhooks/sms-ussd` | `patient-portal/api/webhooks/sms-ussd/route.ts` | API Endpoint | No |
| `/api/webhooks/ussd` | `patient-portal/api/webhooks/ussd/route.ts` | API Endpoint | No |
| `/hospital/escalations` | `patient-portal/hospital/escalations/page.tsx` | General Page | No |
| `/shadcn-test` | `patient-portal/shadcn-test/page.tsx` | General Page | No |
| `/[city]/[specialty]` | `patient-portal/[city]/[specialty]/page.tsx` | General Page | No |
| `/admin/audit` | `hospital-hms/admin/audit/page.js` | Hospital HMS Page | Yes |
| `/admin` | `hospital-hms/admin/page.js` | Hospital HMS Page | Yes |
| `/api/admin/applications/approve` | `hospital-hms/api/admin/applications/approve/route.ts` | Hospital HMS Page | Yes |
| `/api/admin/applications` | `hospital-hms/api/admin/applications/route.ts` | Hospital HMS Page | Yes |
| `/api/auth/[...nextauth]` | `hospital-hms/api/auth/[...nextauth]/route.js` | Hospital HMS Page | Yes |
| `/api/debug/health` | `hospital-hms/api/debug/health/route.ts` | Hospital HMS Page | Yes |
| `/api/diagnostics/orders` | `hospital-hms/api/diagnostics/orders/route.ts` | Hospital HMS Page | Yes |
| `/api/diagnostics` | `hospital-hms/api/diagnostics/route.ts` | Hospital HMS Page | Yes |
| `/api/doctors` | `hospital-hms/api/doctors/route.js` | Hospital HMS Page | Yes |
| `/api/hospital/auth/login` | `hospital-hms/api/hospital/auth/login/route.ts` | API Endpoint | No |
| `/api/hospital/auth/register` | `hospital-hms/api/hospital/auth/register/route.ts` | API Endpoint | No |
| `/api/hospital/dashboard-test` | `hospital-hms/api/hospital/dashboard-test/route.ts` | Dashboard Subpage | Yes |
| `/api/patient` | `hospital-hms/api/patient/route.ts` | Hospital HMS Page | Yes |
| `/api/patients` | `hospital-hms/api/patients/route.ts` | Hospital HMS Page | Yes |
| `/api/payments/create-order` | `hospital-hms/api/payments/create-order/route.js` | Hospital HMS Page | Yes |
| `/api/payments/verify` | `hospital-hms/api/payments/verify/route.js` | Hospital HMS Page | Yes |
| `/api/records` | `hospital-hms/api/records/route.js` | Hospital HMS Page | Yes |
| `/api/upload` | `hospital-hms/api/upload/route.js` | Hospital HMS Page | Yes |
| `/api/visits` | `hospital-hms/api/visits/route.ts` | Hospital HMS Page | Yes |
| `/api/webhooks/razorpay` | `hospital-hms/api/webhooks/razorpay/route.ts` | Hospital HMS Page | Yes |
| `/book/[doctorId]` | `hospital-hms/book/[doctorId]/page.js` | Hospital HMS Page | Yes |
| `/dashboard/admin/analytics` | `hospital-hms/dashboard/admin/analytics/page.js` | Dashboard Subpage | Yes |
| `/dashboard/admin/diagnostics` | `hospital-hms/dashboard/admin/diagnostics/page.js` | Dashboard Subpage | Yes |
| `/dashboard/admin/facilities` | `hospital-hms/dashboard/admin/facilities/page.js` | Dashboard Subpage | Yes |
| `/dashboard/admin/orders` | `hospital-hms/dashboard/admin/orders/page.js` | Dashboard Subpage | Yes |
| `/dashboard/billing` | `hospital-hms/dashboard/billing/page.js` | Dashboard Subpage | Yes |
| `/dashboard/doctor/orders` | `hospital-hms/dashboard/doctor/orders/page.js` | Dashboard Subpage | Yes |
| `/dashboard/doctor/orders/[id]` | `hospital-hms/dashboard/doctor/orders/[id]/page.js` | Dashboard Subpage | Yes |
| `/dashboard/doctor` | `hospital-hms/dashboard/doctor/page.js` | Dashboard Subpage | Yes |
| `/dashboard/doctor/record/[patientId]` | `hospital-hms/dashboard/doctor/record/[patientId]/page.js` | Dashboard Subpage | Yes |
| `/dashboard/doctors` | `hospital-hms/dashboard/doctors/page.js` | Dashboard Subpage | Yes |
| `/dashboard/hospital/analytics` | `hospital-hms/dashboard/hospital/analytics/page.js` | Dashboard Subpage | Yes |
| `/dashboard` | `hospital-hms/dashboard/page.js` | Dashboard Subpage | Yes |
| `/dashboard/reports` | `hospital-hms/dashboard/reports/page.js` | Dashboard Subpage | Yes |
| `/dashboard/staff` | `hospital-hms/dashboard/staff/page.js` | Dashboard Subpage | Yes |
| `/login/doctor` | `hospital-hms/login/doctor/page.js` | General Page | No |
| `/login` | `hospital-hms/login/page.js` | General Page | No |
| `/page.js` | `hospital-hms/page.js` | Hospital HMS Page | Yes |
| `/profile/consent` | `hospital-hms/profile/consent/page.js` | Hospital HMS Page | Yes |
| `/profile` | `hospital-hms/profile/page.js` | Hospital HMS Page | Yes |
| `/profile/records` | `hospital-hms/profile/records/page.js` | Hospital HMS Page | Yes |
| `/register` | `hospital-hms/register/page.js` | General Page | No |
| `/search` | `hospital-hms/search/page.js` | Hospital HMS Page | Yes |
| `/book` | `marketing/book/page.js` | General Page | No |
| `/diagnostics` | `marketing/diagnostics/page.js` | General Page | No |
| `/hospitals` | `marketing/hospitals/page.js` | General Page | No |
| `/hospitals/[id]` | `marketing/hospitals/[id]/page.js` | General Page | No |
| `/login` | `marketing/login/page.js` | General Page | No |
| `/page.js` | `marketing/page.js` | General Page | No |
| `/profile/edit` | `marketing/profile/edit/page.js` | General Page | No |
| `/profile` | `marketing/profile/page.js` | General Page | No |
| `/register-hospital` | `marketing/register-hospital/page.js` | General Page | No |
| `/search` | `marketing/search/page.js` | General Page | No |
| `/dashboard/hospitals` | `admin-panel/dashboard/hospitals/page.js` | Dashboard Subpage | Yes |
| `/dashboard` | `admin-panel/dashboard/page.js` | Dashboard Subpage | Yes |
| `/page.tsx` | `admin-panel/page.tsx` | General Page | No |
