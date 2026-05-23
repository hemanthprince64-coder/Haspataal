const { Client } = require('pg');
require('dotenv').config();

const dsn = process.env.DATABASE_URL;

function sql(label, sql) {
  return async () => {
    const c = new Client({ connectionString: dsn });
    await c.connect();
    try {
      await c.query(sql);
      console.log(`[OK] ${label}`);
    } catch (e) {
      console.error(`[FAIL] ${label}:`, e.message);
      process.exitCode = 1;
    } finally {
      await c.end();
    }
  };
}

(async () => {
  // Phase 1 – create both missing enums
  await sql(
    'FacilityType enum',
    `
    DO $$ BEGIN CREATE TYPE "FacilityType" AS ENUM ('HOSPITAL','CLINIC');
    EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'FacilityType exists.'; END $$;
  `,
  )();
  await sql(
    'ClinicTier enum',
    `
    DO $$ BEGIN CREATE TYPE "ClinicTier" AS ENUM ('SINGLE_DOCTOR','MULTI_SPECIALITY');
    EXCEPTION WHEN duplicate_object THEN RAISE NOTICE 'ClinicTier exists.'; END $$;
  `,
  )();

  // Phase 2 – now alter hospitals_master (both enums exist)
  await sql(
    'ALTER TABLE hospitals_master new cols',
    `
    ALTER TABLE "hospitals_master"
      ADD COLUMN IF NOT EXISTS "facility_type"   "FacilityType"  NOT NULL DEFAULT 'HOSPITAL',
      ADD COLUMN IF NOT EXISTS "gst_exempt"      BOOLEAN         NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "clinic_tier"     "ClinicTier",
      ADD COLUMN IF NOT EXISTS "operating_hours" JSONB;
  `,
  )();

  // Verify
  const c3 = new Client({ connectionString: dsn });
  await c3.connect();
  const { rows } = await c3.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='hospitals_master'
      AND column_name IN ('facility_type','gst_exempt','clinic_tier','operating_hours')
    ORDER BY column_name
  `);
  console.log(
    '\nNew columns on hospitals_master:',
    rows.map((r) => r.column_name).join(', ') || '(none found)',
  );
  await c3.end();
})();
