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

-- AlterTable
ALTER TABLE "consumer_idempotency_ledger" ALTER COLUMN "processed_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "dead_letter_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "dead_lettered_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "outbox_events" ALTER COLUMN "occurred_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "next_retry_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "locked_until" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "patients" ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

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

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_patient_id_key" ON "user_accounts"("patient_id");

-- CreateIndex
CREATE INDEX "patient_contact_points_type_value_lookup_hash_idx" ON "patient_contact_points"("type", "value_lookup_hash");

-- CreateIndex
CREATE UNIQUE INDEX "auth_methods_user_account_id_contact_point_id_type_key" ON "auth_methods"("user_account_id", "contact_point_id", "type");

-- CreateIndex: Stable cross-rotation uniqueness — same mobile cannot activate two UserAccounts
-- claim_key is HMAC(STABLE_CLAIM_SECRET, normalizedMobile) — this secret is NOT the lookup key.
-- pg_advisory_xact_lock further serializes concurrent activations for the same mobile.
CREATE UNIQUE INDEX "auth_methods_type_claim_key_key" ON "auth_methods"("type", "claim_key");

-- CreateIndex
CREATE INDEX "mobile_verification_challenges_mobile_lookup_hash_status_idx" ON "mobile_verification_challenges"("mobile_lookup_hash", "status");

-- CreateIndex
CREATE UNIQUE INDEX "patient_aliases_alias_patient_id_key" ON "patient_aliases"("alias_patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_logs_idempotency_key_key" ON "event_logs"("idempotency_key");

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_contact_points" ADD CONSTRAINT "patient_contact_points_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_methods" ADD CONSTRAINT "auth_methods_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_methods" ADD CONSTRAINT "auth_methods_contact_point_id_fkey" FOREIGN KEY ("contact_point_id") REFERENCES "patient_contact_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_aliases" ADD CONSTRAINT "patient_aliases_alias_patient_id_fkey" FOREIGN KEY ("alias_patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_aliases" ADD CONSTRAINT "patient_aliases_canonical_patient_id_fkey" FOREIGN KEY ("canonical_patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_dead_letter_created" RENAME TO "dead_letter_events_dead_lettered_at_idx";

-- RenameIndex
ALTER INDEX "idx_dead_letter_event_type" RENAME TO "dead_letter_events_event_type_idx";

-- RenameIndex
ALTER INDEX "idx_outbox_aggregate_id" RENAME TO "outbox_events_aggregate_id_idx";

-- RenameIndex
ALTER INDEX "idx_outbox_correlation_id" RENAME TO "outbox_events_correlation_id_idx";

-- RenameIndex
ALTER INDEX "idx_outbox_delivery_status" RENAME TO "outbox_events_delivery_status_idx";


-- Create partial unique index for primary contacts
CREATE UNIQUE INDEX "patient_contact_points_primary_idx" 
ON "patient_contact_points" ("patient_id", "type") 
WHERE "is_primary" = true AND "status" = 'ACTIVE';
