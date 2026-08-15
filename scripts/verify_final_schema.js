const { execSync } = require('child_process');

function queryDb(sql) {
  const cmd = `docker exec haspataal-postgres psql -U postgres -d haspataal -t -A -c "${sql}"`;
  return execSync(cmd).toString().trim();
}

console.log('=== VALIDATING FINAL DATABASE SCHEMA ===\n');

// 1. Check _prisma_migrations records
const migrationCount = queryDb('SELECT count(*) FROM _prisma_migrations WHERE rolled_back_at IS NULL;');
const migrationNames = queryDb('SELECT migration_name FROM _prisma_migrations ORDER BY started_at ASC;');
console.log('1. _prisma_migrations count:', migrationCount);
console.log('   Migrations applied:\n   - ' + migrationNames.split('\n').join('\n   - '));

// 2. Check patients table
const patientsExists = queryDb("SELECT to_regclass('public.patients');");
console.log('\n2. Patients table exists:', patientsExists === 'patients');

// 3. Check admissions columns
const admissionsColumns = queryDb(`
  SELECT column_name, data_type, udt_name 
  FROM information_schema.columns 
  WHERE table_name = 'admissions' 
  ORDER BY column_name;
`);
console.log('\n3. Admissions columns:\n' + admissionsColumns);

const hasAcuity = admissionsColumns.includes('acuity');
const hasAcuityUpdatedAt = admissionsColumns.includes('acuity_updated_at');
const hasClinicalStatus = admissionsColumns.includes('clinical_status');
console.log('   - acuity present:', hasAcuity);
console.log('   - acuity_updated_at present:', hasAcuityUpdatedAt);
console.log('   - clinical_status present (should be false):', hasClinicalStatus);

// 4. Check Enums
const enums = queryDb(`
  SELECT typname FROM pg_type WHERE typname IN (
    'AdmissionStatus', 'PatientAcuity', 'ClinicalEventType', 'AlertSeverity', 'ClinicalStatus',
    'ProcedureExecutionStatus', 'ProcedureRoomStatus', 'ProcedurePriority'
  );
`);
console.log('\n4. Key Enums:\n' + enums);
console.log('   - ClinicalStatus exists (should be false):', enums.includes('ClinicalStatus'));
console.log('   - AdmissionStatus exists:', enums.includes('AdmissionStatus'));
console.log('   - PatientAcuity exists:', enums.includes('PatientAcuity'));
console.log('   - ClinicalEventType exists:', enums.includes('ClinicalEventType'));
console.log('   - AlertSeverity exists:', enums.includes('AlertSeverity'));
console.log('   - ProcedureRoomStatus exists:', enums.includes('ProcedureRoomStatus'));

// 5. Check clinical_events & clinical_alerts tables
const clinicalEvents = queryDb("SELECT to_regclass('public.clinical_events');");
const clinicalAlerts = queryDb("SELECT to_regclass('public.clinical_alerts');");
console.log('\n5. Emergency Engine tables:');
console.log('   - clinical_events exists:', clinicalEvents === 'clinical_events');
console.log('   - clinical_alerts exists:', clinicalAlerts === 'clinical_alerts');

// 6. Check procedure module tables
const procedureTables = ['procedure_room', 'procedure_execution', 'procedure_execution_item', 'procedure_appointment', 'procedure_session', 'procedure_checklist', 'procedure_report', 'anesthesia_episode', 'implant_usage'];
console.log('\n6. Procedure module tables:');
procedureTables.forEach(t => {
  const reg = queryDb(`SELECT to_regclass('public.${t}');`);
  console.log(`   - ${t} exists:`, reg === t);
});

// 7. Check total tables count in database
const totalTables = queryDb("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';");
console.log('\n7. Total tables in public schema:', totalTables);

console.log('\n=== ALL SCHEMA CHECKS COMPLETE ===');
