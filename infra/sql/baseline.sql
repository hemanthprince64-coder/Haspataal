-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AWAITING_PAYMENT', 'BOOKED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'FOLLOW_UP', 'CANCELLED', 'NO_SHOW', 'REJECTED', 'EXPIRED', 'RESCHEDULE_REQUESTED', 'RESCHEDULE_ACCEPTED', 'RESCHEDULE_DECLINED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF', 'NURSE', 'BILLING', 'PHARMACIST', 'LAB_TECH', 'PATIENT');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'DOCUMENT_PENDING', 'UNDER_VERIFICATION', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('ORDERED', 'SAMPLE_COLLECTED', 'PROCESSED', 'VERIFIED', 'REPORT_READY', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabOrderItemStatus" AS ENUM ('PENDING', 'COLLECTED', 'PROCESSED', 'VERIFIED', 'REPORTED');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL', 'CLINIC');

-- CreateEnum
CREATE TYPE "ClinicTier" AS ENUM ('SINGLE_DOCTOR', 'MULTI_SPECIALITY');

-- CreateEnum
CREATE TYPE "HospitalType" AS ENUM ('HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'MULTISPECIALTY', 'NURSING_HOME', 'CORPORATE');

-- CreateEnum
CREATE TYPE "FollowUpType" AS ENUM ('GENERAL', 'POST_DISCHARGE', 'MEDICATION_REMINDER', 'LAB_RESULT', 'PAYMENT_REMINDER', 'RETENTION');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED', 'NO_RESPONSE');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('GENERAL', 'ICU', 'NICU', 'PRIVATE', 'SEMI_PRIVATE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE', 'CLEANING');

-- CreateEnum
CREATE TYPE "DeptType" AS ENUM ('OPD', 'IPD', 'BOTH', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CONSULTATION', 'PROCEDURE', 'LAB_TEST', 'IMAGING', 'BED_CHARGE', 'MEDICINE', 'PACKAGE');

-- CreateEnum
CREATE TYPE "GatewayProvider" AS ENUM ('RAZORPAY', 'STRIPE', 'CASH', 'UPI');

-- CreateEnum
CREATE TYPE "ShiftType" AS ENUM ('MORNING', 'EVENING', 'NIGHT', 'ROTATIONAL');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('RAZORPAY', 'WHATSAPP_META', 'WHATSAPP_TWILIO', 'WHATSAPP_WATI', 'WHATSAPP_INTERAKT', 'WHATSAPP_GUPSHUP', 'SMS_FAST2SMS', 'SMS_MSG91', 'SMS_TEXTLOCAL', 'SMS_2FACTOR', 'ABHA_ABDM', 'GOOGLE_CALENDAR');

-- CreateEnum
CREATE TYPE "ConsentPurpose" AS ENUM ('APPOINTMENT_BOOKING', 'HEALTH_RECORDS', 'MARKETING');

-- CreateEnum
CREATE TYPE "PatientAcquisitionSource" AS ENUM ('DIRECT', 'SEO', 'WHATSAPP', 'REFERRAL_DOCTOR', 'REFERRAL_CLINIC', 'REFERRAL_HOSPITAL', 'AGENT', 'SOCIAL_MEDIA', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "AIDocumentType" AS ENUM ('OPD_NOTE', 'DISCHARGE_SUMMARY', 'PRESCRIPTION_DRAFT', 'FOLLOW_UP_SUMMARY', 'CLINICAL_SUMMARY');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReferralPriority" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'APPROVED', 'SETTLED');

-- CreateEnum
CREATE TYPE "HandoffStage" AS ENUM ('RECEPTION', 'TRIAGE', 'CONSULTATION', 'INVESTIGATION_LAB', 'INVESTIGATION_RAD', 'DISPENSARY_PHARMACY', 'BILLING', 'DISCHARGE');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BYPASSED');

-- CreateEnum
CREATE TYPE "InsurerType" AS ENUM ('GENERAL_INSURANCE', 'TPA', 'GOVERNMENT');

-- CreateEnum
CREATE TYPE "DegreeType" AS ENUM ('MBBS', 'MD', 'MS', 'DM', 'MCH', 'DNB_SS', 'DNB', 'DIPLOMA', 'FESS', 'FRIENDS', 'OTHER');

-- CreateTable
CREATE TABLE "doctors_master" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "dob" DATE,
    "gender" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profile_photo_url" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "experience_years" INTEGER,
    "password" TEXT,

    CONSTRAINT "doctors_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_identity_docs" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "document_url" TEXT NOT NULL,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_identity_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_registration" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "registration_number" TEXT NOT NULL,
    "council_name" TEXT NOT NULL,
    "registration_year" INTEGER,
    "degree" TEXT,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospitals_master" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT,
    "registration_number" TEXT NOT NULL,
    "gst_number" TEXT,
    "pan_number" TEXT,
    "cin_number" TEXT,
    "hospital_type" TEXT,
    "nabh_accredited" BOOLEAN NOT NULL DEFAULT false,
    "nabl_accredited" BOOLEAN NOT NULL DEFAULT false,
    "bed_strength" INTEGER,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "contact_number" TEXT,
    "official_email" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "account_status" TEXT NOT NULL DEFAULT 'inactive',
    "name" TEXT,
    "password" TEXT,
    "admin_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agent_id" TEXT,
    "type" "HospitalType" NOT NULL DEFAULT 'HOSPITAL',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "brand_color" TEXT,
    "state_registration_number" TEXT,
    "nabh_cert_url" TEXT,
    "nabl_cert_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "working_days" TEXT[],
    "open_time" TEXT,
    "close_time" TEXT,
    "emergency_contact" TEXT,
    "is_multi_branch" BOOLEAN NOT NULL DEFAULT false,
    "invoice_prefix" TEXT NOT NULL DEFAULT 'INV',
    "next_invoice_number" INTEGER NOT NULL DEFAULT 1001,
    "gst_inclusive_pricing" BOOLEAN NOT NULL DEFAULT false,
    "letterhead_template" TEXT,
    "prescription_header" TEXT,
    "prescription_footer" TEXT,
    "is_listed_on_marketplace" BOOLEAN NOT NULL DEFAULT false,
    "marketplace_tagline" TEXT,
    "marketplace_about" TEXT,
    "marketplace_facilities" TEXT[],
    "show_consultation_fees" BOOLEAN NOT NULL DEFAULT true,
    "show_bed_charges" BOOLEAN NOT NULL DEFAULT false,
    "show_package_prices" BOOLEAN NOT NULL DEFAULT false,
    "allow_online_booking" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_policy" TEXT NOT NULL DEFAULT 'FLEXIBLE',
    "deposit_required" BOOLEAN NOT NULL DEFAULT false,
    "deposit_amount" DECIMAL(65,30),
    "ranking_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cover_image_url" TEXT,
    "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "insurance_panels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "custom_cancellation_terms" TEXT,
    "allows_instant_booking" BOOLEAN NOT NULL DEFAULT true,
    "specialities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "facility_type" "FacilityType" NOT NULL DEFAULT 'HOSPITAL',
    "gst_exempt" BOOLEAN NOT NULL DEFAULT false,
    "clinic_tier" "ClinicTier",
    "operating_hours" JSONB,
    "approval_document_url" TEXT,
    "medical_council_number" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "google_location_url" TEXT,

    CONSTRAINT "hospitals_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_facilities" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "icu_available" BOOLEAN NOT NULL DEFAULT false,
    "nicu_available" BOOLEAN NOT NULL DEFAULT false,
    "ot_count" INTEGER NOT NULL DEFAULT 0,
    "emergency_24x7" BOOLEAN NOT NULL DEFAULT false,
    "ambulance_available" BOOLEAN NOT NULL DEFAULT false,
    "pharmacy_available" BOOLEAN NOT NULL DEFAULT false,
    "lab_available" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_admins" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "designation" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "id_document_url" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'pending',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_departments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_services" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "base_price" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_billing_profile" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "bank_account_number" TEXT,
    "bank_ifsc" TEXT,
    "gst_applicable" BOOLEAN NOT NULL DEFAULT false,
    "tds_applicable" BOOLEAN NOT NULL DEFAULT true,
    "commission_percentage" DECIMAL(65,30),
    "payout_cycle" TEXT,
    "invoice_layout" TEXT DEFAULT 'STANDARD',
    "header_text" TEXT,
    "footer_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_billing_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_roles" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "role_name" TEXT NOT NULL,
    "permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_verification_logs" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "verified_by" TEXT,
    "verification_notes" TEXT,
    "verification_status" TEXT,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "hospital_verification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_hospital_affiliations" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT,
    "joining_date" DATE,
    "relieving_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "schedule" TEXT,
    "consultation_fee" DECIMAL(65,30),
    "follow_up_fee" DECIMAL(65,30),
    "follow_up_window_days" INTEGER DEFAULT 7,
    "payload" JSONB,
    "consultation_duration_mins" INTEGER NOT NULL DEFAULT 15,
    "allows_online_booking" BOOLEAN NOT NULL DEFAULT true,
    "branch_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "available_from" TIMESTAMP(3),
    "experience_years" INTEGER,

    CONSTRAINT "doctor_hospital_affiliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_professional_history" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "organization_name" TEXT NOT NULL,
    "designation" TEXT,
    "start_date" DATE,
    "end_date" DATE,
    "proof_document_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_professional_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_roles" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "permissions" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_flags" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "reason" TEXT,
    "flag_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTIONIST',
    "designation" TEXT,
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "id_document_url" TEXT,
    "blood_group" TEXT,
    "department_id" TEXT,
    "shift" "ShiftType",
    "permissions" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "branch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "abha_address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PATIENT',
    "address" TEXT,
    "blood_group" TEXT,
    "dob" DATE,
    "gender" TEXT,
    "pincode" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agent_id" TEXT,
    "country" TEXT,
    "emergency_contact_alt_phone" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "emergency_contact_relation" TEXT,
    "marital_status" TEXT,
    "occupation" TEXT,
    "preferred_doctor" TEXT,
    "preferred_hospital" TEXT,
    "preferred_speciality" TEXT,
    "profile_photo_url" TEXT,
    "state" TEXT,
    "nickname" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_addresses" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Home',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "pincode" TEXT NOT NULL,
    "landmark" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_prescriptions" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "appointment_id" TEXT,
    "type" TEXT NOT NULL,
    "file_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "medicine_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prescription_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "hospital_id" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "slot" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "hospital_id" TEXT,
    "idempotency_key" TEXT,
    "patient_global_id" TEXT,
    "slot_time" TIMESTAMP(3),
    "scheduled_at" TIMESTAMP(3),
    "confirmation_expires_at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_category_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_master_tests" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_code" TEXT,
    "sample_type" TEXT,
    "method" TEXT,
    "normal_range_text" TEXT,
    "unit" TEXT,
    "fasting_required" BOOLEAN NOT NULL DEFAULT false,
    "preparation_instructions" TEXT,
    "reference_ranges" JSONB,
    "equipment_code" TEXT,
    "is_instrument_based" BOOLEAN NOT NULL DEFAULT false,
    "turnaround_time_hours" INTEGER,
    "is_panel" BOOLEAN NOT NULL DEFAULT false,
    "modality" TEXT,
    "contrast_required" BOOLEAN,
    "body_region" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_master_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_panels" (
    "id" TEXT NOT NULL,
    "panel_name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_panel_tests" (
    "id" TEXT NOT NULL,
    "panel_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,

    CONSTRAINT "diagnostic_panel_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_diagnostic_pricing" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "tat_override_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_diagnostic_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_panel_pricing" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "panel_id" TEXT NOT NULL,
    "panel_price" DECIMAL(65,30) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hospital_panel_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_orders" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "order_status" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "diagnostic_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "price_at_order" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "diagnostic_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_results" (
    "id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "result_value" TEXT,
    "result_flag" TEXT,
    "report_file_url" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "structured_data" JSONB,

    CONSTRAINT "diagnostic_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_documents" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "result_id" TEXT,
    "document_type" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_quality_controls" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "control_result" TEXT,
    "qc_status" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lab_quality_controls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "hospital_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT NOT NULL,
    "diagnosis" TEXT,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "current_stage" "HandoffStage" NOT NULL DEFAULT 'RECEPTION',

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visit_notes" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CLINICAL_NOTE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_journeys" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "condition_simple" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "seriousness" TEXT NOT NULL,
    "timeline" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "pediatric_mode" BOOLEAN NOT NULL DEFAULT false,
    "safety_check" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "care_journeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recovery_steps" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "expected_symptoms" TEXT NOT NULL,
    "markers" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,

    CONSTRAINT "recovery_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_logs" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_check_ins" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "analysis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nudge_schedules" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "message_type" TEXT NOT NULL,
    "is_triggered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "nudge_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_plans" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "med_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "instructions" TEXT,
    "morning" BOOLEAN NOT NULL DEFAULT false,
    "afternoon" BOOLEAN NOT NULL DEFAULT false,
    "night" BOOLEAN NOT NULL DEFAULT false,
    "before_food" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "medication_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_up_plans" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "recommended_days" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "booking_status" TEXT NOT NULL DEFAULT 'PENDING',
    "cta_triggered" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "follow_up_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_red_flags" (
    "id" TEXT NOT NULL,
    "care_journey_id" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'CONTACT_HOSPITAL',

    CONSTRAINT "care_red_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_observations" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'NORMAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "role" "Role" NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "visit_id" TEXT,
    "diagnosis" TEXT NOT NULL,
    "prescription" TEXT,
    "notes" TEXT,
    "vitals" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "patient_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "area" TEXT,
    "city" TEXT,
    "state" TEXT,
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "commission_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dob" DATE,
    "gender" TEXT,
    "blood_group" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medical_history" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "chronic_diseases" TEXT,
    "past_illnesses" TEXT,
    "surgeries" TEXT,
    "allergies" TEXT,
    "drug_allergies" TEXT,
    "hospitalizations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_medical_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_medications" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "drug_name" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "start_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "weight" DECIMAL(65,30),
    "height" DECIMAL(65,30),
    "bmi" DECIMAL(65,30),
    "blood_pressure" TEXT,
    "pulse" INTEGER,
    "respiratory_rate" INTEGER,
    "blood_sugar" DECIMAL(65,30),
    "spo2" DECIMAL(65,30),
    "temperature" DECIMAL(65,30),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccination_records" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "date_given" DATE,
    "next_due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vaccination_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pregnancy_profiles" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "lmp" DATE,
    "edd" DATE,
    "usg_edd" DATE,
    "gestational_age" INTEGER,
    "gravida" INTEGER NOT NULL DEFAULT 1,
    "para" INTEGER NOT NULL DEFAULT 0,
    "abortions" INTEGER NOT NULL DEFAULT 0,
    "living_children" INTEGER NOT NULL DEFAULT 0,
    "blood_group" TEXT,
    "rh_factor" TEXT,
    "bmi_pre_pregnancy" DOUBLE PRECISION,
    "height_cm" INTEGER,
    "previous_complications" TEXT[],
    "conception_method" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mcp_card_number" TEXT,
    "high_risk" BOOLEAN NOT NULL DEFAULT false,
    "high_risk_reasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "anc_visits" INTEGER,
    "danger_signs" TEXT,
    "delivery_plan" TEXT,
    "scheme_enrolled" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "asha_worker_id" TEXT,
    "dropout_risk_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anc_visits" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "visit_number" INTEGER NOT NULL,
    "visit_date" DATE NOT NULL,
    "gestational_age" INTEGER,
    "bp_systolic" INTEGER,
    "bp_diastolic" INTEGER,
    "weight_kg" DOUBLE PRECISION,
    "fundal_height_cm" DOUBLE PRECISION,
    "fetal_heart_rate" INTEGER,
    "edema" TEXT,
    "presentation" TEXT,
    "hemoglobin" DOUBLE PRECISION,
    "urine_albumin" TEXT,
    "blood_sugar" DOUBLE PRECISION,
    "next_visit_date" DATE,
    "high_risk_notes" TEXT,
    "conducted_by" TEXT,
    "conducted_by_role" TEXT,
    "hospital_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anc_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obstetric_history" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "previous_delivery_type" TEXT,
    "previous_complications" TEXT,
    "previous_baby_weight" DOUBLE PRECISION,
    "previous_gestational_age" INTEGER,
    "pregnancy_outcome" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "obstetric_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anc_supplement_logs" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "supplement_type" TEXT NOT NULL,
    "target_dose" INTEGER NOT NULL,
    "doses_taken" INTEGER NOT NULL DEFAULT 0,
    "dose_unit" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_reminder_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anc_supplement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mcp_cards" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "card_data" JSONB NOT NULL,
    "qr_code_url" TEXT,
    "printed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mcp_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anc_retention_alerts" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "trigger_event" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "message" TEXT,
    "response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anc_retention_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newborn_records" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "baby_patient_id" TEXT NOT NULL,
    "birth_weight_kg" DOUBLE PRECISION NOT NULL,
    "apgar_score" INTEGER,
    "delivery_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newborn_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_slips" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "referral_reason" TEXT NOT NULL,
    "referred_to" TEXT NOT NULL,
    "referring_doctor" TEXT NOT NULL,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "sms_sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partograph_records" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "cervical_dil" INTEGER NOT NULL,
    "fetal_heart_rate" INTEGER NOT NULL,
    "contraction_freq" INTEGER NOT NULL,
    "bp_systolic" INTEGER NOT NULL,
    "bp_diastolic" INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partograph_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "near_miss_audits" (
    "id" TEXT NOT NULL,
    "pregnancy_id" TEXT NOT NULL,
    "criteria_met" TEXT[],
    "saving_intervention" TEXT NOT NULL,
    "audit_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "near_miss_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_details" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "policy_number" TEXT,
    "coverage_amount" DECIMAL(65,30),
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insurance_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_slots" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "slot_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_slot_blocks" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "block_start" TIMESTAMP(3) NOT NULL,
    "block_end" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_slot_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "executed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hospital_id" TEXT,
    "patient_id" TEXT,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_entries" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "doctor_id" TEXT NOT NULL,
    "patient_global_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "identity_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_alerts" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "follow_up_id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "missedCount" INTEGER NOT NULL DEFAULT 2,
    "chronic_tag" TEXT,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_via" TEXT,
    "sent_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "escalation_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_consents" (
    "id" TEXT NOT NULL,
    "patient_global_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "consent_type" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "override_logs" (
    "id" TEXT NOT NULL,
    "executor_id" TEXT,
    "action_type" TEXT NOT NULL,
    "target_entity" TEXT,
    "target_id" TEXT,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "old_state" JSONB,
    "new_state" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "override_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "bill_id" TEXT,
    "type" "FollowUpType" NOT NULL DEFAULT 'GENERAL',
    "status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "source" TEXT,
    "payload" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "bed_id" TEXT,
    "attending_doctor_id" TEXT,
    "admission_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ADMITTED',
    "reason" TEXT,
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_discharge_at" TIMESTAMP(3),
    "discharged_at" TIMESTAMP(3),
    "discharge_summary" TEXT,
    "daily_bed_charge" DECIMAL(65,30),
    "payload" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "appointment_id" TEXT,
    "admission_id" TEXT,
    "diagnostic_order_id" TEXT,
    "bill_id" TEXT,
    "invoice_number" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "gst_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount_total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "finalized_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "payload" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_line_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "service_id" TEXT,
    "description" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(65,30) NOT NULL,
    "gst_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxable_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "gst_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_payments" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "reference_number" TEXT,
    "gateway_provider" TEXT,
    "payload" JSONB DEFAULT '{}',
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "doctor_id" TEXT,
    "template_id" TEXT,
    "channel" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" JSONB DEFAULT '{}',
    "metadata" JSONB DEFAULT '{}',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_dispenses" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "prescription_id" TEXT,
    "invoice_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DISPENSED',
    "dispensed_by" TEXT,
    "notes" TEXT,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_dispenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_dispense_items" (
    "id" TEXT NOT NULL,
    "dispense_id" TEXT NOT NULL,
    "drug_stock_id" TEXT NOT NULL,
    "drug_name" TEXT NOT NULL,
    "batch_number" TEXT,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pharmacy_dispense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_lifecycle_tags" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "source" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_lifecycle_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "unit_id" TEXT,
    "department_id" TEXT,
    "bed_number" TEXT NOT NULL,
    "type" "BedType" NOT NULL DEFAULT 'GENERAL',
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "amenities" JSONB DEFAULT '[]',
    "patient_id" TEXT,
    "admitted_at" TIMESTAMP(3),
    "expected_discharge_at" TIMESTAMP(3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "branch_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMP(3),
    "payload" JSONB DEFAULT '{}',
    "source" TEXT DEFAULT 'direct',
    "follow_up_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_stocks" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "min_level" INTEGER NOT NULL DEFAULT 10,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "type" TEXT,
    "batch_number" TEXT,
    "mrp" DOUBLE PRECISION DEFAULT 0,
    "purchase_price" DOUBLE PRECISION DEFAULT 0,
    "generic_name" TEXT,
    "formulation" TEXT,
    "strength" TEXT,
    "pack_size" INTEGER NOT NULL DEFAULT 10,
    "reorder_point" INTEGER NOT NULL DEFAULT 20,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "storage_condition" TEXT NOT NULL DEFAULT 'ROOM_TEMP',
    "manufacturer" TEXT,
    "supplier_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "appointment_id" TEXT,
    "visit_id" TEXT,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "order_number" TEXT,
    "priority" TEXT,
    "clinical_info" TEXT,
    "collection_date" TIMESTAMP(3),
    "reporting_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "invoiceId" TEXT,

    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_samples" (
    "id" TEXT NOT NULL,
    "lab_order_id" TEXT NOT NULL,
    "test_id" TEXT,
    "barcode" TEXT NOT NULL,
    "collected_by_id" TEXT,
    "collected_at" TIMESTAMP(3),
    "collection_time" TIMESTAMP(3),
    "sample_type" TEXT,
    "volume" TEXT,
    "notes" TEXT,
    "status" "LabOrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "result_value" TEXT,
    "reference_range" TEXT,
    "result_flag" TEXT,
    "verified_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "report_file_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "DeptType" NOT NULL DEFAULT 'OPD',
    "head_doctor_id" TEXT,
    "description" TEXT,
    "billing_rules" JSONB,
    "max_capacity" INTEGER NOT NULL DEFAULT 0,
    "analytics_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "bedType" "BedType" NOT NULL DEFAULT 'GENERAL',
    "ward_number" TEXT,
    "floor" TEXT,
    "type" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL DEFAULT 'CONSULTATION',
    "department_id" TEXT,
    "base_price" DECIMAL(65,30) NOT NULL,
    "gst_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gst_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_add_on" BOOLEAN NOT NULL DEFAULT false,
    "is_surgical" BOOLEAN NOT NULL DEFAULT false,
    "hsn_code" TEXT,
    "package_id" TEXT,
    "inventory_item_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateways" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "provider" "GatewayProvider" NOT NULL,
    "encrypted_key" TEXT,
    "encrypted_secret" TEXT,
    "extra_config" JSONB,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_tested_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_rules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" JSONB NOT NULL,
    "action" JSONB NOT NULL,
    "audience" JSONB,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "max_per_month" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chronic_conditions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "follow_up_frequency" INTEGER NOT NULL DEFAULT 30,
    "required_tests" TEXT[],
    "reminder_cadence" TEXT NOT NULL DEFAULT 'MONTHLY',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chronic_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opd_configs" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "token_mode" TEXT NOT NULL DEFAULT 'AUTO',
    "token_prefix" TEXT NOT NULL DEFAULT 'OPD',
    "reset_daily" BOOLEAN NOT NULL DEFAULT true,
    "display_queue_on_tv" BOOLEAN NOT NULL DEFAULT false,
    "allow_walk_in" BOOLEAN NOT NULL DEFAULT true,
    "allow_online" BOOLEAN NOT NULL DEFAULT true,
    "avg_consultation_minutes" INTEGER NOT NULL DEFAULT 15,
    "notify_patient_sms" BOOLEAN NOT NULL DEFAULT false,
    "patients_ahead_alert" INTEGER NOT NULL DEFAULT 2,
    "allow_overbooking" BOOLEAN NOT NULL DEFAULT false,
    "max_overbooking_percent" INTEGER NOT NULL DEFAULT 10,
    "no_show_policy" TEXT NOT NULL DEFAULT 'WARN',
    "block_after_no_shows" INTEGER NOT NULL DEFAULT 3,
    "no_show_cooldown_days" INTEGER NOT NULL DEFAULT 30,
    "enable_smart_slots" BOOLEAN NOT NULL DEFAULT true,
    "slot_buffer_minutes" INTEGER NOT NULL DEFAULT 5,
    "daily_slot_cap" INTEGER,
    "lunch_break_start" TEXT,
    "lunch_break_end" TEXT,
    "no_show_fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "show_estimated_wait" BOOLEAN NOT NULL DEFAULT true,
    "allow_phone" BOOLEAN NOT NULL DEFAULT true,
    "allow_referral" BOOLEAN NOT NULL DEFAULT true,
    "smart_slot_algorithm" TEXT NOT NULL DEFAULT 'FIFO',
    "emergency_slot_reserve" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opd_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_configs" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "encrypted_config" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "test_mode" BOOLEAN NOT NULL DEFAULT true,
    "webhook_url" TEXT,
    "webhook_secret" TEXT,
    "scope" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_tested_at" TIMESTAMP(3),
    "last_test_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "branch_type" TEXT NOT NULL DEFAULT 'MAIN',
    "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "open_time" TEXT,
    "close_time" TEXT,
    "is_headquarters" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_invites" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RECEPTIONIST',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "header_text" TEXT,
    "footer_text" TEXT,
    "buttons" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "provider_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_event_mappings" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_event_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gst_number" TEXT,
    "lead_time" INTEGER NOT NULL DEFAULT 7,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "purpose" "ConsentPurpose" NOT NULL,
    "given_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "withdrawn_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_profiles" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "tier" "ClinicTier" NOT NULL,
    "doctor_in_charge" TEXT,
    "specialization" TEXT,
    "num_doctors" INTEGER,
    "has_pharmacy" BOOLEAN NOT NULL DEFAULT false,
    "has_own_lab" BOOLEAN NOT NULL DEFAULT false,
    "avg_daily_patients" INTEGER,
    "clinic_mode" BOOLEAN NOT NULL DEFAULT true,
    "allowed_features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_acquisitions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "source" "PatientAcquisitionSource" NOT NULL,
    "referrer_id" TEXT,
    "referrer_type" TEXT,
    "specialty" TEXT,
    "booked_appt_id" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "revenue_at_cents" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_acquisitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_documents" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "appt_id" TEXT,
    "docType" "AIDocumentType" NOT NULL,
    "input_prompt" TEXT,
    "generated_text" TEXT NOT NULL,
    "is_assisted" BOOLEAN NOT NULL DEFAULT true,
    "is_doctor_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinic_operational_profiles" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "is_single_doctor" BOOLEAN NOT NULL DEFAULT true,
    "has_consultants" BOOLEAN NOT NULL DEFAULT false,
    "daily_staff_count" INTEGER NOT NULL DEFAULT 1,
    "has_receptionist" BOOLEAN NOT NULL DEFAULT false,
    "has_nursing_staff" BOOLEAN NOT NULL DEFAULT false,
    "has_pharmacy" BOOLEAN NOT NULL DEFAULT false,
    "has_own_lab" BOOLEAN NOT NULL DEFAULT false,
    "admits_patients" BOOLEAN NOT NULL DEFAULT false,
    "avg_daily_patients" INTEGER NOT NULL DEFAULT 10,
    "opd_only" BOOLEAN NOT NULL DEFAULT true,
    "current_workflow" JSONB,
    "digital_maturity" JSONB,
    "retention_leaks" JSONB,
    "pharmacy_config" JSONB,
    "lab_config" JSONB,
    "communication_prefs" JSONB,
    "deployment_mode" TEXT NOT NULL DEFAULT 'CLOUD',
    "primary_language" TEXT NOT NULL DEFAULT 'en',
    "offline_enabled" BOOLEAN NOT NULL DEFAULT false,
    "printer_type" TEXT NOT NULL DEFAULT 'NONE',
    "payment_modes" JSONB,
    "network_profile" TEXT NOT NULL DEFAULT 'BROADBAND',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinic_operational_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_referrals" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "from_doctor_id" TEXT NOT NULL,
    "to_doctor_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ReferralPriority" NOT NULL DEFAULT 'ROUTINE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "internal_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consultant_settlements" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "settlement_period_start" TIMESTAMP(3) NOT NULL,
    "settlement_period_end" TIMESTAMP(3) NOT NULL,
    "total_consultations" INTEGER NOT NULL,
    "gross_revenue_cents" INTEGER NOT NULL,
    "revenue_share_percent" DECIMAL(65,30) NOT NULL,
    "consultant_share_cents" INTEGER NOT NULL,
    "hospital_share_cents" INTEGER NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultant_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_handoffs" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "from_stage" "HandoffStage" NOT NULL,
    "to_stage" "HandoffStage" NOT NULL,
    "status" "HandoffStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "assigned_staff_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "department_handoffs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concept_mappings" (
    "id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "display_name" TEXT,

    CONSTRAINT "concept_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_insurances" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "insurer_name" TEXT NOT NULL,
    "insurer_type" "InsurerType" NOT NULL,
    "policy_number" TEXT,
    "tie_up_letter_file_url" TEXT,
    "valid_from" DATE NOT NULL,
    "valid_to" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "specialities_covered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "co_pay_percentage" DECIMAL(65,30),
    "cashless_network" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_insurances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_packages" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copay_rules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "insurer_id" TEXT NOT NULL,
    "service_type" TEXT,
    "service_id" TEXT,
    "copay_type" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "copay_value" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copay_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_profiles" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" TEXT,
    "dob" DATE,
    "photo_url" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "designation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_education" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "degree_type" "DegreeType" NOT NULL,
    "degree_name" TEXT NOT NULL,
    "college_name" TEXT NOT NULL,
    "university_name" TEXT,
    "country" TEXT,
    "year" INTEGER,
    "registration_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_certifications" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "course_name" TEXT NOT NULL,
    "authority" TEXT,
    "certificate_no" TEXT,
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_cert_documents" (
    "id" TEXT NOT NULL,
    "certification_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_cert_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_skills" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "skill_name" TEXT NOT NULL,
    "skill_level" TEXT,
    "certified_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_memberships" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "membership_type" TEXT,
    "since_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_publications" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "doi" TEXT,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_awards" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authority" TEXT,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_conferences" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "conference_name" TEXT NOT NULL,
    "role" TEXT,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_conferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_experience" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "from_date" DATE NOT NULL,
    "to_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "responsibilities" TEXT,
    "proof_doc_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_verifications" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'DOCUMENT_PENDING',
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_search_index" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "specialties" TEXT[],
    "departments" TEXT[],
    "city" TEXT,
    "state" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "experience_years" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "last_indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_search_index_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_public_profiles" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "super_specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "years_experience" INTEGER,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "consultation_fee" DECIMAL(65,30),
    "available_today" BOOLEAN NOT NULL DEFAULT false,
    "next_available_slot" TIMESTAMP(3),
    "availability_status" TEXT NOT NULL DEFAULT 'OFFLINE',
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
    "hospital_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_public_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_availability" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "available_slots" INTEGER NOT NULL DEFAULT 0,
    "bookable_slots" INTEGER NOT NULL DEFAULT 0,
    "slot_details" JSONB,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ttl_expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_holidays" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "date" DATE NOT NULL,
    "holiday_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_leaves" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "leave_type" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_by" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "doctor_id" TEXT,
    "module" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "event_type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "summary" TEXT,
    "description" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clinical_date" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 5,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "fhir_resource_type" TEXT,
    "fhir_mapping" JSONB,
    "correlation_id" TEXT,
    "source_system" TEXT,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "amended_event_id" TEXT,
    "integrity_hash" TEXT,
    "actor_type" TEXT,
    "actor_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "search_vector" TEXT,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chief_complaints" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "complaint" TEXT NOT NULL,
    "severity" TEXT,
    "duration" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chief_complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_history" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "chief_complaint" TEXT,
    "history_present" TEXT,
    "history_past" TEXT,
    "history_family" TEXT,
    "history_drug" TEXT,
    "history_allergy" TEXT,
    "history_social" TEXT,
    "history_immunization" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_examinations" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "exam_type" TEXT NOT NULL,
    "findings" JSONB,
    "vital_signs" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_examinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "diagnosis_type" TEXT NOT NULL DEFAULT 'PRIMARY',
    "icd10_code" TEXT,
    "description" TEXT NOT NULL,
    "is_final" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_orders" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "test_name" TEXT NOT NULL,
    "test_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investigation_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "treatment_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icd10_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT,
    "parent_code" TEXT,
    "is_leaf" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "icd10_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loinc_codes" (
    "id" TEXT NOT NULL,
    "loinc_number" TEXT NOT NULL,
    "component" TEXT,
    "property" TEXT,
    "time_aspect" TEXT,
    "system" TEXT,
    "scale_type" TEXT,
    "method" TEXT,
    "short_name" TEXT,
    "display_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "loinc_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "snomed_concepts" (
    "id" TEXT NOT NULL,
    "concept_id" TEXT NOT NULL,
    "fully_specified_name" TEXT,
    "synonyms" TEXT,
    "definition" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "snomed_concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_master" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "formulation" TEXT,
    "strength" TEXT,
    "unit" TEXT,
    "schedule" TEXT,
    "is_controlled" BOOLEAN NOT NULL DEFAULT false,
    "contraindication" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_brands" (
    "id" TEXT NOT NULL,
    "drug_master_id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL,
    "manufacturer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drug_brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigation_master" (
    "id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_code" TEXT,
    "loinc_code" TEXT,
    "sample_type" TEXT,
    "normal_range" TEXT,
    "reference_ranges" JSONB,
    "units" TEXT,
    "fasting_required" BOOLEAN NOT NULL DEFAULT false,
    "test_duration" INTEGER,

    CONSTRAINT "investigation_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_master" (
    "id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "test_code" TEXT,
    "modality" TEXT,
    "body_region" TEXT,
    "contrast_required" BOOLEAN NOT NULL DEFAULT false,
    "normal_finding" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_master" (
    "id" TEXT NOT NULL,
    "procedure_name" TEXT NOT NULL,
    "procedure_code" TEXT,
    "cpt_code" TEXT,
    "duration_min" INTEGER,
    "consumables" JSONB DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedure_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vaccine_master" (
    "id" TEXT NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "vaccine_code" TEXT,
    "disease_target" TEXT,
    "schedule_days" INTEGER[],
    "min_age_months" INTEGER,
    "max_age_months" INTEGER,
    "contraindications" TEXT,

    CONSTRAINT "vaccine_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allergy_master" (
    "id" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "category" TEXT,
    "symptoms" TEXT,
    "severity" TEXT,

    CONSTRAINT "allergy_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_templates" (
    "id" TEXT NOT NULL,
    "template_key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '{}',
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_attachments" (
    "id" TEXT NOT NULL,
    "visit_id" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "order_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "expected_date" TIMESTAMP(3),
    "received_date" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "drug_stock_id" TEXT,
    "drug_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "total_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "batch_number" TEXT,
    "expiry_date" TIMESTAMP(3),

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL,
    "drug_id1" TEXT NOT NULL,
    "drug_id2" TEXT NOT NULL,
    "severity" TEXT,
    "description" TEXT,
    "management" TEXT,

    CONSTRAINT "drug_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nursing_notes" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "visit_id" TEXT,
    "admission_id" TEXT,
    "nurse_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "shift" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nursing_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mars" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "administered_at" TIMESTAMP(3),
    "administered_by_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "mars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ot_schedules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "procedure_name" TEXT NOT NULL,
    "surgeon_id" TEXT NOT NULL,
    "theatre_name" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "who_checklist" JSONB DEFAULT '{}',
    "surgery_notes" TEXT,
    "recovery_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ot_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "icu_admissions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "bed_id" TEXT NOT NULL,
    "apache_score" INTEGER,
    "prism_score" INTEGER,
    "pelod_score" INTEGER,
    "ventilator_mode" TEXT,
    "peep" DOUBLE PRECISION,
    "fio2" DOUBLE PRECISION,
    "infusions" JSONB DEFAULT '[]',
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharged_at" TIMESTAMP(3),

    CONSTRAINT "icu_admissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_verifications" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "policy_number" TEXT NOT NULL,
    "insurer_name" TEXT NOT NULL,
    "tpa_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "pre_auth_amount" DECIMAL(65,30) DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,

    CONSTRAINT "insurance_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_claims" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "claim_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "approved_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "settled_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settled_at" TIMESTAMP(3),

    CONSTRAINT "insurance_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_attachments" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size_kb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_tags" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',

    CONSTRAINT "timeline_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_versions" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "change_type" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previous_payload" JSONB,

    CONSTRAINT "timeline_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_audit" (
    "id" TEXT NOT NULL,
    "event_id" TEXT,
    "action" TEXT NOT NULL,
    "performed_by" TEXT,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "payload" JSONB,

    CONSTRAINT "timeline_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_exports" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "filters" JSONB,
    "file_url" TEXT,
    "file_size_kb" DOUBLE PRECISION,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "timeline_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_subscriptions" (
    "id" TEXT NOT NULL,
    "subscriber_id" TEXT NOT NULL,
    "subscriber_type" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timeline_snapshots" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "snapshot_data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timeline_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CLINICAL',
    "trigger_type" TEXT NOT NULL,
    "trigger_event" TEXT,
    "condition_json" JSONB NOT NULL,
    "action_json" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_executions" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "patient_id" TEXT,
    "hospital_id" TEXT,
    "triggered_by" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "result_json" JSONB,
    "error_json" JSONB,
    "execution_time_ms" INTEGER,

    CONSTRAINT "rule_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_schedules" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "cron_expression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "next_run_at" TIMESTAMP(3),
    "last_run_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rule_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_providers" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_campaigns" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_deliveries" (
    "id" TEXT NOT NULL,
    "notification_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "provider_ref" TEXT,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "user_id" TEXT NOT NULL,
    "sms" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "push" BOOLEAN NOT NULL DEFAULT true,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "quiet_hours_from" TEXT,
    "quiet_hours_to" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_events" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "event" TEXT NOT NULL,
    "payload" JSONB,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_audits" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "notification_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_type" TEXT,
    "actor_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_provider_health" (
    "id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "latency" INTEGER NOT NULL DEFAULT 0,
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "last_check" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_provider_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_template_versions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_templates" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "stages" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT,
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journey_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_template_versions" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "stages" JSONB NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journey_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_instances" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "current_stage" TEXT NOT NULL,
    "risk_score" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "expected_end_date" TIMESTAMP(3),
    "care_team" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journey_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_milestones" (
    "id" TEXT NOT NULL,
    "journey_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "risk_score" DOUBLE PRECISION,

    CONSTRAINT "journey_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_tasks" (
    "id" TEXT NOT NULL,
    "milestone_id" TEXT,
    "journey_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "sla_hours" INTEGER,

    CONSTRAINT "journey_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey_risks" (
    "id" TEXT NOT NULL,
    "journey_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "factors" JSONB,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journey_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "searchable_entities" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "patient_id" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "search_vector" tsvector,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "searchable_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_synonyms" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "synonyms" TEXT[],
    "category" TEXT,
    "hospital_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_synonyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "hospital_id" TEXT,
    "query" TEXT,
    "entity_types" TEXT[],
    "result_count" INTEGER,
    "latency_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_events" (
    "event_id" TEXT NOT NULL,
    "handler_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "error" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "inbox_events_pkey" PRIMARY KEY ("event_id","handler_name")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_master_mobile_key" ON "doctors_master"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_master_email_key" ON "doctors_master"("email");

-- CreateIndex
CREATE INDEX "doctors_master_email_idx" ON "doctors_master"("email");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_registration_doctor_id_key" ON "doctor_registration"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_registration_registration_number_key" ON "doctor_registration"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "hospitals_master_registration_number_key" ON "hospitals_master"("registration_number");

-- CreateIndex
CREATE INDEX "hospitals_master_city_idx" ON "hospitals_master"("city");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_facilities_hospital_id_key" ON "hospital_facilities"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_admins_mobile_key" ON "hospital_admins"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_admins_email_key" ON "hospital_admins"("email");

-- CreateIndex
CREATE INDEX "hospital_admins_hospital_id_idx" ON "hospital_admins"("hospital_id");

-- CreateIndex
CREATE INDEX "hospital_admins_email_idx" ON "hospital_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_billing_profile_hospital_id_key" ON "hospital_billing_profile"("hospital_id");

-- CreateIndex
CREATE INDEX "doctor_hospital_affiliations_hospital_id_idx" ON "doctor_hospital_affiliations"("hospital_id");

-- CreateIndex
CREATE INDEX "doctor_hospital_affiliations_role_idx" ON "doctor_hospital_affiliations"("role");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_hospital_affiliations_doctor_id_hospital_id_key" ON "doctor_hospital_affiliations"("doctor_id", "hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_roles_doctor_id_hospital_id_key" ON "doctor_roles"("doctor_id", "hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_email_key" ON "staff"("email");

-- CreateIndex
CREATE UNIQUE INDEX "staff_mobile_key" ON "staff"("mobile");

-- CreateIndex
CREATE INDEX "staff_hospital_id_idx" ON "staff"("hospital_id");

-- CreateIndex
CREATE INDEX "staff_role_idx" ON "staff"("role");

-- CreateIndex
CREATE UNIQUE INDEX "patients_phone_key" ON "patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "patients_abha_address_key" ON "patients"("abha_address");

-- CreateIndex
CREATE INDEX "patients_city_idx" ON "patients"("city");

-- CreateIndex
CREATE INDEX "patients_email_idx" ON "patients"("email");

-- CreateIndex
CREATE INDEX "patients_role_idx" ON "patients"("role");

-- CreateIndex
CREATE INDEX "patient_addresses_patient_id_idx" ON "patient_addresses"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_patient_id_key" ON "wallets"("patient_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "patient_prescriptions_patient_id_idx" ON "patient_prescriptions"("patient_id");

-- CreateIndex
CREATE INDEX "prescription_items_prescription_id_idx" ON "prescription_items"("prescription_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_idempotency_key_key" ON "appointments"("idempotency_key");

-- CreateIndex
CREATE INDEX "appointments_patient_id_idx" ON "appointments"("patient_id");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_idx" ON "appointments"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_date_slot_key" ON "appointments"("doctor_id", "date", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "slots_doctor_id_day_time_key" ON "slots"("doctor_id", "day", "time");

-- CreateIndex
CREATE UNIQUE INDEX "payments_appointment_id_key" ON "payments"("appointment_id");

-- CreateIndex
CREATE INDEX "payments_appointment_id_idx" ON "payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_categories_name_key" ON "diagnostic_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_master_tests_test_code_key" ON "diagnostic_master_tests"("test_code");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_panel_tests_panel_id_test_id_key" ON "diagnostic_panel_tests"("panel_id", "test_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_diagnostic_pricing_hospital_id_test_id_key" ON "hospital_diagnostic_pricing"("hospital_id", "test_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_panel_pricing_hospital_id_panel_id_key" ON "hospital_panel_pricing"("hospital_id", "panel_id");

-- CreateIndex
CREATE INDEX "diagnostic_orders_hospital_id_idx" ON "diagnostic_orders"("hospital_id");

-- CreateIndex
CREATE INDEX "diagnostic_orders_patient_id_idx" ON "diagnostic_orders"("patient_id");

-- CreateIndex
CREATE INDEX "diagnostic_orders_doctor_id_idx" ON "diagnostic_orders"("doctor_id");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_order_id_idx" ON "diagnostic_order_items"("order_id");

-- CreateIndex
CREATE INDEX "diagnostic_order_items_test_id_idx" ON "diagnostic_order_items"("test_id");

-- CreateIndex
CREATE INDEX "diagnostic_documents_order_id_idx" ON "diagnostic_documents"("order_id");

-- CreateIndex
CREATE INDEX "diagnostic_documents_result_id_idx" ON "diagnostic_documents"("result_id");

-- CreateIndex
CREATE UNIQUE INDEX "visits_appointment_id_key" ON "visits"("appointment_id");

-- CreateIndex
CREATE INDEX "visits_hospital_id_idx" ON "visits"("hospital_id");

-- CreateIndex
CREATE INDEX "visits_appointment_id_idx" ON "visits"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_journeys_visit_id_key" ON "care_journeys"("visit_id");

-- CreateIndex
CREATE UNIQUE INDEX "follow_up_plans_care_journey_id_key" ON "follow_up_plans"("care_journey_id");

-- CreateIndex
CREATE INDEX "medical_records_patient_id_idx" ON "medical_records"("patient_id");

-- CreateIndex
CREATE INDEX "audit_logs_hospital_id_idx" ON "audit_logs"("hospital_id");

-- CreateIndex
CREATE INDEX "role_permissions_hospital_id_role_idx" ON "role_permissions"("hospital_id", "role");

-- CreateIndex
CREATE INDEX "role_permissions_staff_id_idx" ON "role_permissions"("staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_hospital_id_role_module_action_staff_id_key" ON "role_permissions"("hospital_id", "role", "module", "action", "staff_id");

-- CreateIndex
CREATE UNIQUE INDEX "agents_mobile_key" ON "agents"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "family_members_patient_id_idx" ON "family_members"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_medical_history_patient_id_key" ON "patient_medical_history"("patient_id");

-- CreateIndex
CREATE INDEX "patient_medications_patient_id_idx" ON "patient_medications"("patient_id");

-- CreateIndex
CREATE INDEX "vital_records_patient_id_idx" ON "vital_records"("patient_id");

-- CreateIndex
CREATE INDEX "vaccination_records_patient_id_idx" ON "vaccination_records"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "pregnancy_profiles_patient_id_key" ON "pregnancy_profiles"("patient_id");

-- CreateIndex
CREATE INDEX "anc_visits_pregnancy_id_idx" ON "anc_visits"("pregnancy_id");

-- CreateIndex
CREATE INDEX "anc_visits_next_visit_date_idx" ON "anc_visits"("next_visit_date");

-- CreateIndex
CREATE INDEX "obstetric_history_pregnancy_id_idx" ON "obstetric_history"("pregnancy_id");

-- CreateIndex
CREATE INDEX "anc_supplement_logs_pregnancy_id_idx" ON "anc_supplement_logs"("pregnancy_id");

-- CreateIndex
CREATE INDEX "anc_supplement_logs_supplement_type_idx" ON "anc_supplement_logs"("supplement_type");

-- CreateIndex
CREATE UNIQUE INDEX "mcp_cards_pregnancy_id_key" ON "mcp_cards"("pregnancy_id");

-- CreateIndex
CREATE INDEX "anc_retention_alerts_pregnancy_id_idx" ON "anc_retention_alerts"("pregnancy_id");

-- CreateIndex
CREATE INDEX "anc_retention_alerts_status_scheduled_at_idx" ON "anc_retention_alerts"("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "newborn_records_baby_patient_id_key" ON "newborn_records"("baby_patient_id");

-- CreateIndex
CREATE INDEX "insurance_details_patient_id_idx" ON "insurance_details"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "otp_codes_phone_key" ON "otp_codes"("phone");

-- CreateIndex
CREATE INDEX "doctor_slots_doctor_id_start_time_idx" ON "doctor_slots"("doctor_id", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_slots_doctor_id_start_time_key" ON "doctor_slots"("doctor_id", "start_time");

-- CreateIndex
CREATE INDEX "doctor_schedules_doctor_id_idx" ON "doctor_schedules"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_day_of_week_start_time_key" ON "doctor_schedules"("doctor_id", "day_of_week", "start_time");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_slot_blocks_doctor_id_block_start_key" ON "doctor_slot_blocks"("doctor_id", "block_start");

-- CreateIndex
CREATE INDEX "outbox_events_processed_created_at_idx" ON "outbox_events"("processed", "created_at");

-- CreateIndex
CREATE INDEX "event_logs_hospital_id_event_type_created_at_idx" ON "event_logs"("hospital_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "escalation_alerts_hospital_id_idx" ON "escalation_alerts"("hospital_id");

-- CreateIndex
CREATE INDEX "escalation_alerts_patient_id_idx" ON "escalation_alerts"("patient_id");

-- CreateIndex
CREATE INDEX "escalation_alerts_doctor_id_idx" ON "escalation_alerts"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "escalation_alerts_appointment_id_hospital_id_key" ON "escalation_alerts"("appointment_id", "hospital_id");

-- CreateIndex
CREATE INDEX "follow_ups_hospital_id_idx" ON "follow_ups"("hospital_id");

-- CreateIndex
CREATE INDEX "follow_ups_patient_id_idx" ON "follow_ups"("patient_id");

-- CreateIndex
CREATE INDEX "follow_ups_scheduled_at_idx" ON "follow_ups"("scheduled_at");

-- CreateIndex
CREATE INDEX "follow_ups_status_idx" ON "follow_ups"("status");

-- CreateIndex
CREATE INDEX "admissions_hospital_id_status_idx" ON "admissions"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "admissions_patient_id_idx" ON "admissions"("patient_id");

-- CreateIndex
CREATE INDEX "admissions_bed_id_idx" ON "admissions"("bed_id");

-- CreateIndex
CREATE UNIQUE INDEX "admissions_hospital_id_admission_number_key" ON "admissions"("hospital_id", "admission_number");

-- CreateIndex
CREATE INDEX "invoices_hospital_id_status_idx" ON "invoices"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "invoices_patient_id_idx" ON "invoices"("patient_id");

-- CreateIndex
CREATE INDEX "invoices_appointment_id_idx" ON "invoices"("appointment_id");

-- CreateIndex
CREATE INDEX "invoices_admission_id_idx" ON "invoices"("admission_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_hospital_id_invoice_number_key" ON "invoices"("hospital_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_service_id_idx" ON "invoice_line_items"("service_id");

-- CreateIndex
CREATE INDEX "invoice_payments_hospital_id_idx" ON "invoice_payments"("hospital_id");

-- CreateIndex
CREATE INDEX "invoice_payments_invoice_id_idx" ON "invoice_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "notifications_hospital_id_status_priority_idx" ON "notifications"("hospital_id", "status", "priority");

-- CreateIndex
CREATE INDEX "notifications_patient_id_idx" ON "notifications"("patient_id");

-- CreateIndex
CREATE INDEX "notifications_doctor_id_idx" ON "notifications"("doctor_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispenses_hospital_id_idx" ON "pharmacy_dispenses"("hospital_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispenses_patient_id_idx" ON "pharmacy_dispenses"("patient_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispenses_invoice_id_idx" ON "pharmacy_dispenses"("invoice_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispense_items_dispense_id_idx" ON "pharmacy_dispense_items"("dispense_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispense_items_drug_stock_id_idx" ON "pharmacy_dispense_items"("drug_stock_id");

-- CreateIndex
CREATE INDEX "patient_lifecycle_tags_hospital_id_tag_idx" ON "patient_lifecycle_tags"("hospital_id", "tag");

-- CreateIndex
CREATE INDEX "patient_lifecycle_tags_patient_id_idx" ON "patient_lifecycle_tags"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_lifecycle_tags_hospital_id_patient_id_tag_key" ON "patient_lifecycle_tags"("hospital_id", "patient_id", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "beds_patient_id_key" ON "beds"("patient_id");

-- CreateIndex
CREATE INDEX "beds_hospital_id_idx" ON "beds"("hospital_id");

-- CreateIndex
CREATE INDEX "beds_unit_id_idx" ON "beds"("unit_id");

-- CreateIndex
CREATE INDEX "beds_department_id_idx" ON "beds"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "beds_hospital_id_bed_number_key" ON "beds"("hospital_id", "bed_number");

-- CreateIndex
CREATE UNIQUE INDEX "beds_unit_id_bed_number_key" ON "beds"("unit_id", "bed_number");

-- CreateIndex
CREATE INDEX "bills_hospital_id_idx" ON "bills"("hospital_id");

-- CreateIndex
CREATE INDEX "bills_status_idx" ON "bills"("status");

-- CreateIndex
CREATE INDEX "bills_source_idx" ON "bills"("source");

-- CreateIndex
CREATE INDEX "drug_stocks_hospital_id_idx" ON "drug_stocks"("hospital_id");

-- CreateIndex
CREATE INDEX "lab_orders_hospital_id_idx" ON "lab_orders"("hospital_id");

-- CreateIndex
CREATE INDEX "lab_orders_patient_id_idx" ON "lab_orders"("patient_id");

-- CreateIndex
CREATE INDEX "lab_orders_doctor_id_idx" ON "lab_orders"("doctor_id");

-- CreateIndex
CREATE INDEX "lab_orders_visit_id_idx" ON "lab_orders"("visit_id");

-- CreateIndex
CREATE INDEX "lab_orders_status_idx" ON "lab_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "lab_samples_barcode_key" ON "lab_samples"("barcode");

-- CreateIndex
CREATE INDEX "lab_samples_lab_order_id_idx" ON "lab_samples"("lab_order_id");

-- CreateIndex
CREATE INDEX "lab_samples_barcode_idx" ON "lab_samples"("barcode");

-- CreateIndex
CREATE INDEX "lab_samples_collected_by_id_idx" ON "lab_samples"("collected_by_id");

-- CreateIndex
CREATE INDEX "departments_hospital_id_idx" ON "departments"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_hospital_id_code_key" ON "departments"("hospital_id", "code");

-- CreateIndex
CREATE INDEX "units_department_id_idx" ON "units"("department_id");

-- CreateIndex
CREATE INDEX "service_catalog_hospital_id_idx" ON "service_catalog"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_hospital_id_code_key" ON "service_catalog"("hospital_id", "code");

-- CreateIndex
CREATE INDEX "payment_gateways_hospital_id_idx" ON "payment_gateways"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_hospital_id_provider_key" ON "payment_gateways"("hospital_id", "provider");

-- CreateIndex
CREATE INDEX "retention_rules_hospital_id_idx" ON "retention_rules"("hospital_id");

-- CreateIndex
CREATE INDEX "chronic_conditions_hospital_id_idx" ON "chronic_conditions"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "opd_configs_hospital_id_key" ON "opd_configs"("hospital_id");

-- CreateIndex
CREATE INDEX "integration_configs_hospital_id_idx" ON "integration_configs"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_configs_hospital_id_provider_key" ON "integration_configs"("hospital_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "branches_code_key" ON "branches"("code");

-- CreateIndex
CREATE INDEX "branches_hospital_id_idx" ON "branches"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_invites_token_key" ON "staff_invites"("token");

-- CreateIndex
CREATE INDEX "staff_invites_hospital_id_idx" ON "staff_invites"("hospital_id");

-- CreateIndex
CREATE INDEX "staff_invites_token_idx" ON "staff_invites"("token");

-- CreateIndex
CREATE INDEX "notification_templates_hospital_id_idx" ON "notification_templates"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_event_mappings_hospital_id_event_key" ON "notification_event_mappings"("hospital_id", "event");

-- CreateIndex
CREATE UNIQUE INDEX "consents_patient_id_purpose_version_key" ON "consents"("patient_id", "purpose", "version");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_profiles_hospital_id_key" ON "clinic_profiles"("hospital_id");

-- CreateIndex
CREATE INDEX "patient_acquisitions_hospital_id_idx" ON "patient_acquisitions"("hospital_id");

-- CreateIndex
CREATE INDEX "patient_acquisitions_patient_id_idx" ON "patient_acquisitions"("patient_id");

-- CreateIndex
CREATE INDEX "patient_acquisitions_source_idx" ON "patient_acquisitions"("source");

-- CreateIndex
CREATE INDEX "ai_documents_hospital_id_idx" ON "ai_documents"("hospital_id");

-- CreateIndex
CREATE INDEX "ai_documents_patient_id_idx" ON "ai_documents"("patient_id");

-- CreateIndex
CREATE INDEX "ai_documents_appt_id_idx" ON "ai_documents"("appt_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_operational_profiles_hospital_id_key" ON "clinic_operational_profiles"("hospital_id");

-- CreateIndex
CREATE INDEX "internal_referrals_hospital_id_idx" ON "internal_referrals"("hospital_id");

-- CreateIndex
CREATE INDEX "internal_referrals_patient_id_idx" ON "internal_referrals"("patient_id");

-- CreateIndex
CREATE INDEX "consultant_settlements_hospital_id_idx" ON "consultant_settlements"("hospital_id");

-- CreateIndex
CREATE INDEX "consultant_settlements_doctor_id_idx" ON "consultant_settlements"("doctor_id");

-- CreateIndex
CREATE INDEX "department_handoffs_visit_id_idx" ON "department_handoffs"("visit_id");

-- CreateIndex
CREATE INDEX "department_handoffs_hospital_id_idx" ON "department_handoffs"("hospital_id");

-- CreateIndex
CREATE INDEX "concept_mappings_concept_id_idx" ON "concept_mappings"("concept_id");

-- CreateIndex
CREATE INDEX "hospital_insurances_hospital_id_idx" ON "hospital_insurances"("hospital_id");

-- CreateIndex
CREATE INDEX "billing_packages_hospital_id_idx" ON "billing_packages"("hospital_id");

-- CreateIndex
CREATE INDEX "copay_rules_hospital_id_idx" ON "copay_rules"("hospital_id");

-- CreateIndex
CREATE INDEX "copay_rules_insurer_id_idx" ON "copay_rules"("insurer_id");

-- CreateIndex
CREATE INDEX "copay_rules_service_id_idx" ON "copay_rules"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profiles_doctor_id_key" ON "doctor_profiles"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_education_doctor_id_idx" ON "doctor_education"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_certifications_doctor_id_idx" ON "doctor_certifications"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_certifications_expiry_date_idx" ON "doctor_certifications"("expiry_date");

-- CreateIndex
CREATE INDEX "doctor_skills_doctor_id_idx" ON "doctor_skills"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_skills_doctor_id_skill_name_key" ON "doctor_skills"("doctor_id", "skill_name");

-- CreateIndex
CREATE INDEX "doctor_memberships_doctor_id_idx" ON "doctor_memberships"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_publications_doctor_id_idx" ON "doctor_publications"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_awards_doctor_id_idx" ON "doctor_awards"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_conferences_doctor_id_idx" ON "doctor_conferences"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_experience_doctor_id_idx" ON "doctor_experience"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_verifications_doctor_id_key" ON "doctor_verifications"("doctor_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_search_index_doctor_id_key" ON "doctor_search_index"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_search_index_city_idx" ON "doctor_search_index"("city");

-- CreateIndex
CREATE INDEX "doctor_search_index_avg_rating_idx" ON "doctor_search_index"("avg_rating" DESC);

-- CreateIndex
CREATE INDEX "doctor_search_index_specialties_idx" ON "doctor_search_index"("specialties");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_public_profiles_doctor_id_key" ON "doctor_public_profiles"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_availability_doctor_id_date_idx" ON "doctor_availability"("doctor_id", "date");

-- CreateIndex
CREATE INDEX "doctor_availability_hospital_id_date_idx" ON "doctor_availability"("hospital_id", "date");

-- CreateIndex
CREATE INDEX "doctor_availability_status_idx" ON "doctor_availability"("status");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_availability_doctor_id_date_hospital_id_key" ON "doctor_availability"("doctor_id", "date", "hospital_id");

-- CreateIndex
CREATE INDEX "doctor_leaves_doctor_id_idx" ON "doctor_leaves"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_leaves_status_idx" ON "doctor_leaves"("status");

-- CreateIndex
CREATE UNIQUE INDEX "timeline_events_correlation_id_key" ON "timeline_events"("correlation_id");

-- CreateIndex
CREATE INDEX "timeline_events_patient_id_timestamp_idx" ON "timeline_events"("patient_id", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "timeline_events_hospital_id_patient_id_idx" ON "timeline_events"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "timeline_events_event_type_idx" ON "timeline_events"("event_type");

-- CreateIndex
CREATE INDEX "timeline_events_category_idx" ON "timeline_events"("category");

-- CreateIndex
CREATE INDEX "timeline_events_correlation_id_idx" ON "timeline_events"("correlation_id");

-- CreateIndex
CREATE INDEX "chief_complaints_visit_id_idx" ON "chief_complaints"("visit_id");

-- CreateIndex
CREATE INDEX "clinical_history_visit_id_idx" ON "clinical_history"("visit_id");

-- CreateIndex
CREATE INDEX "clinical_examinations_visit_id_idx" ON "clinical_examinations"("visit_id");

-- CreateIndex
CREATE INDEX "diagnoses_visit_id_idx" ON "diagnoses"("visit_id");

-- CreateIndex
CREATE INDEX "diagnoses_icd10_code_idx" ON "diagnoses"("icd10_code");

-- CreateIndex
CREATE INDEX "investigation_orders_visit_id_idx" ON "investigation_orders"("visit_id");

-- CreateIndex
CREATE INDEX "treatments_visit_id_idx" ON "treatments"("visit_id");

-- CreateIndex
CREATE UNIQUE INDEX "icd10_codes_code_key" ON "icd10_codes"("code");

-- CreateIndex
CREATE INDEX "icd10_codes_code_idx" ON "icd10_codes"("code");

-- CreateIndex
CREATE INDEX "icd10_codes_category_id_idx" ON "icd10_codes"("category_id");

-- CreateIndex
CREATE INDEX "icd10_codes_parent_code_idx" ON "icd10_codes"("parent_code");

-- CreateIndex
CREATE UNIQUE INDEX "loinc_codes_loinc_number_key" ON "loinc_codes"("loinc_number");

-- CreateIndex
CREATE INDEX "loinc_codes_loinc_number_idx" ON "loinc_codes"("loinc_number");

-- CreateIndex
CREATE INDEX "loinc_codes_component_idx" ON "loinc_codes"("component");

-- CreateIndex
CREATE UNIQUE INDEX "snomed_concepts_concept_id_key" ON "snomed_concepts"("concept_id");

-- CreateIndex
CREATE INDEX "snomed_concepts_concept_id_idx" ON "snomed_concepts"("concept_id");

-- CreateIndex
CREATE INDEX "drug_master_name_idx" ON "drug_master"("name");

-- CreateIndex
CREATE INDEX "drug_master_generic_name_idx" ON "drug_master"("generic_name");

-- CreateIndex
CREATE INDEX "drug_brands_drug_master_id_idx" ON "drug_brands"("drug_master_id");

-- CreateIndex
CREATE INDEX "drug_brands_brand_name_idx" ON "drug_brands"("brand_name");

-- CreateIndex
CREATE UNIQUE INDEX "investigation_master_test_code_key" ON "investigation_master"("test_code");

-- CreateIndex
CREATE INDEX "investigation_master_test_name_idx" ON "investigation_master"("test_name");

-- CreateIndex
CREATE INDEX "investigation_master_loinc_code_idx" ON "investigation_master"("loinc_code");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_master_test_code_key" ON "radiology_master"("test_code");

-- CreateIndex
CREATE INDEX "radiology_master_test_name_idx" ON "radiology_master"("test_name");

-- CreateIndex
CREATE INDEX "radiology_master_modality_idx" ON "radiology_master"("modality");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_master_procedure_code_key" ON "procedure_master"("procedure_code");

-- CreateIndex
CREATE INDEX "procedure_master_procedure_name_idx" ON "procedure_master"("procedure_name");

-- CreateIndex
CREATE UNIQUE INDEX "vaccine_master_vaccine_code_key" ON "vaccine_master"("vaccine_code");

-- CreateIndex
CREATE INDEX "vaccine_master_vaccine_name_idx" ON "vaccine_master"("vaccine_name");

-- CreateIndex
CREATE INDEX "allergy_master_allergen_idx" ON "allergy_master"("allergen");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_templates_template_key_key" ON "clinical_templates"("template_key");

-- CreateIndex
CREATE INDEX "clinical_templates_template_key_idx" ON "clinical_templates"("template_key");

-- CreateIndex
CREATE INDEX "clinical_attachments_visit_id_idx" ON "clinical_attachments"("visit_id");

-- CreateIndex
CREATE INDEX "purchase_orders_hospital_id_idx" ON "purchase_orders"("hospital_id");

-- CreateIndex
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "drug_interactions_drug_id1_drug_id2_key" ON "drug_interactions"("drug_id1", "drug_id2");

-- CreateIndex
CREATE INDEX "nursing_notes_hospital_id_idx" ON "nursing_notes"("hospital_id");

-- CreateIndex
CREATE INDEX "nursing_notes_admission_id_idx" ON "nursing_notes"("admission_id");

-- CreateIndex
CREATE INDEX "mars_hospital_id_idx" ON "mars"("hospital_id");

-- CreateIndex
CREATE INDEX "mars_admission_id_idx" ON "mars"("admission_id");

-- CreateIndex
CREATE INDEX "ot_schedules_hospital_id_idx" ON "ot_schedules"("hospital_id");

-- CreateIndex
CREATE INDEX "ot_schedules_patient_id_idx" ON "ot_schedules"("patient_id");

-- CreateIndex
CREATE INDEX "icu_admissions_hospital_id_idx" ON "icu_admissions"("hospital_id");

-- CreateIndex
CREATE INDEX "icu_admissions_admission_id_idx" ON "icu_admissions"("admission_id");

-- CreateIndex
CREATE INDEX "insurance_verifications_hospital_id_idx" ON "insurance_verifications"("hospital_id");

-- CreateIndex
CREATE INDEX "insurance_claims_hospital_id_idx" ON "insurance_claims"("hospital_id");

-- CreateIndex
CREATE INDEX "timeline_attachments_event_id_idx" ON "timeline_attachments"("event_id");

-- CreateIndex
CREATE INDEX "timeline_tags_event_id_idx" ON "timeline_tags"("event_id");

-- CreateIndex
CREATE INDEX "timeline_tags_tag_idx" ON "timeline_tags"("tag");

-- CreateIndex
CREATE INDEX "timeline_bookmarks_user_id_idx" ON "timeline_bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "timeline_bookmarks_user_id_event_id_key" ON "timeline_bookmarks"("user_id", "event_id");

-- CreateIndex
CREATE INDEX "timeline_versions_event_id_idx" ON "timeline_versions"("event_id");

-- CreateIndex
CREATE INDEX "timeline_audit_event_id_idx" ON "timeline_audit"("event_id");

-- CreateIndex
CREATE INDEX "timeline_audit_action_idx" ON "timeline_audit"("action");

-- CreateIndex
CREATE INDEX "timeline_exports_patient_id_idx" ON "timeline_exports"("patient_id");

-- CreateIndex
CREATE INDEX "timeline_exports_requested_by_idx" ON "timeline_exports"("requested_by");

-- CreateIndex
CREATE INDEX "timeline_subscriptions_patient_id_idx" ON "timeline_subscriptions"("patient_id");

-- CreateIndex
CREATE INDEX "timeline_subscriptions_subscriber_id_idx" ON "timeline_subscriptions"("subscriber_id");

-- CreateIndex
CREATE INDEX "timeline_snapshots_patient_id_idx" ON "timeline_snapshots"("patient_id");

-- CreateIndex
CREATE INDEX "rules_hospital_id_idx" ON "rules"("hospital_id");

-- CreateIndex
CREATE INDEX "rules_category_idx" ON "rules"("category");

-- CreateIndex
CREATE INDEX "rules_trigger_event_idx" ON "rules"("trigger_event");

-- CreateIndex
CREATE INDEX "rule_executions_rule_id_idx" ON "rule_executions"("rule_id");

-- CreateIndex
CREATE INDEX "rule_executions_patient_id_idx" ON "rule_executions"("patient_id");

-- CreateIndex
CREATE INDEX "rule_executions_status_idx" ON "rule_executions"("status");

-- CreateIndex
CREATE INDEX "rule_schedules_rule_id_idx" ON "rule_schedules"("rule_id");

-- CreateIndex
CREATE INDEX "rule_schedules_next_run_at_idx" ON "rule_schedules"("next_run_at");

-- CreateIndex
CREATE INDEX "notification_providers_hospital_id_idx" ON "notification_providers"("hospital_id");

-- CreateIndex
CREATE INDEX "notification_providers_channel_idx" ON "notification_providers"("channel");

-- CreateIndex
CREATE INDEX "notification_campaigns_hospital_id_idx" ON "notification_campaigns"("hospital_id");

-- CreateIndex
CREATE INDEX "notification_deliveries_notification_id_idx" ON "notification_deliveries"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_hospital_id_idx" ON "notification_preferences"("hospital_id");

-- CreateIndex
CREATE INDEX "notification_events_hospital_id_idx" ON "notification_events"("hospital_id");

-- CreateIndex
CREATE INDEX "notification_events_event_idx" ON "notification_events"("event");

-- CreateIndex
CREATE INDEX "notification_audits_hospital_id_idx" ON "notification_audits"("hospital_id");

-- CreateIndex
CREATE INDEX "notification_audits_notification_id_idx" ON "notification_audits"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_provider_health_provider_id_key" ON "notification_provider_health"("provider_id");

-- CreateIndex
CREATE INDEX "notification_template_versions_template_id_idx" ON "notification_template_versions"("template_id");

-- CreateIndex
CREATE INDEX "journey_templates_hospital_id_idx" ON "journey_templates"("hospital_id");

-- CreateIndex
CREATE INDEX "journey_templates_category_idx" ON "journey_templates"("category");

-- CreateIndex
CREATE INDEX "journey_template_versions_template_id_idx" ON "journey_template_versions"("template_id");

-- CreateIndex
CREATE INDEX "journey_instances_template_id_idx" ON "journey_instances"("template_id");

-- CreateIndex
CREATE INDEX "journey_instances_patient_id_idx" ON "journey_instances"("patient_id");

-- CreateIndex
CREATE INDEX "journey_milestones_journey_id_idx" ON "journey_milestones"("journey_id");

-- CreateIndex
CREATE INDEX "journey_tasks_journey_id_idx" ON "journey_tasks"("journey_id");

-- CreateIndex
CREATE INDEX "journey_tasks_milestone_id_idx" ON "journey_tasks"("milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "journey_risks_journey_id_key" ON "journey_risks"("journey_id");

-- CreateIndex
CREATE INDEX "searchable_entities_search_vector_idx" ON "searchable_entities" USING GIN ("search_vector");

-- CreateIndex
CREATE INDEX "searchable_entities_entity_type_idx" ON "searchable_entities"("entity_type");

-- CreateIndex
CREATE INDEX "searchable_entities_hospital_id_idx" ON "searchable_entities"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "search_synonyms_term_key" ON "search_synonyms"("term");

-- CreateIndex
CREATE INDEX "search_logs_hospital_id_idx" ON "search_logs"("hospital_id");

-- CreateIndex
CREATE INDEX "search_logs_created_at_idx" ON "search_logs"("created_at");

-- CreateIndex
CREATE INDEX "inbox_events_status_created_at_idx" ON "inbox_events"("status", "created_at");

-- AddForeignKey
ALTER TABLE "doctor_identity_docs" ADD CONSTRAINT "doctor_identity_docs_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_registration" ADD CONSTRAINT "doctor_registration_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospitals_master" ADD CONSTRAINT "hospitals_master_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_facilities" ADD CONSTRAINT "hospital_facilities_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_admins" ADD CONSTRAINT "hospital_admins_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_departments" ADD CONSTRAINT "hospital_departments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_services" ADD CONSTRAINT "hospital_services_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_billing_profile" ADD CONSTRAINT "hospital_billing_profile_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_roles" ADD CONSTRAINT "hospital_roles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_verification_logs" ADD CONSTRAINT "hospital_verification_logs_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_hospital_affiliations" ADD CONSTRAINT "doctor_hospital_affiliations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_hospital_affiliations" ADD CONSTRAINT "doctor_hospital_affiliations_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_professional_history" ADD CONSTRAINT "doctor_professional_history_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_roles" ADD CONSTRAINT "doctor_roles_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_roles" ADD CONSTRAINT "doctor_roles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_flags" ADD CONSTRAINT "doctor_flags_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_addresses" ADD CONSTRAINT "patient_addresses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "patient_prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_categories" ADD CONSTRAINT "diagnostic_categories_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "diagnostic_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_master_tests" ADD CONSTRAINT "diagnostic_master_tests_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "diagnostic_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_panels" ADD CONSTRAINT "diagnostic_panels_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "diagnostic_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_panel_tests" ADD CONSTRAINT "diagnostic_panel_tests_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "diagnostic_panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_panel_tests" ADD CONSTRAINT "diagnostic_panel_tests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_master_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_diagnostic_pricing" ADD CONSTRAINT "hospital_diagnostic_pricing_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_diagnostic_pricing" ADD CONSTRAINT "hospital_diagnostic_pricing_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_master_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_panel_pricing" ADD CONSTRAINT "hospital_panel_pricing_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_panel_pricing" ADD CONSTRAINT "hospital_panel_pricing_panel_id_fkey" FOREIGN KEY ("panel_id") REFERENCES "diagnostic_panels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_orders" ADD CONSTRAINT "diagnostic_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_order_items" ADD CONSTRAINT "diagnostic_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "diagnostic_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_order_items" ADD CONSTRAINT "diagnostic_order_items_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_master_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "diagnostic_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_documents" ADD CONSTRAINT "diagnostic_documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "diagnostic_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_documents" ADD CONSTRAINT "diagnostic_documents_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "diagnostic_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_quality_controls" ADD CONSTRAINT "lab_quality_controls_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_quality_controls" ADD CONSTRAINT "lab_quality_controls_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "diagnostic_master_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visit_notes" ADD CONSTRAINT "visit_notes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_journeys" ADD CONSTRAINT "care_journeys_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recovery_steps" ADD CONSTRAINT "recovery_steps_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_logs" ADD CONSTRAINT "engagement_logs_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_check_ins" ADD CONSTRAINT "care_check_ins_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nudge_schedules" ADD CONSTRAINT "nudge_schedules_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_plans" ADD CONSTRAINT "medication_plans_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_up_plans" ADD CONSTRAINT "follow_up_plans_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_red_flags" ADD CONSTRAINT "care_red_flags_care_journey_id_fkey" FOREIGN KEY ("care_journey_id") REFERENCES "care_journeys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_observations" ADD CONSTRAINT "clinical_observations_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medical_history" ADD CONSTRAINT "patient_medical_history_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_medications" ADD CONSTRAINT "patient_medications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_records" ADD CONSTRAINT "vital_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vaccination_records" ADD CONSTRAINT "vaccination_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pregnancy_profiles" ADD CONSTRAINT "pregnancy_profiles_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anc_visits" ADD CONSTRAINT "anc_visits_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "obstetric_history" ADD CONSTRAINT "obstetric_history_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anc_supplement_logs" ADD CONSTRAINT "anc_supplement_logs_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mcp_cards" ADD CONSTRAINT "mcp_cards_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anc_retention_alerts" ADD CONSTRAINT "anc_retention_alerts_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newborn_records" ADD CONSTRAINT "newborn_records_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "newborn_records" ADD CONSTRAINT "newborn_records_baby_patient_id_fkey" FOREIGN KEY ("baby_patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_slips" ADD CONSTRAINT "referral_slips_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partograph_records" ADD CONSTRAINT "partograph_records_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "near_miss_audits" ADD CONSTRAINT "near_miss_audits_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_details" ADD CONSTRAINT "insurance_details_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_alerts" ADD CONSTRAINT "escalation_alerts_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_alerts" ADD CONSTRAINT "escalation_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_alerts" ADD CONSTRAINT "escalation_alerts_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_attending_doctor_id_fkey" FOREIGN KEY ("attending_doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_diagnostic_order_id_fkey" FOREIGN KEY ("diagnostic_order_id") REFERENCES "diagnostic_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "bills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "patient_prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_items" ADD CONSTRAINT "pharmacy_dispense_items_dispense_id_fkey" FOREIGN KEY ("dispense_id") REFERENCES "pharmacy_dispenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_items" ADD CONSTRAINT "pharmacy_dispense_items_drug_stock_id_fkey" FOREIGN KEY ("drug_stock_id") REFERENCES "drug_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_lifecycle_tags" ADD CONSTRAINT "patient_lifecycle_tags_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_stocks" ADD CONSTRAINT "drug_stocks_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_stocks" ADD CONSTRAINT "drug_stocks_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_lab_order_id_fkey" FOREIGN KEY ("lab_order_id") REFERENCES "lab_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_samples" ADD CONSTRAINT "lab_samples_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "investigation_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_catalog" ADD CONSTRAINT "service_catalog_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gateways" ADD CONSTRAINT "payment_gateways_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retention_rules" ADD CONSTRAINT "retention_rules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chronic_conditions" ADD CONSTRAINT "chronic_conditions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opd_configs" ADD CONSTRAINT "opd_configs_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_configs" ADD CONSTRAINT "integration_configs_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_event_mappings" ADD CONSTRAINT "notification_event_mappings_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_event_mappings" ADD CONSTRAINT "notification_event_mappings_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "notification_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_profiles" ADD CONSTRAINT "clinic_profiles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_acquisitions" ADD CONSTRAINT "patient_acquisitions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_documents" ADD CONSTRAINT "ai_documents_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinic_operational_profiles" ADD CONSTRAINT "clinic_operational_profiles_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_referrals" ADD CONSTRAINT "internal_referrals_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_referrals" ADD CONSTRAINT "internal_referrals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_referrals" ADD CONSTRAINT "internal_referrals_from_doctor_id_fkey" FOREIGN KEY ("from_doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_referrals" ADD CONSTRAINT "internal_referrals_to_doctor_id_fkey" FOREIGN KEY ("to_doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_settlements" ADD CONSTRAINT "consultant_settlements_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultant_settlements" ADD CONSTRAINT "consultant_settlements_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_handoffs" ADD CONSTRAINT "department_handoffs_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_handoffs" ADD CONSTRAINT "department_handoffs_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department_handoffs" ADD CONSTRAINT "department_handoffs_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_mappings" ADD CONSTRAINT "concept_mappings_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_insurances" ADD CONSTRAINT "hospital_insurances_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_packages" ADD CONSTRAINT "billing_packages_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copay_rules" ADD CONSTRAINT "copay_rules_insurer_id_fkey" FOREIGN KEY ("insurer_id") REFERENCES "hospital_insurances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copay_rules" ADD CONSTRAINT "copay_rules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_catalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copay_rules" ADD CONSTRAINT "copay_rules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_profiles" ADD CONSTRAINT "doctor_profiles_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_education" ADD CONSTRAINT "doctor_education_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_certifications" ADD CONSTRAINT "doctor_certifications_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_cert_documents" ADD CONSTRAINT "doctor_cert_documents_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "doctor_certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_skills" ADD CONSTRAINT "doctor_skills_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_memberships" ADD CONSTRAINT "doctor_memberships_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_publications" ADD CONSTRAINT "doctor_publications_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_awards" ADD CONSTRAINT "doctor_awards_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_conferences" ADD CONSTRAINT "doctor_conferences_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_experience" ADD CONSTRAINT "doctor_experience_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_verifications" ADD CONSTRAINT "doctor_verifications_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_amended_event_id_fkey" FOREIGN KEY ("amended_event_id") REFERENCES "timeline_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_brands" ADD CONSTRAINT "drug_brands_drug_master_id_fkey" FOREIGN KEY ("drug_master_id") REFERENCES "drug_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nursing_notes" ADD CONSTRAINT "nursing_notes_nurse_id_fkey" FOREIGN KEY ("nurse_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mars" ADD CONSTRAINT "mars_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mars" ADD CONSTRAINT "mars_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mars" ADD CONSTRAINT "mars_administered_by_id_fkey" FOREIGN KEY ("administered_by_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ot_schedules" ADD CONSTRAINT "ot_schedules_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ot_schedules" ADD CONSTRAINT "ot_schedules_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ot_schedules" ADD CONSTRAINT "ot_schedules_surgeon_id_fkey" FOREIGN KEY ("surgeon_id") REFERENCES "doctors_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "icu_admissions" ADD CONSTRAINT "icu_admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_verifications" ADD CONSTRAINT "insurance_verifications_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_verifications" ADD CONSTRAINT "insurance_verifications_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_attachments" ADD CONSTRAINT "timeline_attachments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_tags" ADD CONSTRAINT "timeline_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_bookmarks" ADD CONSTRAINT "timeline_bookmarks_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_versions" ADD CONSTRAINT "timeline_versions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "timeline_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_audit" ADD CONSTRAINT "timeline_audit_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "timeline_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_exports" ADD CONSTRAINT "timeline_exports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_subscriptions" ADD CONSTRAINT "timeline_subscriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeline_snapshots" ADD CONSTRAINT "timeline_snapshots_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_instances" ADD CONSTRAINT "journey_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "journey_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_milestones" ADD CONSTRAINT "journey_milestones_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_tasks" ADD CONSTRAINT "journey_tasks_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_tasks" ADD CONSTRAINT "journey_tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "journey_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_risks" ADD CONSTRAINT "journey_risks_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

