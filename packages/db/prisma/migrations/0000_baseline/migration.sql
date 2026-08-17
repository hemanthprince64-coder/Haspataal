-- CreateEnum
CREATE TYPE "DischargeProcessStatus" AS ENUM ('NOT_INITIATED', 'CLEARANCES_PENDING', 'READY_FOR_DEPARTURE');

-- CreateEnum
CREATE TYPE "PhysicalPresenceStatus" AS ENUM ('PRESENT', 'ABSENCE_SUSPECTED', 'DEPARTED_STANDARD', 'DEPARTED_LAMA', 'DEPARTED_WITHOUT_NOTICE');

-- CreateEnum
CREATE TYPE "LegacyDepartureClassification" AS ENUM ('NONE', 'LEGACY_DISCHARGED_WITHOUT_AUTHORITATIVE_DEPARTURE_EVIDENCE');

-- CreateEnum
CREATE TYPE "DeparturePathway" AS ENUM ('STANDARD', 'LAMA', 'WITHOUT_NOTICE', 'LEGACY_UNCLEAR');

-- CreateEnum
CREATE TYPE "EvidenceType" AS ENUM ('MANUAL_ENTRY', 'SYSTEM_OVERRIDE', 'SECURITY_GATE', 'LEGACY_BACKFILL');

-- CreateEnum
CREATE TYPE "LamaStatus" AS ENUM ('INITIATED', 'DOCUMENTATION_IN_PROGRESS', 'DOCUMENTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "AbsenceStatus" AS ENUM ('SUSPECTED', 'INVESTIGATION_IN_PROGRESS', 'RESOLVED_RETURNED', 'CONFIRMED_DEPARTED');

-- CreateEnum
CREATE TYPE "HospitalStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AWAITING_PAYMENT', 'BOOKED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN', 'IN_CONSULTATION', 'COMPLETED', 'FOLLOW_UP', 'CANCELLED', 'NO_SHOW', 'REJECTED', 'EXPIRED', 'RESCHEDULE_REQUESTED', 'RESCHEDULE_ACCEPTED', 'RESCHEDULE_DECLINED');

-- CreateEnum
CREATE TYPE "AppointmentPaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'STAFF', 'NURSE', 'BILLING', 'PHARMACIST', 'LAB_TECH', 'PATHOLOGIST', 'PATIENT');

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
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'DRAFT', 'SUBMITTED', 'SENT', 'ACCEPTED', 'DECLINED', 'APPOINTMENT_SCHEDULED', 'CONSULTATION_IN_PROGRESS', 'CONSULTATION_COMPLETED', 'CARE_TRANSFER_REQUESTED', 'CARE_TRANSFER_ACCEPTED', 'CARE_TRANSFER_COMPLETED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReferralPriority" AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY', 'STAT');

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

-- CreateEnum
CREATE TYPE "AuthMethodType" AS ENUM ('MOBILE_OTP');

-- CreateEnum
CREATE TYPE "AuthStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('MOBILE', 'EMAIL');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('ACTIVE', 'UNVERIFIED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ContactRelationshipType" AS ENUM ('SELF', 'PARENT', 'GUARDIAN', 'CAREGIVER', 'EMERGENCY_CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationChallengeStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'CONSUMED');

-- CreateEnum
CREATE TYPE "MergeRequestStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'EXECUTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RelationshipLevel" AS ENUM ('LONGITUDINAL', 'EPISODIC', 'CONSULTATION');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('PRE_VISIT', 'ACTIVE', 'POST_CARE_FOLLOWUP', 'ENDED');

-- CreateEnum
CREATE TYPE "RelationshipTrigger" AS ENUM ('APPOINTMENT_BOOKED', 'CHECK_IN', 'ADMISSION', 'REFERRAL_ACCEPTED', 'BREAK_GLASS');

-- CreateEnum
CREATE TYPE "TerminationReason" AS ENUM ('DISCHARGE_COMPLETED', 'LAMA_COMPLETED', 'TRANSFER_ACCEPTED', 'EXPLICIT_REVOCATION', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CarePurpose" AS ENUM ('TRIAGE', 'PRIMARY_TREATMENT', 'SECONDARY_CONSULT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "CareTeamRole" AS ENUM ('PRIMARY', 'CO_TREATING', 'CONSULTING', 'NURSE', 'RESIDENT');

-- CreateEnum
CREATE TYPE "ResponsibilityStatus" AS ENUM ('ACTIVE', 'TRANSFERRED', 'ENDED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('INITIATED', 'ACCEPTED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BreakGlassStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ReviewState" AS ENUM ('PENDING', 'REVIEWED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "CareDepartureStatus" AS ENUM ('NONE', 'DISCHARGE_CLINICALLY_DECIDED', 'LAMA_INITIATED', 'ABSCONDING_SUSPECTED', 'PATIENT_PHYSICALLY_LEFT_STANDARD', 'PATIENT_PHYSICALLY_LEFT_LAMA', 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'BLOOD_BANK', 'REFERRAL', 'PHYSIOTHERAPY', 'NUTRITION', 'DIALYSIS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'PARTIALLY_COMPLETED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "ClinicalContext" AS ENUM ('OPD', 'IPD', 'EMERGENCY', 'ICU', 'NICU', 'LABOUR_ROOM', 'TELEMEDICINE', 'HOME_CARE');

-- CreateEnum
CREATE TYPE "PharmacyExecutionStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'STOCK_RESERVED', 'PARTIALLY_DISPENSED', 'FULLY_DISPENSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'CONSUMED', 'RELEASED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryBatchStatus" AS ENUM ('ACTIVE', 'RECALLED', 'DEPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('RESERVE', 'UNRESERVE', 'DISPENSE', 'RETURN', 'PURCHASE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'EXPIRED', 'DAMAGED', 'DESTROYED');

-- CreateEnum
CREATE TYPE "MARAttemptStatus" AS ENUM ('ADMINISTERED', 'REFUSED', 'MISSED', 'OMITTED');

-- CreateEnum
CREATE TYPE "LaboratoryExecutionStatus" AS ENUM ('PENDING_COLLECTION', 'COLLECTION_IN_PROGRESS', 'COLLECTED', 'RECEIVED', 'IN_ANALYZER_QUEUE', 'ANALYZING', 'RESULT_ENTERED', 'RESULT_VERIFIED', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SpecimenType" AS ENUM ('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'STOOL', 'CSF', 'SPUTUM', 'SWAB', 'TISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecimenStatus" AS ENUM ('EXPECTED', 'COLLECTED', 'RECEIVED', 'REJECTED', 'LOST', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('DRAFT', 'VERIFIED', 'RELEASED', 'AMENDED');

-- CreateEnum
CREATE TYPE "SpecimenRejectionReason" AS ENUM ('HEMOLYZED', 'CLOTTED', 'INSUFFICIENT', 'WRONG_CONTAINER', 'LABEL_MISMATCH', 'EXPIRED', 'OTHER');

-- CreateEnum
CREATE TYPE "RadiologyExecutionStatus" AS ENUM ('PENDING_SCHEDULING', 'SCHEDULED', 'ARRIVED', 'ACQUIRING', 'ACQUIRED', 'REPORTING', 'REPORT_VERIFIED', 'RELEASED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RadiologyReportStatus" AS ENUM ('DRAFT', 'PRELIMINARY', 'FINAL', 'AMENDED');

-- CreateEnum
CREATE TYPE "ModalityType" AS ENUM ('XRAY', 'CT', 'MRI', 'US', 'PET', 'NM', 'FLORO');

-- CreateEnum
CREATE TYPE "ContrastType" AS ENUM ('IODINE', 'BARIUM', 'GADOLINIUM', 'MICROBUBBLES', 'NONE');

-- CreateEnum
CREATE TYPE "ProcedureExecutionStatus" AS ENUM ('PENDING', 'SCHEDULED', 'PRE_OP', 'IN_PROGRESS', 'RECOVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProcedurePriority" AS ENUM ('ELECTIVE', 'URGENT', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "ProcedureRoomStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'CLEANING', 'MAINTENANCE', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "ProcedureChecklistStatus" AS ENUM ('PENDING', 'SIGN_IN_COMPLETE', 'TIME_OUT_COMPLETE', 'SIGN_OUT_COMPLETE');

-- CreateEnum
CREATE TYPE "ProcedureOutcome" AS ENUM ('SUCCESS', 'PARTIAL_SUCCESS', 'ABORTED', 'COMPLICATION', 'DEATH');

-- CreateEnum
CREATE TYPE "AnesthesiaType" AS ENUM ('LOCAL', 'REGIONAL', 'GENERAL', 'SEDATION', 'NONE');

-- CreateEnum
CREATE TYPE "ProcedureCancellationReason" AS ENUM ('PATIENT_REFUSAL', 'MEDICAL_CONTRAINDICATION', 'EQUIPMENT_FAILURE', 'STAFF_UNAVAILABLE', 'EMERGENCY_PREEMPTION', 'NO_SHOW', 'OTHER');

-- CreateEnum
CREATE TYPE "BloodComponentType" AS ENUM ('PACKED_RBC', 'WHOLE_BLOOD', 'PLATELETS', 'FRESH_FROZEN_PLASMA', 'CRYOPRECIPITATE', 'GRANULOCYTES');

-- CreateEnum
CREATE TYPE "BloodRequestStatus" AS ENUM ('REQUESTED', 'APPROVED', 'CROSSMATCH_PENDING', 'CROSSMATCH_COMPLETE', 'ALLOCATED', 'ISSUED', 'TRANSFUSION_STARTED', 'TRANSFUSION_COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrossmatchStatus" AS ENUM ('PENDING', 'COMPATIBLE', 'INCOMPATIBLE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransfusionStatus" AS ENUM ('NOT_STARTED', 'STARTED', 'PAUSED', 'COMPLETED', 'STOPPED');

-- CreateEnum
CREATE TYPE "ReactionSeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING');

-- CreateEnum
CREATE TYPE "BloodUnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'ISSUED', 'TRANSFUSED', 'DISCARDED', 'QUARANTINED');

-- CreateEnum
CREATE TYPE "AllocationPolicy" AS ENUM ('FIFO', 'FEFO', 'MANUAL_OVERRIDE');

-- CreateEnum
CREATE TYPE "TransfusionReactionOutcome" AS ENUM ('RESOLVED', 'ESCALATED', 'FATAL');

-- CreateEnum
CREATE TYPE "TransfusionReactionStatus" AS ENUM ('RECORDED', 'CLINICAL_REVIEW', 'RESOLVED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ReferralType" AS ENUM ('INTERNAL_SAME_DEPARTMENT', 'INTERNAL_CROSS_DEPARTMENT', 'INTERNAL_CROSS_HOSPITAL', 'EXTERNAL_HOSPITAL', 'SECOND_OPINION', 'FOLLOW_UP_REFERRAL', 'TUMOR_BOARD');

-- CreateEnum
CREATE TYPE "ReferralOutcome" AS ENUM ('ADVICE_ONLY', 'TRANSFER_ACCEPTED', 'TRANSFER_DECLINED', 'FURTHER_FOLLOW_UP_REQUIRED', 'CLOSED');

-- CreateEnum
CREATE TYPE "CommunicationStatus" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'ACKNOWLEDGED', 'FAILED');

-- CreateEnum
CREATE TYPE "CareTransferStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('PLATFORM_ADMIN', 'NETWORK_ADMIN', 'HOSPITAL_ADMIN');

-- CreateEnum
CREATE TYPE "EncounterType" AS ENUM ('OPD', 'IPD', 'EMERGENCY', 'TELECONSULTATION', 'HOME_VISIT', 'DAYCARE', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('ACTIVE', 'TRIAGE', 'CONSULTATION', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ClinicalOrderType" AS ENUM ('LAB', 'RADIOLOGY', 'PROCEDURE', 'PHARMACY');

-- CreateEnum
CREATE TYPE "ClinicalOrderStatus" AS ENUM ('ORDERED', 'ACCEPTED', 'SCHEDULED', 'IN_PROGRESS', 'VERIFIED', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClinicalTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SampleStatus" AS ENUM ('COLLECTION_PENDING', 'COLLECTED', 'ACCESSIONED', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SampleType" AS ENUM ('BLOOD', 'SERUM', 'PLASMA', 'URINE', 'CSF', 'STOOL', 'SWAB', 'BIOPSY', 'OTHER');

-- CreateEnum
CREATE TYPE "LabResultStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'VERIFIED', 'AMENDED');

-- CreateEnum
CREATE TYPE "BillingSourceEvent" AS ENUM ('CONSULTATION_COMPLETED', 'LAB_RESULT_VERIFIED', 'RADIOLOGY_COMPLETED', 'MEDICATION_DISPENSED', 'PROCEDURE_COMPLETED');

-- CreateEnum
CREATE TYPE "SourceAggregateType" AS ENUM ('ENCOUNTER', 'CLINICAL_ORDER', 'PRESCRIPTION', 'LAB_RESULT', 'RADIOLOGY_REPORT', 'PROCEDURE');

-- CreateEnum
CREATE TYPE "ChargeCategory" AS ENUM ('CONSULTATION', 'LAB', 'RADIOLOGY', 'PHARMACY', 'PROCEDURE', 'ROOM', 'MISC');

-- CreateEnum
CREATE TYPE "BillingAuditAction" AS ENUM ('CHARGE_CREATED', 'INVOICE_GENERATED', 'INVOICE_ISSUED', 'INVOICE_PRINTED', 'PAYMENT_INTENT_CREATED', 'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'PAYMENT_REFUNDED', 'ADJUSTMENT_CREATED', 'INVOICE_VOIDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CHEQUE', 'INSURANCE');

-- CreateEnum
CREATE TYPE "PaymentIntentStatus" AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'VOIDED');

-- CreateEnum
CREATE TYPE "AllocationStatus" AS ENUM ('ACTIVE', 'REVERSED');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('ISSUED', 'VOIDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED');

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
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
    "account_status" TEXT NOT NULL DEFAULT 'inactive',
    "onboarding_state" TEXT NOT NULL DEFAULT 'CREATED',
    "operational_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "subscription_status" TEXT NOT NULL DEFAULT 'TRIAL',
    "compliance_status" TEXT NOT NULL DEFAULT 'PENDING',
    "health_status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "health_score" INTEGER,
    "health_metrics" JSONB,
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
    "encounter_id" TEXT,
    "type" TEXT NOT NULL,
    "file_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

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
CREATE TABLE "appointment_payments" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "AppointmentPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT,

    CONSTRAINT "appointment_payments_pkey" PRIMARY KEY ("id")
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
    "visit_id" TEXT,
    "encounter_id" TEXT,
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
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

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
    "encounter_id" TEXT,
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
    "encounter_id" TEXT,
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
    "tenant_id" TEXT,
    "phone" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,

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
    "event_version" INTEGER,
    "aggregate_type" TEXT,
    "aggregate_id" TEXT,
    "scope_type" TEXT,
    "hospital_id" TEXT,
    "tenant_id" TEXT,
    "actor_id" TEXT,
    "actor_type" TEXT,
    "actor_role" TEXT,
    "correlation_id" TEXT,
    "causation_id" TEXT,
    "depth" INTEGER DEFAULT 0,
    "occurred_at" TIMESTAMP(3),
    "delivery_status" TEXT DEFAULT 'PENDING',
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
    "encounter_id" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "aggregate_id" TEXT,
    "aggregate_type" TEXT,

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
    "encounter_id" TEXT,
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
CREATE TABLE "lama_episodes" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "status" "LamaStatus" NOT NULL,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiated_by" TEXT NOT NULL,
    "documented_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),

    CONSTRAINT "lama_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absence_episodes" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "status" "AbsenceStatus" NOT NULL,
    "suspected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "absence_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_departure_records" (
    "id" TEXT NOT NULL,
    "admission_id" TEXT NOT NULL,
    "pathway" "DeparturePathway" NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_by_actor_id" TEXT NOT NULL,
    "confirmer_role" TEXT NOT NULL,
    "evidenceType" "EvidenceType" NOT NULL,
    "source_workflow" TEXT NOT NULL,
    "correlation_id" TEXT NOT NULL,

    CONSTRAINT "physical_departure_records_pkey" PRIMARY KEY ("id")
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
    "clinical_status" TEXT DEFAULT 'DISCHARGE_CLINICALLY_DECIDED',
    "reason" TEXT,
    "admitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_discharge_at" TIMESTAMP(3),
    "discharged_at" TIMESTAMP(3),
    "discharge_summary" TEXT,
    "daily_bed_charge" DECIMAL(65,30),
    "payload" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "discharge_process_status" "DischargeProcessStatus",
    "physical_presence_status" "PhysicalPresenceStatus",
    "legacy_departure_classification" "LegacyDepartureClassification",

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
    "version" INTEGER NOT NULL DEFAULT 1,
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
    "charge_item_id" TEXT,

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
    "encounter_id" TEXT,
    "module" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "entity_type" TEXT,
    "entity_id" TEXT,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
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
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

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
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

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

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_contact_points" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "relationship" "ContactRelationshipType" NOT NULL DEFAULT 'SELF',
    "value_encrypted" TEXT NOT NULL,
    "value_lookup_hash" TEXT NOT NULL,
    "lookup_key_version" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_contact_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_methods" (
    "id" TEXT NOT NULL,
    "user_account_id" TEXT NOT NULL,
    "contact_point_id" TEXT NOT NULL,
    "type" "AuthMethodType" NOT NULL,
    "identifier_lookup_hash" TEXT NOT NULL,
    "lookup_key_version" TEXT NOT NULL,
    "claim_key" TEXT NOT NULL,
    "status" "AuthStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobile_verification_challenges" (
    "id" TEXT NOT NULL,
    "mobile_lookup_hash" TEXT NOT NULL,
    "mobile_encrypted" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "otp_digest" TEXT NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "status" "VerificationChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "consumed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mobile_verification_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_aliases" (
    "id" TEXT NOT NULL,
    "alias_patient_id" TEXT NOT NULL,
    "canonical_patient_id" TEXT NOT NULL,
    "reason" TEXT,
    "merged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merged_by" TEXT,
    "merge_request_id" TEXT,

    CONSTRAINT "patient_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_merge_requests" (
    "id" TEXT NOT NULL,
    "source_patient_ids" TEXT[],
    "target_patient_id" TEXT NOT NULL,
    "status" "MergeRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_by" TEXT NOT NULL,
    "requester_organization_id" TEXT,
    "reviewed_by" TEXT,
    "approved_by" TEXT,
    "executed_by" TEXT,
    "reason" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "executed_at" TIMESTAMP(3),

    CONSTRAINT "identity_merge_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_patient_relationships" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "episode_id" TEXT,
    "originating_event_id" TEXT,
    "level" "RelationshipLevel" NOT NULL DEFAULT 'EPISODIC',
    "status" "RelationshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "carePurpose" "CarePurpose" NOT NULL,
    "sourceTrigger" "RelationshipTrigger" NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "ended_by" TEXT,
    "termination_reason" "TerminationReason",
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "doctor_patient_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_responsibilities" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL,
    "status" "ResponsibilityStatus" NOT NULL DEFAULT 'ACTIVE',
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "termination_reason" TEXT,

    CONSTRAINT "care_responsibilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_of_cares" (
    "id" TEXT NOT NULL,
    "initiating_doctor_id" TEXT NOT NULL,
    "receiving_doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "episode_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'INITIATED',
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "transfer_of_cares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "break_glass_activations" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "episode_id" TEXT,
    "reason" TEXT NOT NULL,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "status" "BreakGlassStatus" NOT NULL DEFAULT 'ACTIVE',
    "review_state" "ReviewState" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "break_glass_activations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumer_idempotency_ledger" (
    "event_id" TEXT NOT NULL,
    "consumer_name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_ms" INTEGER,

    CONSTRAINT "consumer_idempotency_ledger_pkey" PRIMARY KEY ("event_id","consumer_name","version")
);

-- CreateTable
CREATE TABLE "projection_checkpoints" (
    "projection_name" TEXT NOT NULL,
    "consumer_name" TEXT NOT NULL,
    "last_event_id" TEXT,
    "last_occurred_at" TIMESTAMP(3),
    "replay_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "replay_started_at" TIMESTAMP(3),
    "replay_completed_at" TIMESTAMP(3),
    "projection_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "projection_checkpoints_pkey" PRIMARY KEY ("projection_name")
);

-- CreateTable
CREATE TABLE "analytics_patient_projections" (
    "patient_id" TEXT NOT NULL,
    "total_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_outpatient_visits" INTEGER NOT NULL DEFAULT 0,
    "total_lamas" INTEGER NOT NULL DEFAULT 0,
    "first_visit_date" TIMESTAMP(3),
    "last_visit_date" TIMESTAMP(3),
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_patient_projections_pkey" PRIMARY KEY ("patient_id")
);

-- CreateTable
CREATE TABLE "analytics_admission_projections" (
    "admission_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL,
    "clinical_discharge_date" TIMESTAMP(3),
    "physical_departure_date" TIMESTAMP(3),
    "departure_type" TEXT,
    "length_of_stay_hours" DOUBLE PRECISION,
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_admission_projections_pkey" PRIMARY KEY ("admission_id")
);

-- CreateTable
CREATE TABLE "analytics_hospital_projections" (
    "hospital_id" TEXT NOT NULL,
    "active_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_admissions" INTEGER NOT NULL DEFAULT 0,
    "total_discharges" INTEGER NOT NULL DEFAULT 0,
    "average_length_of_stay" DOUBLE PRECISION,
    "projection_version" INTEGER NOT NULL DEFAULT 1,
    "last_processed_event_id" TEXT,
    "last_processed_occurred_at" TIMESTAMP(3),
    "rebuilt_at" TIMESTAMP(3),

    CONSTRAINT "analytics_hospital_projections_pkey" PRIMARY KEY ("hospital_id")
);

-- CreateTable
CREATE TABLE "clinical_order_catalogs" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_order_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_order_catalog_versions" (
    "id" TEXT NOT NULL,
    "catalog_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_order_catalog_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_groups" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ordered_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_context" "ClinicalContext" NOT NULL,
    "context_id" TEXT,
    "group_id" TEXT,
    "ordered_by" TEXT NOT NULL,
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_versions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "priority" "OrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "clinical_notes" TEXT,
    "reason_for_change" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,
    "department_id" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'REQUESTED',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "schedule" JSONB,
    "clinical_notes" TEXT,
    "external_system" TEXT,
    "external_reference_id" TEXT,
    "sync_status" TEXT,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_dependencies" (
    "id" TEXT NOT NULL,
    "source_item_id" TEXT NOT NULL,
    "target_item_id" TEXT NOT NULL,
    "dependencyType" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_executions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_id" TEXT,
    "status" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_cancellations" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "cancelled_by" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_cancellations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_audits" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_order_id" TEXT,
    "status" "PharmacyExecutionStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "version" INTEGER NOT NULL DEFAULT 1,
    "verified_by" TEXT,
    "dispensed_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "dispensed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_verifications" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "verified_by" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "override" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "pharmacy_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "prescribed_quantity" INTEGER NOT NULL,
    "dispensed_quantity" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "verified_by" TEXT,
    "dispensed_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "dispensed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_substitutions" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "substituted_catalog_version_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pharmacy_substitutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" TEXT NOT NULL,
    "inventory_item_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "physical_stock" INTEGER NOT NULL,
    "reserved_stock" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryBatchStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "actor_id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_dispenses" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "dispensed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispensed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacy_execution_dispenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pharmacy_execution_dispense_items" (
    "id" TEXT NOT NULL,
    "dispense_id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "reservation_id" TEXT,
    "quantity_dispensed" INTEGER NOT NULL,

    CONSTRAINT "pharmacy_execution_dispense_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medication_administration_attempts" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "dispense_item_id" TEXT,
    "scheduled_for" TIMESTAMP(3),
    "status" "MARAttemptStatus" NOT NULL DEFAULT 'ADMINISTERED',
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempted_by_id" TEXT NOT NULL,
    "clinical_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_administration_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_order_id" TEXT,
    "order_version_id" TEXT NOT NULL,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'PENDING_COLLECTION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "specimen_id" TEXT,
    "result_id" TEXT,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'PENDING_COLLECTION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specimens" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "specimen_type" "SpecimenType" NOT NULL,
    "status" "SpecimenStatus" NOT NULL DEFAULT 'EXPECTED',
    "collection_time" TIMESTAMP(3),
    "collector_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specimens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specimen_collection_attempts" (
    "id" TEXT NOT NULL,
    "specimen_id" TEXT NOT NULL,
    "status" "SpecimenStatus" NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempted_by_id" TEXT NOT NULL,
    "rejection_reason" "SpecimenRejectionReason",
    "notes" TEXT,

    CONSTRAINT "specimen_collection_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyzer_queues" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "analyzer_id" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "queue_position" INTEGER NOT NULL DEFAULT 0,
    "status" "LaboratoryExecutionStatus" NOT NULL DEFAULT 'IN_ANALYZER_QUEUE',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analyzer_queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyzer_devices" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "vendor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "analyzer_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_results" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "ResultStatus" NOT NULL DEFAULT 'DRAFT',
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratory_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratory_result_versions" (
    "id" TEXT NOT NULL,
    "result_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "values" JSONB NOT NULL,
    "reference_ranges" JSONB,
    "abnormal_flags" JSONB,
    "units" JSONB,
    "flags" JSONB,
    "instrument_flags" JSONB,
    "verification_notes" JSONB,
    "comments" JSONB,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "released_at" TIMESTAMP(3),
    "released_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "laboratory_result_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_value_rules" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "test_code" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "upper_threshold" DOUBLE PRECISION,
    "severity" TEXT NOT NULL,

    CONSTRAINT "critical_value_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "critical_value_notifications" (
    "id" TEXT NOT NULL,
    "result_version_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "critical_value_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_executions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "clinical_order_id" TEXT,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'PENDING_SCHEDULING',
    "appointment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'PENDING_SCHEDULING',
    "modality" "ModalityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_appointments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "modality_id" TEXT NOT NULL,
    "status" "RadiologyExecutionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modality_devices" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modality" "ModalityType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "manufacturer" TEXT,
    "model" TEXT,
    "ae_title" TEXT,
    "supports_dicom" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modality_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_acquisition_sessions" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "modality_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "radiology_acquisition_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_studies" (
    "id" TEXT NOT NULL,
    "study_instance_uid" TEXT,
    "accession_number" TEXT NOT NULL,
    "clinical_order_id" TEXT,
    "encounter_id" TEXT,
    "patient_id" TEXT,
    "hospital_id" TEXT,
    "session_id" TEXT,
    "dicom_study_date" TEXT,
    "dicom_study_time" TEXT,
    "series_count" INTEGER,
    "image_count" INTEGER,
    "modality" TEXT,
    "status" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "scheduled_by" TEXT,
    "accessioned_by" TEXT,
    "acquired_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imaging_studies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_series" (
    "id" TEXT NOT NULL,
    "series_instance_uid" TEXT NOT NULL,
    "study_id" TEXT NOT NULL,
    "series_number" INTEGER NOT NULL,
    "modality" "ModalityType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imaging_instances" (
    "id" TEXT NOT NULL,
    "sop_instance_uid" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "instance_number" INTEGER NOT NULL,
    "storage_uri" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "checksum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imaging_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrast_administrations" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "contrast_type" "ContrastType" NOT NULL,
    "agent_name" TEXT NOT NULL,
    "lot_number" TEXT,
    "dose" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "reaction_observed" BOOLEAN NOT NULL DEFAULT false,
    "reaction_severity" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contrast_administrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_reports" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT,
    "study_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "clinical_history" TEXT,
    "findings" TEXT,
    "impression" TEXT,
    "recommendation" TEXT,
    "reported_by" TEXT,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radiology_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_report_versions" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "entered_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_report_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radiology_critical_findings" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "finding" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "notified_doctor" TEXT,
    "notified_nurse" TEXT,
    "acknowledged_by" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "communication_log" TEXT,
    "communication_method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "radiology_critical_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_execution" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "ProcedureExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ProcedurePriority" NOT NULL DEFAULT 'ELECTIVE',
    "surgeon_id" TEXT,
    "room_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_execution_item" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "catalog_version_id" TEXT NOT NULL,
    "status" "ProcedureExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_execution_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_appointment" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "scheduled_start_time" TIMESTAMP(3) NOT NULL,
    "scheduled_end_time" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'BOOKED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_room" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "status" "ProcedureRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_session" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "patient_entered_at" TIMESTAMP(3),
    "procedure_started_at" TIMESTAMP(3),
    "procedure_ended_at" TIMESTAMP(3),
    "patient_exited_at" TIMESTAMP(3),
    "outcome" "ProcedureOutcome",
    "cancellation_reason" "ProcedureCancellationReason",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_checklist" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "status" "ProcedureChecklistStatus" NOT NULL DEFAULT 'PENDING',
    "sign_in_at" TIMESTAMP(3),
    "sign_in_by" TEXT,
    "time_out_at" TIMESTAMP(3),
    "time_out_by" TEXT,
    "sign_out_at" TIMESTAMP(3),
    "sign_out_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_checklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anesthesia_episode" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "anesthesia_type" "AnesthesiaType" NOT NULL,
    "anesthetist_id" TEXT NOT NULL,
    "induction_at" TIMESTAMP(3),
    "emergence_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anesthesia_episode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "implant_usage" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "implant_name" TEXT NOT NULL,
    "serial_number" TEXT,
    "lot_number" TEXT,
    "manufacturer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "implant_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_report" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "active_version_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_report_version" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "reason" TEXT,
    "author_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedure_report_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedure_critical_incident" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL,
    "detected_by" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedure_critical_incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalBloodBankPolicy" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "componentType" "BloodComponentType" NOT NULL,
    "defaultCrossmatchValidityHours" INTEGER NOT NULL,
    "maximumReservationHours" INTEGER NOT NULL,
    "emergencyReleaseEnabled" BOOLEAN NOT NULL DEFAULT true,
    "doubleVerificationRequired" BOOLEAN NOT NULL DEFAULT true,
    "bedsideVerificationRequired" BOOLEAN NOT NULL DEFAULT true,
    "allocationPolicy" "AllocationPolicy" NOT NULL DEFAULT 'FIFO',

    CONSTRAINT "HospitalBloodBankPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodBankExecution" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodBankExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodBankExecutionItem" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "componentType" "BloodComponentType" NOT NULL,
    "requestedVolumeMl" DOUBLE PRECISION,
    "requestedUnits" INTEGER NOT NULL,
    "status" "BloodRequestStatus" NOT NULL DEFAULT 'REQUESTED',

    CONSTRAINT "BloodBankExecutionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyBloodOverride" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "authorizedBy" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overrideType" TEXT NOT NULL DEFAULT 'UNCROSSMATCHED_O_NEGATIVE',
    "clinicalJustification" TEXT NOT NULL,

    CONSTRAINT "EmergencyBloodOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodUnit" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "isbt128DonationNumber" TEXT NOT NULL,
    "componentCode" TEXT NOT NULL,
    "componentType" "BloodComponentType" NOT NULL,
    "bloodGroupABO" TEXT NOT NULL,
    "bloodGroupRh" TEXT NOT NULL,
    "collectionDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "currentStatus" "BloodUnitStatus" NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "BloodUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crossmatch" (
    "id" TEXT NOT NULL,
    "executionItemId" TEXT NOT NULL,
    "bloodUnitId" TEXT NOT NULL,
    "status" "CrossmatchStatus" NOT NULL DEFAULT 'PENDING',
    "technicianId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3),
    "expiryAt" TIMESTAMP(3),

    CONSTRAINT "Crossmatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodAllocation" (
    "id" TEXT NOT NULL,
    "executionItemId" TEXT NOT NULL,
    "bloodUnitId" TEXT NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allocatedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BloodAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodIssue" (
    "id" TEXT NOT NULL,
    "executionItemId" TEXT NOT NULL,
    "bloodUnitId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issuedBy" TEXT NOT NULL,
    "issuedTo" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BloodIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BedsideVerification" (
    "id" TEXT NOT NULL,
    "transfusionEpisodeId" TEXT NOT NULL,
    "patientVerified" BOOLEAN NOT NULL DEFAULT false,
    "unitVerified" BOOLEAN NOT NULL DEFAULT false,
    "componentVerified" BOOLEAN NOT NULL DEFAULT false,
    "performedBy" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BedsideVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransfusionEpisode" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "TransfusionStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "stoppedAt" TIMESTAMP(3),
    "administeringNurseId" TEXT,

    CONSTRAINT "TransfusionEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransfusionObservation" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "observationTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "pulse" INTEGER,
    "bloodPressure" TEXT,
    "respiratoryRate" INTEGER,
    "oxygenSaturation" INTEGER,

    CONSTRAINT "TransfusionObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransfusionReaction" (
    "id" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "status" "TransfusionReactionStatus" NOT NULL DEFAULT 'RECORDED',
    "severity" "ReactionSeverity" NOT NULL,
    "suspectedCause" TEXT,
    "symptoms" TEXT NOT NULL,
    "investigationRequested" BOOLEAN NOT NULL DEFAULT false,
    "management" TEXT,
    "outcome" "TransfusionReactionOutcome",
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "resolutionTime" TIMESTAMP(3),

    CONSTRAINT "TransfusionReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodBankAudit" (
    "id" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,

    CONSTRAINT "BloodBankAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_executions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "referral_type" "ReferralType" NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ReferralPriority" NOT NULL DEFAULT 'ROUTINE',
    "clinical_summary" TEXT NOT NULL,
    "reason_for_referral" TEXT NOT NULL,
    "requesting_doctor_id" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "fhir_service_request_id" TEXT,
    "fhir_task_id" TEXT,

    CONSTRAINT "referral_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_execution_items" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'DRAFT',
    "specialty_code" TEXT,
    "department_code" TEXT,

    CONSTRAINT "referral_execution_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_recipients" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "recipient_id" TEXT,
    "recipient_name" TEXT NOT NULL,
    "recipient_hospital_id" TEXT,
    "recipient_specialty" TEXT,
    "fhir_practitioner_id" TEXT,
    "fhir_organization_id" TEXT,
    "fhir_endpoint_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "decline_reason" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_recipients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_communications" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "subject" TEXT,
    "body_hash" TEXT NOT NULL,
    "status" "CommunicationStatus" NOT NULL DEFAULT 'SENT',
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "acknowledged_at" TIMESTAMP(3),
    "is_reminder" BOOLEAN NOT NULL DEFAULT false,
    "is_escalation" BOOLEAN NOT NULL DEFAULT false,
    "sent_by" TEXT NOT NULL,

    CONSTRAINT "referral_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_appointments" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "scheduled_by" TEXT NOT NULL,
    "location_description" TEXT,
    "appointment_type" TEXT NOT NULL DEFAULT 'OUTPATIENT',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "confirmed_at" TIMESTAMP(3),
    "attended_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "referral_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_responses" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "responded_by" TEXT NOT NULL,
    "responded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decision" TEXT NOT NULL,
    "decline_reason" TEXT,
    "clinical_notes" TEXT,
    "is_advice_only" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "referral_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_transfers" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "from_doctor_id" TEXT NOT NULL,
    "to_doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "CareTransferStatus" NOT NULL DEFAULT 'REQUESTED',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requested_by" TEXT NOT NULL,
    "clinical_justification" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejection_reason" TEXT,
    "completed_at" TIMESTAMP(3),
    "relationship_id" TEXT,

    CONSTRAINT "care_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_outcome_reports" (
    "id" TEXT NOT NULL,
    "execution_item_id" TEXT NOT NULL,
    "outcome" "ReferralOutcome" NOT NULL,
    "reported_by" TEXT NOT NULL,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clinical_finding" TEXT,
    "recommendation_summary" TEXT,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_days" INTEGER,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "referral_outcome_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_audits" (
    "id" TEXT NOT NULL,
    "execution_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB NOT NULL,

    CONSTRAINT "referral_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'PLATFORM_ADMIN',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "networkId" TEXT,
    "permissions" JSONB DEFAULT '{}',

    CONSTRAINT "platform_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_sessions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "device_hash" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_tokens" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashed_token" TEXT NOT NULL,
    "scopes" TEXT[],
    "last_used_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "api_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_org_id" TEXT,
    "region" TEXT,
    "owner_admin_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_network_membership" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hospital_network_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_permissions" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB DEFAULT '{}',

    CONSTRAINT "platform_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flags" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutType" TEXT NOT NULL DEFAULT 'GLOBAL',
    "rollout_pct" INTEGER NOT NULL DEFAULT 0,
    "beta_hospital_ids" TEXT[],
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_flag_history" (
    "id" TEXT NOT NULL,
    "flag_id" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "prev" JSONB,
    "next" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feature_flag_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "price_monthly" DECIMAL(65,30) NOT NULL,
    "price_annual" DECIMAL(65,30) NOT NULL,
    "quota" JSONB NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_due" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "seats_used" INTEGER NOT NULL DEFAULT 0,
    "usage_meters" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_invoices" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_subscriptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hospital_id" TEXT,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "event_types" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "retry_policy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" TEXT NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "event_id" TEXT,
    "status_code" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "last_error" TEXT,
    "delivered_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GRANTED',
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "artifact_url" TEXT,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_export_requests" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "requested_by" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "filters" JSONB,
    "result_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "master_codes" (
    "id" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "parent_code" TEXT,
    "extra" JSONB,

    CONSTRAINT "master_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_entities" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ref_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "tenantScope" TEXT NOT NULL DEFAULT 'PLATFORM',
    "title" TEXT NOT NULL,
    "payload" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_timeline_events" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "previous_state" TEXT,
    "new_state" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_role" TEXT,
    "correlation_id" TEXT,
    "workflow_id" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_health_snapshots" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_score" INTEGER NOT NULL,
    "clinical_score" INTEGER NOT NULL,
    "infrastructure_score" INTEGER NOT NULL,
    "security_score" INTEGER NOT NULL,
    "compliance_score" INTEGER NOT NULL,
    "financial_score" INTEGER NOT NULL,
    "performance_score" INTEGER NOT NULL,

    CONSTRAINT "hospital_health_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_metrics" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "instance_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration_ms" INTEGER,
    "wait_time_ms" INTEGER,
    "execution_time_ms" INTEGER,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "sla_breached" BOOLEAN NOT NULL DEFAULT false,
    "manual_intervention" BOOLEAN NOT NULL DEFAULT false,
    "final_status" TEXT NOT NULL,

    CONSTRAINT "workflow_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DETECTED',
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "assigned_to" TEXT,
    "component" TEXT,
    "hospital_id" TEXT,
    "workflow_instance_id" TEXT,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_recommendations" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "network_id" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "action_url" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'LOW',
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capability_registry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "conflicts" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "defaultEnabled" BOOLEAN NOT NULL DEFAULT false,
    "requiresConfiguration" BOOLEAN NOT NULL DEFAULT false,
    "deprecated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capability_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_capabilities" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "capability_key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "grantedBy" TEXT NOT NULL,
    "referenceId" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "sourcePriority" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "last_evaluated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configuration_hash" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_capabilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_model_registry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "context_window" INTEGER NOT NULL,
    "max_tokens" INTEGER NOT NULL,
    "latency_ms_avg" INTEGER NOT NULL DEFAULT 0,
    "cost_per_1k" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "supports_vision" BOOLEAN NOT NULL DEFAULT false,
    "supports_json" BOOLEAN NOT NULL DEFAULT false,
    "supports_tools" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "fallback_model_id" TEXT,
    "evaluation_score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_model_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_prompt_registry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expected_schema" JSONB,
    "evaluation_score" DOUBLE PRECISION,
    "last_tested_at" TIMESTAMP(3),
    "rollback_version" TEXT,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "approved_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompt_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_policies" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "riskLevel" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "conditions" JSONB,
    "requires_human" BOOLEAN NOT NULL DEFAULT false,
    "region" TEXT,
    "tenantId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_action_logs" (
    "id" TEXT NOT NULL,
    "trace_id" TEXT NOT NULL,
    "incident_id" TEXT,
    "agent" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "prompt_id" TEXT NOT NULL,
    "prompt_version" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "output_hash" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "risk_level" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "policy_id" TEXT,
    "executionMode" TEXT NOT NULL DEFAULT 'RECOMMENDATION',
    "approved_by" TEXT,
    "executed" BOOLEAN NOT NULL DEFAULT false,
    "rollback_id" TEXT,
    "latency_ms" INTEGER NOT NULL,
    "token_usage" INTEGER NOT NULL,
    "cost_usd" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "human_outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_action_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semantic_entities" (
    "id" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "description" TEXT,
    "attributes" JSONB NOT NULL,
    "relationships" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semantic_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_definitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "semantic_query" JSONB NOT NULL,
    "sql_query" TEXT,
    "schedule" TEXT,
    "created_by" TEXT NOT NULL,
    "audience_role" TEXT NOT NULL DEFAULT 'PLATFORM_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_execution_logs" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "latency_ms" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "error_message" TEXT,
    "result_row_cnt" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "report_execution_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_registry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT,
    "calculation" TEXT NOT NULL,
    "refreshFrequency" TEXT NOT NULL,
    "source_tables" TEXT[],
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictive_models" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "feature_set" JSONB,
    "evaluation" JSONB,
    "accuracy" DOUBLE PRECISION,
    "last_trained_at" TIMESTAMP(3),
    "deployed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictive_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_insights" (
    "id" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "model_version" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "insight" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL,
    "severity" TEXT NOT NULL,
    "recommendation_type" TEXT,
    "recommendation" TEXT,
    "expires_at" TIMESTAMP(3),
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_nodes" (
    "id" TEXT NOT NULL,
    "node_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "embedding_id" TEXT,
    "last_synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kg_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kg_edges" (
    "id" TEXT NOT NULL,
    "source_node_id" TEXT NOT NULL,
    "target_node_id" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'DIRECTED',
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "derived_from" TEXT,
    "last_validated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kg_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "action_type" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cooldown_hours" INTEGER NOT NULL DEFAULT 24,
    "owner" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "rollback_version" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_execution_plans" (
    "id" TEXT NOT NULL,
    "prediction_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "proposed_action" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_execution_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copilot_sessions" (
    "id" TEXT NOT NULL,
    "agent_type" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "context_snapshot" JSONB,
    "conversation_summary" TEXT,
    "tool_calls" JSONB,
    "citations" JSONB,
    "token_usage" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "copilot_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "approval_strategy" TEXT NOT NULL,
    "required_roles" TEXT[],
    "timeout_hours" INTEGER NOT NULL DEFAULT 24,
    "onTimeout" TEXT NOT NULL DEFAULT 'REJECT',
    "escalation_roles" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_requests" (
    "id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "required_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_responses" (
    "id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_artifacts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "source" TEXT NOT NULL DEFAULT 'HUMAN',
    "content_ast" JSONB NOT NULL,
    "dependencies" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounters" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "doctor_id" TEXT,
    "department_id" TEXT,
    "location_id" TEXT,
    "encounter_type" "EncounterType" NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'ACTIVE',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_summaries" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generated_by" TEXT,
    "summary_markdown" TEXT NOT NULL,
    "summary_json" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "encounter_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_orders" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "doctor_id" TEXT,
    "department_id" TEXT,
    "type" "ClinicalOrderType" NOT NULL,
    "status" "ClinicalOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "priority" "OrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "reason" TEXT,
    "payload" JSONB,
    "result_reference_id" TEXT,
    "requested_by" TEXT,
    "assigned_to" TEXT,
    "performed_by" TEXT,
    "verified_by" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "clinical_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_tasks" (
    "id" TEXT NOT NULL,
    "encounter_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ClinicalTaskStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by" TEXT,
    "performed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "clinical_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" TEXT NOT NULL,
    "clinical_order_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "sample_type" "SampleType" NOT NULL,
    "status" "SampleStatus" NOT NULL DEFAULT 'COLLECTION_PENDING',
    "barcode" TEXT,
    "collected_by" TEXT,
    "collected_at" TIMESTAMP(3),
    "accessioned_by" TEXT,
    "accessioned_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL,
    "clinical_order_id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" "LabResultStatus" NOT NULL DEFAULT 'DRAFT',
    "template_id" TEXT,
    "entered_by" TEXT,
    "entered_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "verified_at" TIMESTAMP(3),
    "amended_by" TEXT,
    "amended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_result_values" (
    "id" TEXT NOT NULL,
    "lab_result_id" TEXT NOT NULL,
    "parameter_id" TEXT,
    "parameter_name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "reference_range" TEXT,
    "flag" TEXT,
    "is_critical" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lab_result_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_templates" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "test_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_template_parameters" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,
    "normal_min" DOUBLE PRECISION,
    "normal_max" DOUBLE PRECISION,
    "critical_min" DOUBLE PRECISION,
    "critical_max" DOUBLE PRECISION,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "decimal_places" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "test_template_parameters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_accounts" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "credit_limit" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "payer_type" TEXT NOT NULL DEFAULT 'SELF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "charge_items" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "billing_account_id" TEXT,
    "source_event" "BillingSourceEvent" NOT NULL,
    "category" "ChargeCategory" NOT NULL DEFAULT 'MISC',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "tax_rate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "catalog_id" TEXT,
    "catalog_version" TEXT,
    "source_event_id" TEXT,
    "source_aggregate_id" TEXT,
    "source_aggregate_type" "SourceAggregateType",
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "gross_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'UNBILLED',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,

    CONSTRAINT "charge_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "intent_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "allocated_amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "gateway_name" TEXT,
    "gateway_payment_id" TEXT,
    "gateway_order_id" TEXT,
    "gateway_signature" TEXT,
    "gateway_transaction_id" TEXT,
    "gateway_payload" JSONB,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_audit" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "patient_id" TEXT,
    "action" "BillingAuditAction" NOT NULL,
    "performed_by" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_intents" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" "PaymentMethod",
    "gateway_id" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_failure_reason" TEXT,
    "expires_at" TIMESTAMP(3),
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditNote" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adjustment" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "allocated_amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "allocation_number" TEXT NOT NULL,
    "allocation_type" TEXT NOT NULL DEFAULT 'PAYMENT',
    "created_by" TEXT NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AllocationStatus" NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB DEFAULT '{}',
    "idempotency_key" TEXT NOT NULL,
    "receipt_line_id" TEXT,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptSequence" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "current_value" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptTemplate" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "header_text" TEXT,
    "footer_text" TEXT,
    "terms_and_conditions" TEXT,
    "logo_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "total_amount" DECIMAL(65,30) NOT NULL,
    "status" "ReceiptStatus" NOT NULL DEFAULT 'ISSUED',
    "snapshot" JSONB NOT NULL,
    "void_reason" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "authMethodId" TEXT,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptLine" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "allocation_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReconciliation" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentReconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "refund_number" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 1,
    "gateway_refund_id" TEXT,
    "gateway_payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "patient_addresses_patient_id_idx" ON "patient_addresses"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_patient_id_key" ON "wallets"("patient_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");

-- CreateIndex
CREATE INDEX "patient_prescriptions_patient_id_idx" ON "patient_prescriptions"("patient_id");

-- CreateIndex
CREATE INDEX "patient_prescriptions_patient_id_created_at_idx" ON "patient_prescriptions"("patient_id", "created_at");

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
CREATE UNIQUE INDEX "appointment_payments_appointment_id_key" ON "appointment_payments"("appointment_id");

-- CreateIndex
CREATE INDEX "appointment_payments_appointment_id_idx" ON "appointment_payments"("appointment_id");

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
CREATE INDEX "diagnostic_orders_order_status_idx" ON "diagnostic_orders"("order_status");

-- CreateIndex
CREATE INDEX "diagnostic_orders_hospital_id_patient_id_idx" ON "diagnostic_orders"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "diagnostic_orders_hospital_id_order_status_idx" ON "diagnostic_orders"("hospital_id", "order_status");

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
CREATE UNIQUE INDEX "otp_codes_tenant_id_phone_purpose_key" ON "otp_codes"("tenant_id", "phone", "purpose");

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
CREATE INDEX "outbox_events_correlation_id_idx" ON "outbox_events"("correlation_id");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_id_idx" ON "outbox_events"("aggregate_id");

-- CreateIndex
CREATE INDEX "outbox_events_delivery_status_idx" ON "outbox_events"("delivery_status");

-- CreateIndex
CREATE INDEX "event_logs_hospital_id_event_type_created_at_idx" ON "event_logs"("hospital_id", "event_type", "created_at");

-- CreateIndex
CREATE INDEX "event_logs_encounter_id_created_at_idx" ON "event_logs"("encounter_id", "created_at");

-- CreateIndex
CREATE INDEX "event_logs_patient_id_created_at_idx" ON "event_logs"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "event_logs_hospital_id_created_at_idx" ON "event_logs"("hospital_id", "created_at");

-- CreateIndex
CREATE INDEX "event_logs_event_type_created_at_idx" ON "event_logs"("event_type", "created_at");

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
CREATE UNIQUE INDEX "physical_departure_records_admission_id_key" ON "physical_departure_records"("admission_id");

-- CreateIndex
CREATE INDEX "physical_departure_records_pathway_idx" ON "physical_departure_records"("pathway");

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
CREATE INDEX "invoices_hospital_id_patient_id_idx" ON "invoices"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_hospital_id_invoice_number_key" ON "invoices"("hospital_id", "invoice_number");

-- CreateIndex
CREATE INDEX "invoice_line_items_invoice_id_idx" ON "invoice_line_items"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_service_id_idx" ON "invoice_line_items"("service_id");

-- CreateIndex
CREATE INDEX "invoice_line_items_charge_item_id_idx" ON "invoice_line_items"("charge_item_id");

-- CreateIndex
CREATE INDEX "invoice_payments_hospital_id_idx" ON "invoice_payments"("hospital_id");

-- CreateIndex
CREATE INDEX "invoice_payments_invoice_id_idx" ON "invoice_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "invoice_payments_hospital_id_status_idx" ON "invoice_payments"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "invoice_payments_hospital_id_paid_at_idx" ON "invoice_payments"("hospital_id", "paid_at");

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
CREATE INDEX "pharmacy_dispenses_prescription_id_idx" ON "pharmacy_dispenses"("prescription_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispenses_hospital_id_patient_id_idx" ON "pharmacy_dispenses"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "pharmacy_dispenses_hospital_id_status_idx" ON "pharmacy_dispenses"("hospital_id", "status");

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
CREATE INDEX "bills_hospital_id_status_idx" ON "bills"("hospital_id", "status");

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
CREATE INDEX "lab_orders_hospital_id_patient_id_status_idx" ON "lab_orders"("hospital_id", "patient_id", "status");

-- CreateIndex
CREATE INDEX "lab_orders_hospital_id_status_idx" ON "lab_orders"("hospital_id", "status");

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

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_patient_id_key" ON "user_accounts"("patient_id");

-- CreateIndex
CREATE INDEX "patient_contact_points_type_value_lookup_hash_idx" ON "patient_contact_points"("type", "value_lookup_hash");

-- CreateIndex
CREATE UNIQUE INDEX "auth_methods_user_account_id_contact_point_id_type_key" ON "auth_methods"("user_account_id", "contact_point_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "auth_methods_type_claim_key_key" ON "auth_methods"("type", "claim_key");

-- CreateIndex
CREATE INDEX "mobile_verification_challenges_mobile_lookup_hash_status_idx" ON "mobile_verification_challenges"("mobile_lookup_hash", "status");

-- CreateIndex
CREATE UNIQUE INDEX "patient_aliases_alias_patient_id_key" ON "patient_aliases"("alias_patient_id");

-- CreateIndex
CREATE INDEX "doctor_patient_relationships_patient_id_doctor_id_status_idx" ON "doctor_patient_relationships"("patient_id", "doctor_id", "status");

-- CreateIndex
CREATE INDEX "doctor_patient_relationships_episode_id_idx" ON "doctor_patient_relationships"("episode_id");

-- CreateIndex
CREATE INDEX "care_responsibilities_patient_id_episode_id_idx" ON "care_responsibilities"("patient_id", "episode_id");

-- CreateIndex
CREATE INDEX "analytics_admission_projections_hospital_id_idx" ON "analytics_admission_projections"("hospital_id");

-- CreateIndex
CREATE INDEX "clinical_order_catalogs_hospital_id_type_idx" ON "clinical_order_catalogs"("hospital_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_order_catalogs_hospital_id_type_code_key" ON "clinical_order_catalogs"("hospital_id", "type", "code");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_order_catalog_versions_catalog_id_version_number_key" ON "clinical_order_catalog_versions"("catalog_id", "version_number");

-- CreateIndex
CREATE INDEX "order_groups_hospital_id_patient_id_idx" ON "order_groups"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_active_version_id_key" ON "orders"("active_version_id");

-- CreateIndex
CREATE INDEX "orders_hospital_id_patient_id_idx" ON "orders"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "orders_ordered_by_idx" ON "orders"("ordered_by");

-- CreateIndex
CREATE UNIQUE INDEX "order_versions_order_id_version_number_key" ON "order_versions"("order_id", "version_number");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_department_id_idx" ON "order_items"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_dependencies_source_item_id_target_item_id_key" ON "order_dependencies"("source_item_id", "target_item_id");

-- CreateIndex
CREATE INDEX "order_executions_order_id_idx" ON "order_executions"("order_id");

-- CreateIndex
CREATE INDEX "order_executions_department_id_idx" ON "order_executions"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_cancellations_order_id_key" ON "order_cancellations"("order_id");

-- CreateIndex
CREATE INDEX "order_audits_order_id_idx" ON "order_audits"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_executions_clinical_order_id_key" ON "pharmacy_executions"("clinical_order_id");

-- CreateIndex
CREATE INDEX "pharmacy_executions_hospital_id_patient_id_idx" ON "pharmacy_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "pharmacy_execution_items_order_item_id_key" ON "pharmacy_execution_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_hospital_id_catalog_version_id_key" ON "inventory_items"("hospital_id", "catalog_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_batches_inventory_item_id_batch_number_key" ON "inventory_batches"("inventory_item_id", "batch_number");

-- CreateIndex
CREATE INDEX "inventory_transactions_batch_id_idx" ON "inventory_transactions"("batch_id");

-- CreateIndex
CREATE INDEX "inventory_transactions_occurred_at_idx" ON "inventory_transactions"("occurred_at");

-- CreateIndex
CREATE INDEX "medication_administration_attempts_hospital_id_patient_id_idx" ON "medication_administration_attempts"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "medication_administration_attempts_order_item_id_idx" ON "medication_administration_attempts"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_executions_clinical_order_id_key" ON "laboratory_executions"("clinical_order_id");

-- CreateIndex
CREATE INDEX "laboratory_executions_hospital_id_patient_id_idx" ON "laboratory_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "laboratory_executions_status_idx" ON "laboratory_executions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_execution_items_order_item_id_key" ON "laboratory_execution_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "specimens_barcode_key" ON "specimens"("barcode");

-- CreateIndex
CREATE INDEX "specimens_hospital_id_patient_id_idx" ON "specimens"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "analyzer_queues_analyzer_id_priority_idx" ON "analyzer_queues"("analyzer_id", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_results_execution_item_id_key" ON "laboratory_results"("execution_item_id");

-- CreateIndex
CREATE INDEX "laboratory_results_hospital_id_patient_id_idx" ON "laboratory_results"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "laboratory_result_versions_result_id_version_number_key" ON "laboratory_result_versions"("result_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_executions_clinical_order_id_key" ON "radiology_executions"("clinical_order_id");

-- CreateIndex
CREATE INDEX "radiology_executions_hospital_id_patient_id_idx" ON "radiology_executions"("hospital_id", "patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_execution_items_order_item_id_key" ON "radiology_execution_items"("order_item_id");

-- CreateIndex
CREATE INDEX "radiology_execution_items_execution_id_idx" ON "radiology_execution_items"("execution_id");

-- CreateIndex
CREATE INDEX "radiology_appointments_modality_id_start_time_end_time_idx" ON "radiology_appointments"("modality_id", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "radiology_acquisition_sessions_execution_id_idx" ON "radiology_acquisition_sessions"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_study_instance_uid_key" ON "imaging_studies"("study_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_studies_accession_number_key" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE INDEX "imaging_studies_clinical_order_id_idx" ON "imaging_studies"("clinical_order_id");

-- CreateIndex
CREATE INDEX "imaging_studies_encounter_id_idx" ON "imaging_studies"("encounter_id");

-- CreateIndex
CREATE INDEX "imaging_studies_patient_id_created_at_idx" ON "imaging_studies"("patient_id", "created_at");

-- CreateIndex
CREATE INDEX "imaging_studies_hospital_id_status_idx" ON "imaging_studies"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "imaging_studies_accession_number_idx" ON "imaging_studies"("accession_number");

-- CreateIndex
CREATE INDEX "imaging_studies_study_instance_uid_idx" ON "imaging_studies"("study_instance_uid");

-- CreateIndex
CREATE INDEX "imaging_studies_modality_status_idx" ON "imaging_studies"("modality", "status");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_series_series_instance_uid_key" ON "imaging_series"("series_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "imaging_instances_sop_instance_uid_key" ON "imaging_instances"("sop_instance_uid");

-- CreateIndex
CREATE UNIQUE INDEX "contrast_administrations_execution_item_id_key" ON "contrast_administrations"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_execution_item_id_key" ON "radiology_reports"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_reports_active_version_id_key" ON "radiology_reports"("active_version_id");

-- CreateIndex
CREATE INDEX "radiology_reports_execution_item_id_idx" ON "radiology_reports"("execution_item_id");

-- CreateIndex
CREATE INDEX "radiology_reports_study_id_idx" ON "radiology_reports"("study_id");

-- CreateIndex
CREATE UNIQUE INDEX "radiology_report_versions_report_id_version_number_key" ON "radiology_report_versions"("report_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_execution_order_id_key" ON "procedure_execution"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_execution_item_order_item_id_key" ON "procedure_execution_item"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_appointment_execution_id_key" ON "procedure_appointment"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_session_execution_id_key" ON "procedure_session"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_checklist_session_id_key" ON "procedure_checklist"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "anesthesia_episode_session_id_key" ON "anesthesia_episode"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_report_execution_id_key" ON "procedure_report"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_report_active_version_id_key" ON "procedure_report"("active_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "procedure_report_version_report_id_version_number_key" ON "procedure_report_version"("report_id", "version_number");

-- CreateIndex
CREATE UNIQUE INDEX "HospitalBloodBankPolicy_hospitalId_componentType_key" ON "HospitalBloodBankPolicy"("hospitalId", "componentType");

-- CreateIndex
CREATE UNIQUE INDEX "BloodBankExecution_orderId_key" ON "BloodBankExecution"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodBankExecutionItem_orderItemId_key" ON "BloodBankExecutionItem"("orderItemId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodUnit_isbt128DonationNumber_key" ON "BloodUnit"("isbt128DonationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Crossmatch_executionItemId_bloodUnitId_key" ON "Crossmatch"("executionItemId", "bloodUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodAllocation_executionItemId_bloodUnitId_key" ON "BloodAllocation"("executionItemId", "bloodUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "BloodIssue_executionItemId_bloodUnitId_key" ON "BloodIssue"("executionItemId", "bloodUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "BedsideVerification_transfusionEpisodeId_key" ON "BedsideVerification"("transfusionEpisodeId");

-- CreateIndex
CREATE UNIQUE INDEX "TransfusionEpisode_issueId_key" ON "TransfusionEpisode"("issueId");

-- CreateIndex
CREATE UNIQUE INDEX "TransfusionReaction_episodeId_key" ON "TransfusionReaction"("episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "referral_executions_order_id_key" ON "referral_executions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_execution_items_order_item_id_key" ON "referral_execution_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_transfers_execution_id_key" ON "care_transfers"("execution_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_outcome_reports_execution_item_id_key" ON "referral_outcome_reports"("execution_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_admins_email_key" ON "platform_admins"("email");

-- CreateIndex
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_network_membership_hospital_id_network_id_key" ON "hospital_network_membership"("hospital_id", "network_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_permissions_admin_id_scope_resource_action_key" ON "platform_permissions"("admin_id", "scope", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "feature_flags_key_key" ON "feature_flags"("key");

-- CreateIndex
CREATE UNIQUE INDEX "plans_code_key" ON "plans"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_hospital_id_key" ON "subscriptions"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_invoices_number_key" ON "platform_invoices"("number");

-- CreateIndex
CREATE INDEX "consent_records_hospital_id_patient_id_idx" ON "consent_records"("hospital_id", "patient_id");

-- CreateIndex
CREATE INDEX "master_codes_system_idx" ON "master_codes"("system");

-- CreateIndex
CREATE UNIQUE INDEX "master_codes_system_code_key" ON "master_codes"("system", "code");

-- CreateIndex
CREATE INDEX "search_entities_kind_hospital_id_idx" ON "search_entities"("kind", "hospital_id");

-- CreateIndex
CREATE INDEX "search_entities_title_idx" ON "search_entities"("title");

-- CreateIndex
CREATE INDEX "platform_timeline_events_entity_type_entity_id_created_at_idx" ON "platform_timeline_events"("entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "platform_timeline_events_correlation_id_idx" ON "platform_timeline_events"("correlation_id");

-- CreateIndex
CREATE INDEX "hospital_health_snapshots_hospital_id_timestamp_idx" ON "hospital_health_snapshots"("hospital_id", "timestamp");

-- CreateIndex
CREATE INDEX "workflow_metrics_workflow_id_entity_id_idx" ON "workflow_metrics"("workflow_id", "entity_id");

-- CreateIndex
CREATE INDEX "workflow_metrics_completed_at_idx" ON "workflow_metrics"("completed_at");

-- CreateIndex
CREATE INDEX "incidents_status_detected_at_idx" ON "incidents"("status", "detected_at");

-- CreateIndex
CREATE INDEX "platform_recommendations_hospital_id_is_dismissed_idx" ON "platform_recommendations"("hospital_id", "is_dismissed");

-- CreateIndex
CREATE UNIQUE INDEX "capability_registry_key_key" ON "capability_registry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_capabilities_hospital_id_capability_key_key" ON "hospital_capabilities"("hospital_id", "capability_key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_model_registry_key_key" ON "ai_model_registry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_prompt_registry_key_key" ON "ai_prompt_registry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_policies_key_key" ON "ai_policies"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_action_logs_trace_id_key" ON "ai_action_logs"("trace_id");

-- CreateIndex
CREATE INDEX "ai_action_logs_trace_id_idx" ON "ai_action_logs"("trace_id");

-- CreateIndex
CREATE INDEX "ai_action_logs_incident_id_idx" ON "ai_action_logs"("incident_id");

-- CreateIndex
CREATE INDEX "ai_action_logs_risk_level_executionMode_idx" ON "ai_action_logs"("risk_level", "executionMode");

-- CreateIndex
CREATE UNIQUE INDEX "semantic_entities_entityName_key" ON "semantic_entities"("entityName");

-- CreateIndex
CREATE INDEX "report_execution_logs_report_id_idx" ON "report_execution_logs"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_registry_key_key" ON "feature_registry"("key");

-- CreateIndex
CREATE UNIQUE INDEX "predictive_models_name_version_key" ON "predictive_models"("name", "version");

-- CreateIndex
CREATE INDEX "prediction_insights_entityType_entity_id_idx" ON "prediction_insights"("entityType", "entity_id");

-- CreateIndex
CREATE INDEX "prediction_insights_expires_at_idx" ON "prediction_insights"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "kg_nodes_node_type_reference_id_key" ON "kg_nodes"("node_type", "reference_id");

-- CreateIndex
CREATE INDEX "kg_edges_source_node_id_idx" ON "kg_edges"("source_node_id");

-- CreateIndex
CREATE INDEX "kg_edges_target_node_id_idx" ON "kg_edges"("target_node_id");

-- CreateIndex
CREATE UNIQUE INDEX "kg_edges_source_node_id_target_node_id_relation_key" ON "kg_edges"("source_node_id", "target_node_id", "relation");

-- CreateIndex
CREATE INDEX "encounters_patient_id_idx" ON "encounters"("patient_id");

-- CreateIndex
CREATE INDEX "encounters_patient_id_status_idx" ON "encounters"("patient_id", "status");

-- CreateIndex
CREATE INDEX "encounters_hospital_id_idx" ON "encounters"("hospital_id");

-- CreateIndex
CREATE INDEX "encounters_hospital_id_status_idx" ON "encounters"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "encounters_appointment_id_idx" ON "encounters"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "encounter_summaries_encounter_id_key" ON "encounter_summaries"("encounter_id");

-- CreateIndex
CREATE INDEX "clinical_orders_encounter_id_idx" ON "clinical_orders"("encounter_id");

-- CreateIndex
CREATE INDEX "clinical_orders_encounter_id_status_idx" ON "clinical_orders"("encounter_id", "status");

-- CreateIndex
CREATE INDEX "clinical_orders_patient_id_idx" ON "clinical_orders"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_orders_patient_id_status_idx" ON "clinical_orders"("patient_id", "status");

-- CreateIndex
CREATE INDEX "clinical_orders_hospital_id_idx" ON "clinical_orders"("hospital_id");

-- CreateIndex
CREATE INDEX "clinical_orders_hospital_id_status_idx" ON "clinical_orders"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "clinical_orders_type_status_idx" ON "clinical_orders"("type", "status");

-- CreateIndex
CREATE INDEX "clinical_orders_priority_status_idx" ON "clinical_orders"("priority", "status");

-- CreateIndex
CREATE INDEX "clinical_orders_status_idx" ON "clinical_orders"("status");

-- CreateIndex
CREATE INDEX "clinical_tasks_encounter_id_idx" ON "clinical_tasks"("encounter_id");

-- CreateIndex
CREATE INDEX "clinical_tasks_patient_id_idx" ON "clinical_tasks"("patient_id");

-- CreateIndex
CREATE INDEX "clinical_tasks_hospital_id_idx" ON "clinical_tasks"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "samples_barcode_key" ON "samples"("barcode");

-- CreateIndex
CREATE INDEX "samples_clinical_order_id_idx" ON "samples"("clinical_order_id");

-- CreateIndex
CREATE INDEX "samples_barcode_idx" ON "samples"("barcode");

-- CreateIndex
CREATE INDEX "samples_hospital_id_status_idx" ON "samples"("hospital_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "lab_results_clinical_order_id_key" ON "lab_results"("clinical_order_id");

-- CreateIndex
CREATE INDEX "lab_results_hospital_id_status_idx" ON "lab_results"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "lab_results_patient_id_idx" ON "lab_results"("patient_id");

-- CreateIndex
CREATE INDEX "lab_result_values_lab_result_id_idx" ON "lab_result_values"("lab_result_id");

-- CreateIndex
CREATE INDEX "lab_result_values_parameter_id_idx" ON "lab_result_values"("parameter_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_templates_hospital_id_code_key" ON "test_templates"("hospital_id", "code");

-- CreateIndex
CREATE INDEX "test_template_parameters_template_id_idx" ON "test_template_parameters"("template_id");

-- CreateIndex
CREATE INDEX "billing_accounts_patient_id_idx" ON "billing_accounts"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "charge_items_idempotency_key_key" ON "charge_items"("idempotency_key");

-- CreateIndex
CREATE INDEX "charge_items_hospital_id_status_idx" ON "charge_items"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "charge_items_patient_id_idx" ON "charge_items"("patient_id");

-- CreateIndex
CREATE INDEX "payments_hospital_id_status_idx" ON "payments"("hospital_id", "status");

-- CreateIndex
CREATE INDEX "payments_intent_id_idx" ON "payments"("intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_hospital_id_gateway_transaction_id_key" ON "payments"("hospital_id", "gateway_transaction_id");

-- CreateIndex
CREATE INDEX "billing_audit_hospital_id_invoice_id_idx" ON "billing_audit"("hospital_id", "invoice_id");

-- CreateIndex
CREATE INDEX "payment_intents_hospital_id_invoice_id_idx" ON "payment_intents"("hospital_id", "invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_intents_hospital_id_idempotency_key_key" ON "payment_intents"("hospital_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "payment_allocations_hospital_id_idx" ON "payment_allocations"("hospital_id");

-- CreateIndex
CREATE INDEX "payment_allocations_invoice_id_idx" ON "payment_allocations"("invoice_id");

-- CreateIndex
CREATE INDEX "payment_allocations_payment_id_idx" ON "payment_allocations"("payment_id");

-- CreateIndex
CREATE INDEX "payment_allocations_allocated_at_idx" ON "payment_allocations"("allocated_at");

-- CreateIndex
CREATE UNIQUE INDEX "payment_allocations_hospital_id_idempotency_key_key" ON "payment_allocations"("hospital_id", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptSequence_hospital_id_key" ON "ReceiptSequence"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptTemplate_hospital_id_key" ON "ReceiptTemplate"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_hospital_id_receipt_number_key" ON "Receipt"("hospital_id", "receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptLine_allocation_id_key" ON "ReceiptLine"("allocation_id");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_refund_number_key" ON "refunds"("refund_number");

-- CreateIndex
CREATE INDEX "refunds_hospital_id_idx" ON "refunds"("hospital_id");

-- CreateIndex
CREATE INDEX "refunds_patient_id_idx" ON "refunds"("patient_id");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

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
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_prescriptions" ADD CONSTRAINT "patient_prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "patient_prescriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_payments" ADD CONSTRAINT "appointment_payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "visit_notes" ADD CONSTRAINT "visit_notes_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "clinical_observations" ADD CONSTRAINT "clinical_observations_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_records" ADD CONSTRAINT "patient_records_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_records" ADD CONSTRAINT "vital_records_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "referral_slips" ADD CONSTRAINT "referral_slips_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partograph_records" ADD CONSTRAINT "partograph_records_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "near_miss_audits" ADD CONSTRAINT "near_miss_audits_pregnancy_id_fkey" FOREIGN KEY ("pregnancy_id") REFERENCES "pregnancy_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_alerts" ADD CONSTRAINT "escalation_alerts_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_alerts" ADD CONSTRAINT "escalation_alerts_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lama_episodes" ADD CONSTRAINT "lama_episodes_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absence_episodes" ADD CONSTRAINT "absence_episodes_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_departure_records" ADD CONSTRAINT "physical_departure_records_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "admissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_attending_doctor_id_fkey" FOREIGN KEY ("attending_doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_charge_item_id_fkey" FOREIGN KEY ("charge_item_id") REFERENCES "charge_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_payments" ADD CONSTRAINT "invoice_payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "patient_prescriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispenses" ADD CONSTRAINT "pharmacy_dispenses_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_items" ADD CONSTRAINT "pharmacy_dispense_items_dispense_id_fkey" FOREIGN KEY ("dispense_id") REFERENCES "pharmacy_dispenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_dispense_items" ADD CONSTRAINT "pharmacy_dispense_items_drug_stock_id_fkey" FOREIGN KEY ("drug_stock_id") REFERENCES "drug_stocks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_stocks" ADD CONSTRAINT "drug_stocks_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_stocks" ADD CONSTRAINT "drug_stocks_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "journey_instances" ADD CONSTRAINT "journey_instances_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "journey_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_milestones" ADD CONSTRAINT "journey_milestones_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_tasks" ADD CONSTRAINT "journey_tasks_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_tasks" ADD CONSTRAINT "journey_tasks_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "journey_milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey_risks" ADD CONSTRAINT "journey_risks_journey_id_fkey" FOREIGN KEY ("journey_id") REFERENCES "journey_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_methods" ADD CONSTRAINT "auth_methods_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_methods" ADD CONSTRAINT "auth_methods_contact_point_id_fkey" FOREIGN KEY ("contact_point_id") REFERENCES "patient_contact_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_order_catalog_versions" ADD CONSTRAINT "clinical_order_catalog_versions_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "clinical_order_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "order_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "order_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_versions" ADD CONSTRAINT "order_versions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dependencies" ADD CONSTRAINT "order_dependencies_source_item_id_fkey" FOREIGN KEY ("source_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_dependencies" ADD CONSTRAINT "order_dependencies_target_item_id_fkey" FOREIGN KEY ("target_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_executions" ADD CONSTRAINT "order_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_cancellations" ADD CONSTRAINT "order_cancellations_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_audits" ADD CONSTRAINT "order_audits_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_executions" ADD CONSTRAINT "pharmacy_executions_clinical_order_id_fkey" FOREIGN KEY ("clinical_order_id") REFERENCES "clinical_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_verifications" ADD CONSTRAINT "pharmacy_verifications_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_items" ADD CONSTRAINT "pharmacy_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_items" ADD CONSTRAINT "pharmacy_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_substitutions" ADD CONSTRAINT "pharmacy_substitutions_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_substitutions" ADD CONSTRAINT "pharmacy_substitutions_substituted_catalog_version_id_fkey" FOREIGN KEY ("substituted_catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_inventory_item_id_fkey" FOREIGN KEY ("inventory_item_id") REFERENCES "inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "inventory_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispenses" ADD CONSTRAINT "pharmacy_execution_dispenses_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "pharmacy_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_dispense_id_fkey" FOREIGN KEY ("dispense_id") REFERENCES "pharmacy_execution_dispenses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "pharmacy_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pharmacy_execution_dispense_items" ADD CONSTRAINT "pharmacy_execution_dispense_items_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "stock_reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administration_attempts" ADD CONSTRAINT "medication_administration_attempts_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_administration_attempts" ADD CONSTRAINT "medication_administration_attempts_dispense_item_id_fkey" FOREIGN KEY ("dispense_item_id") REFERENCES "pharmacy_execution_dispense_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_executions" ADD CONSTRAINT "laboratory_executions_clinical_order_id_fkey" FOREIGN KEY ("clinical_order_id") REFERENCES "clinical_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "laboratory_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_specimen_id_fkey" FOREIGN KEY ("specimen_id") REFERENCES "specimens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_execution_items" ADD CONSTRAINT "laboratory_execution_items_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "laboratory_results"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specimen_collection_attempts" ADD CONSTRAINT "specimen_collection_attempts_specimen_id_fkey" FOREIGN KEY ("specimen_id") REFERENCES "specimens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyzer_queues" ADD CONSTRAINT "analyzer_queues_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "laboratory_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyzer_queues" ADD CONSTRAINT "analyzer_queues_analyzer_id_fkey" FOREIGN KEY ("analyzer_id") REFERENCES "analyzer_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laboratory_result_versions" ADD CONSTRAINT "laboratory_result_versions_result_id_fkey" FOREIGN KEY ("result_id") REFERENCES "laboratory_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "critical_value_notifications" ADD CONSTRAINT "critical_value_notifications_result_version_id_fkey" FOREIGN KEY ("result_version_id") REFERENCES "laboratory_result_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_executions" ADD CONSTRAINT "radiology_executions_clinical_order_id_fkey" FOREIGN KEY ("clinical_order_id") REFERENCES "clinical_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_executions" ADD CONSTRAINT "radiology_executions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "radiology_appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_execution_items" ADD CONSTRAINT "radiology_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "radiology_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_execution_items" ADD CONSTRAINT "radiology_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_appointments" ADD CONSTRAINT "radiology_appointments_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modality_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_acquisition_sessions" ADD CONSTRAINT "radiology_acquisition_sessions_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "radiology_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_acquisition_sessions" ADD CONSTRAINT "radiology_acquisition_sessions_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modality_devices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "radiology_acquisition_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_clinical_order_id_fkey" FOREIGN KEY ("clinical_order_id") REFERENCES "clinical_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_studies" ADD CONSTRAINT "imaging_studies_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_series" ADD CONSTRAINT "imaging_series_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imaging_instances" ADD CONSTRAINT "imaging_instances_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "imaging_series"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrast_administrations" ADD CONSTRAINT "contrast_administrations_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "radiology_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "radiology_execution_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "imaging_studies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_reports" ADD CONSTRAINT "radiology_reports_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "radiology_report_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_report_versions" ADD CONSTRAINT "radiology_report_versions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "radiology_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "radiology_critical_findings" ADD CONSTRAINT "radiology_critical_findings_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "radiology_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_execution" ADD CONSTRAINT "procedure_execution_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_execution" ADD CONSTRAINT "procedure_execution_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_execution_item" ADD CONSTRAINT "procedure_execution_item_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "procedure_execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_execution_item" ADD CONSTRAINT "procedure_execution_item_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_execution_item" ADD CONSTRAINT "procedure_execution_item_catalog_version_id_fkey" FOREIGN KEY ("catalog_version_id") REFERENCES "clinical_order_catalog_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_appointment" ADD CONSTRAINT "procedure_appointment_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "procedure_execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_appointment" ADD CONSTRAINT "procedure_appointment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "procedure_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_room" ADD CONSTRAINT "procedure_room_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_session" ADD CONSTRAINT "procedure_session_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "procedure_execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_session" ADD CONSTRAINT "procedure_session_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "procedure_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_checklist" ADD CONSTRAINT "procedure_checklist_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "procedure_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anesthesia_episode" ADD CONSTRAINT "anesthesia_episode_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "procedure_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "implant_usage" ADD CONSTRAINT "implant_usage_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "procedure_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_report" ADD CONSTRAINT "procedure_report_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "procedure_execution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_report" ADD CONSTRAINT "procedure_report_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "procedure_report_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_report_version" ADD CONSTRAINT "procedure_report_version_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "procedure_report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_critical_incident" ADD CONSTRAINT "procedure_critical_incident_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "procedure_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalBloodBankPolicy" ADD CONSTRAINT "HospitalBloodBankPolicy_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodBankExecution" ADD CONSTRAINT "BloodBankExecution_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodBankExecution" ADD CONSTRAINT "BloodBankExecution_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodBankExecutionItem" ADD CONSTRAINT "BloodBankExecutionItem_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "BloodBankExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodBankExecutionItem" ADD CONSTRAINT "BloodBankExecutionItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyBloodOverride" ADD CONSTRAINT "EmergencyBloodOverride_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "BloodBankExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodUnit" ADD CONSTRAINT "BloodUnit_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crossmatch" ADD CONSTRAINT "Crossmatch_executionItemId_fkey" FOREIGN KEY ("executionItemId") REFERENCES "BloodBankExecutionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Crossmatch" ADD CONSTRAINT "Crossmatch_bloodUnitId_fkey" FOREIGN KEY ("bloodUnitId") REFERENCES "BloodUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodAllocation" ADD CONSTRAINT "BloodAllocation_executionItemId_fkey" FOREIGN KEY ("executionItemId") REFERENCES "BloodBankExecutionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodAllocation" ADD CONSTRAINT "BloodAllocation_bloodUnitId_fkey" FOREIGN KEY ("bloodUnitId") REFERENCES "BloodUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodIssue" ADD CONSTRAINT "BloodIssue_executionItemId_fkey" FOREIGN KEY ("executionItemId") REFERENCES "BloodBankExecutionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodIssue" ADD CONSTRAINT "BloodIssue_bloodUnitId_fkey" FOREIGN KEY ("bloodUnitId") REFERENCES "BloodUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedsideVerification" ADD CONSTRAINT "BedsideVerification_transfusionEpisodeId_fkey" FOREIGN KEY ("transfusionEpisodeId") REFERENCES "TransfusionEpisode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfusionEpisode" ADD CONSTRAINT "TransfusionEpisode_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "BloodIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfusionObservation" ADD CONSTRAINT "TransfusionObservation_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "TransfusionEpisode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransfusionReaction" ADD CONSTRAINT "TransfusionReaction_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "TransfusionEpisode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodBankAudit" ADD CONSTRAINT "BloodBankAudit_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "BloodBankExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_executions" ADD CONSTRAINT "referral_executions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_execution_items" ADD CONSTRAINT "referral_execution_items_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "referral_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_execution_items" ADD CONSTRAINT "referral_execution_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_recipients" ADD CONSTRAINT "referral_recipients_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "referral_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_communications" ADD CONSTRAINT "referral_communications_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "referral_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_appointments" ADD CONSTRAINT "referral_appointments_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "referral_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_responses" ADD CONSTRAINT "referral_responses_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "referral_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_transfers" ADD CONSTRAINT "care_transfers_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "referral_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_outcome_reports" ADD CONSTRAINT "referral_outcome_reports_execution_item_id_fkey" FOREIGN KEY ("execution_item_id") REFERENCES "referral_execution_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_audits" ADD CONSTRAINT "referral_audits_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "referral_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "platform_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_tokens" ADD CONSTRAINT "api_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "platform_admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_network_membership" ADD CONSTRAINT "hospital_network_membership_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_network_membership" ADD CONSTRAINT "hospital_network_membership_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_flag_history" ADD CONSTRAINT "feature_flag_history_flag_id_fkey" FOREIGN KEY ("flag_id") REFERENCES "feature_flags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_invoices" ADD CONSTRAINT "platform_invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "webhook_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_capabilities" ADD CONSTRAINT "hospital_capabilities_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_capabilities" ADD CONSTRAINT "hospital_capabilities_capability_key_fkey" FOREIGN KEY ("capability_key") REFERENCES "capability_registry"("key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "approval_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_responses" ADD CONSTRAINT "approval_responses_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "approval_steps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hospital_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_summaries" ADD CONSTRAINT "encounter_summaries_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_orders" ADD CONSTRAINT "clinical_orders_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_orders" ADD CONSTRAINT "clinical_orders_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_orders" ADD CONSTRAINT "clinical_orders_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_tasks" ADD CONSTRAINT "clinical_tasks_encounter_id_fkey" FOREIGN KEY ("encounter_id") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_tasks" ADD CONSTRAINT "clinical_tasks_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_clinical_order_id_fkey" FOREIGN KEY ("clinical_order_id") REFERENCES "clinical_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "test_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_result_values" ADD CONSTRAINT "lab_result_values_lab_result_id_fkey" FOREIGN KEY ("lab_result_id") REFERENCES "lab_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lab_result_values" ADD CONSTRAINT "lab_result_values_parameter_id_fkey" FOREIGN KEY ("parameter_id") REFERENCES "test_template_parameters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_template_parameters" ADD CONSTRAINT "test_template_parameters_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "test_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_items" ADD CONSTRAINT "charge_items_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "charge_items" ADD CONSTRAINT "charge_items_billing_account_id_fkey" FOREIGN KEY ("billing_account_id") REFERENCES "billing_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_intent_id_fkey" FOREIGN KEY ("intent_id") REFERENCES "payment_intents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_audit" ADD CONSTRAINT "billing_audit_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_audit" ADD CONSTRAINT "billing_audit_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_intents" ADD CONSTRAINT "payment_intents_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptSequence" ADD CONSTRAINT "ReceiptSequence_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptTemplate" ADD CONSTRAINT "ReceiptTemplate_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_authMethodId_fkey" FOREIGN KEY ("authMethodId") REFERENCES "auth_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Receipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_allocation_id_fkey" FOREIGN KEY ("allocation_id") REFERENCES "payment_allocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;