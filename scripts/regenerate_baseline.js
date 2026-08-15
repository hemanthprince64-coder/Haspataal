const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const migrationsDir = path.join(projectRoot, 'scripts', 'migrate', 'migrations');
const baselinePath = path.join(projectRoot, 'infra', 'sql', 'baseline.sql');
const outputPath = path.join(projectRoot, 'packages', 'db', 'prisma', 'migrations', '0000_baseline', 'migration.sql');

// Read baseline.sql
const baseline = fs.readFileSync(baselinePath, 'utf8');

// Read legacy migration files in order
const legacyFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/^(\d+)/)?.[1] || '0');
    const numB = parseInt(b.match(/^(\d+)/)?.[1] || '0');
    return numA - numB;
  });

let legacyContent = '';
for (const file of legacyFiles) {
  const filePath = path.join(migrationsDir, file);
  legacyContent += `\n-- ================================================================\n-- ${file.toUpperCase()}\n-- ================================================================\n\n`;
  legacyContent += fs.readFileSync(filePath, 'utf8') + '\n\n';
}

// Combine baseline + legacy
let combined = baseline + '\n\n' + legacyContent;

// Remove CREATE TABLE "patients" and its related statements
const lines = combined.split('\n');
const filtered = [];
let skipPatientsSection = false;
let inPatientsTable = false;
let parenDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect start of patients table creation
  if (line.includes('CREATE TABLE') && line.includes('"patients"') && !line.includes('patient_')) {
    inPatientsTable = true;
    skipPatientsSection = true;
    parenDepth = 0;
    // Check if opening paren is on this line
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    parenDepth += openParens - closeParens;
    continue;
  }
  
  // Track parenthesis depth for CREATE TABLE
  if (inPatientsTable) {
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    parenDepth += openParens - closeParens;
    
    // End of CREATE TABLE statement
    if (parenDepth <= 0 && line.trim().endsWith(');')) {
      inPatientsTable = false;
      skipPatientsSection = false;
    }
    continue;
  }
  
  // Also skip ALTER TABLE patients and CREATE INDEX on patients
  if (line.includes('ALTER TABLE') && line.includes('"patients"') && !line.includes('patient_')) {
    continue;
  }
  
  filtered.push(line);
}

combined = filtered.join('\n');

// Deduplicate statements
const seenTables = new Set();
const seenIndexes = new Set();
const seenConstraints = new Set();
const seenTypes = new Set();

const statements = combined.split(';');
const deduped = [];

for (const stmt of statements) {
  const trimmed = stmt.trim();
  if (!trimmed) continue;
  
  let key = null;
  let skip = false;
  
  if (trimmed.startsWith('CREATE TABLE IF NOT EXISTS') || trimmed.startsWith('CREATE TABLE')) {
    const match = trimmed.match(/CREATE TABLE (?:IF NOT EXISTS )?"(\w+)"/);
    if (match) {
      key = `TABLE_${match[1]}`;
      if (seenTables.has(key)) skip = true;
      else seenTables.add(key);
    }
  } else if (trimmed.startsWith('CREATE INDEX')) {
    // Extract index name
    const match = trimmed.match(/CREATE INDEX (?:IF NOT EXISTS )?"(\w+)"/);
    if (match) {
      key = `INDEX_${match[1]}`;
      if (seenIndexes.has(key)) skip = true;
      else seenIndexes.add(key);
    }
  } else if (trimmed.startsWith('ALTER TABLE') && trimmed.includes('ADD CONSTRAINT')) {
    const match = trimmed.match(/ADD CONSTRAINT "(\w+)"/);
    if (match) {
      key = `CONSTRAINT_${match[1]}`;
      if (seenConstraints.has(key)) skip = true;
      else seenConstraints.add(key);
    }
  } else if (trimmed.startsWith('CREATE TYPE') || (trimmed.startsWith('DO $$') && trimmed.includes('CREATE TYPE'))) {
    // Extract type name
    const match = trimmed.match(/CREATE TYPE "(\w+)"/) || trimmed.match(/typname = '(\w+)'/);
    if (match) {
      key = `TYPE_${match[1]}`;
      if (seenTypes.has(key)) skip = true;
      else seenTypes.add(key);
    }
  }
  
  if (!skip) {
    deduped.push(stmt);
  }
}

let result = deduped.join(';\n\n') + ';\n';

// Add missing tables: procedure_room and procedure_appointment
const missingTables = `
-- CreateTable
CREATE TABLE IF NOT EXISTS "procedure_room" (
    "id" TEXT NOT NULL,
    "hospital_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "room_type" TEXT NOT NULL,
    "status" "ProcedureRoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "procedure_room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "procedure_room_hospital_id_idx" ON "procedure_room"("hospital_id");

-- CreateTable
CREATE TABLE IF NOT EXISTS "procedure_appointment" (
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

-- CreateIndex
CREATE UNIQUE INDEX "procedure_appointment_execution_id_key" ON "procedure_appointment"("execution_id");

-- CreateIndex
CREATE INDEX "procedure_appointment_room_id_idx" ON "procedure_appointment"("room_id");

-- AddForeignKey
ALTER TABLE "procedure_appointment" ADD CONSTRAINT "procedure_appointment_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "procedure_execution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedure_appointment" ADD CONSTRAINT "procedure_appointment_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "procedure_room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
`;

// Append before the final semicolon
result = result.replace(/;\s*$/, ';\n\n' + missingTables.trim() + '\n;');

// Write output
fs.writeFileSync(outputPath, result);
console.log('Baseline regenerated successfully!');
console.log('Output:', outputPath);