const fs = require('fs');
const path = require('path');

const fullSchemaSql = fs.readFileSync('temp_full_schema.sql', 'utf8');

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';

    if (!inString && !inDollarQuote) {
      if (!inLineComment && !inBlockComment) {
        if (char === '-' && nextChar === '-') {
          inLineComment = true;
          current += char;
          continue;
        }
        if (char === '/' && nextChar === '*') {
          inBlockComment = true;
          current += char;
          continue;
        }
      } else if (inLineComment) {
        if (char === '\n') {
          inLineComment = false;
        }
        current += char;
        continue;
      } else if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
          inBlockComment = false;
          current += char + nextChar;
          i++;
          continue;
        }
        current += char;
        continue;
      }
    }

    if (!inLineComment && !inBlockComment && !inDollarQuote) {
      if ((char === "'" || char === '"') && !inString) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      } else if (inString && char === stringChar) {
        if (char === "'" && nextChar === "'") {
          current += "''";
          i++;
          continue;
        }
        inString = false;
        current += char;
        continue;
      }
    }

    if (!inLineComment && !inBlockComment && !inString) {
      if (char === '$') {
        if (!inDollarQuote) {
          const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
          if (match) {
            inDollarQuote = true;
            dollarTag = match[1];
            current += dollarTag;
            i += dollarTag.length - 1;
            continue;
          }
        } else {
          if (sql.slice(i).startsWith(dollarTag)) {
            inDollarQuote = false;
            current += dollarTag;
            i += dollarTag.length - 1;
            dollarTag = '';
            continue;
          }
        }
      }
    }

    if (char === ';' && !inString && !inDollarQuote && !inLineComment && !inBlockComment) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed + ';');
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }
  return statements;
}

const allStmts = splitStatements(fullSchemaSql);
console.log('Total statements in full schema:', allStmts.length);

const baselineStmts = [];
const patientForeignKeys = [];

for (const stmt of allStmts) {
  const trimmed = stmt.trim();

  // 1. Enums created in 0008 and 0009
  if (trimmed.includes('CREATE TYPE "AdmissionStatus"') || 
      trimmed.includes('CREATE TYPE "PatientAcuity"') ||
      trimmed.includes('CREATE TYPE "AlertSeverity"') ||
      trimmed.includes('CREATE TYPE "ClinicalEventType"')) {
    continue; // Created in 0008 or 0009
  }

  // 2. Tables created in 0005 and 0009
  if (trimmed.includes('CREATE TABLE "patients"') || 
      trimmed.includes('CREATE TABLE "clinical_events"') ||
      trimmed.includes('CREATE TABLE "clinical_alerts"')) {
    continue; // Created in 0005 or 0009
  }

  // 3. Indexes or Alters on patients, clinical_events, clinical_alerts
  if (trimmed.includes('ON "patients"') || 
      trimmed.includes('TABLE "patients"') ||
      trimmed.includes('ON "clinical_events"') ||
      trimmed.includes('TABLE "clinical_events"') ||
      trimmed.includes('ON "clinical_alerts"') ||
      trimmed.includes('TABLE "clinical_alerts"')) {
    if (trimmed.includes('TABLE "patients"')) {
      patientForeignKeys.push(stmt);
    }
    continue;
  }

  // 4. Foreign keys referencing patients
  if (trimmed.includes('REFERENCES "patients"')) {
    patientForeignKeys.push(stmt);
    continue;
  }

  // 5. Special handling for `admissions` table:
  if (trimmed.includes('CREATE TABLE "admissions"')) {
    let modifiedAdmission = stmt
      .replace(/"status"\s+"AdmissionStatus"\s+NOT NULL DEFAULT 'ADMITTED'/g, '"status" TEXT NOT NULL DEFAULT \'ADMITTED\'')
      .replace(/"acuity"\s+"PatientAcuity"\s+NOT NULL DEFAULT 'STABLE',\s*/g, '')
      .replace(/"acuity_updated_at"\s+TIMESTAMP\(3\)(?: DEFAULT CURRENT_TIMESTAMP)?,\s*/g, '');
    
    // Add clinical_status column to admissions
    modifiedAdmission = modifiedAdmission.replace(
      /"status" TEXT NOT NULL DEFAULT 'ADMITTED',/,
      '"status" TEXT NOT NULL DEFAULT \'ADMITTED\',\n    "clinical_status" TEXT DEFAULT \'DISCHARGE_CLINICALLY_DECIDED\','
    );
    baselineStmts.push(modifiedAdmission);
    continue;
  }

  baselineStmts.push(stmt);
}

console.log('Baseline statements count:', baselineStmts.length);
console.log('Patient FKs to place in 0005:', patientForeignKeys.length);

const baselineSqlOutput = baselineStmts.join('\n\n');
fs.writeFileSync('packages/db/prisma/migrations/0000_baseline/migration.sql', baselineSqlOutput);
console.log('Wrote 0000_baseline/migration.sql');

const patientTableSql = `-- Phase 5: Create patients table and attach patient foreign keys
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "phone" TEXT UNIQUE,
    "email" TEXT UNIQUE,
    "password" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "abha_address" TEXT UNIQUE,
    "account_status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
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
    "nickname" TEXT
);

-- Foreign keys referencing or originating from patients table
${patientForeignKeys.join('\n\n')}
`;

fs.writeFileSync('packages/db/prisma/migrations/0005_patients_table/migration.sql', patientTableSql);
console.log('Wrote 0005_patients_table/migration.sql');
