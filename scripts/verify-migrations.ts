import { PostgreSqlContainer } from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  console.log('Starting PostgreSQL 16 Testcontainer...');
  const container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('--- APPLYING BASELINE SCHEMA ---');
  const baselineSql = fs.readFileSync(path.join(__dirname, '..', 'baseline.sql'), 'utf8');
  await client.query(baselineSql);
  console.log('SUCCESS: baseline.sql applied (Exit code: 0)');

  console.log('--- APPLYING PHASE 0-2 MIGRATIONS ---');

  const migrationsDir = path.join(__dirname, 'migrations');
  const filesToApply = [
    '10_add_outbox_canonical_columns.sql',
    '11_phase0b_idempotency_dlq.sql',
    '12_phase1_canonical_patient_registry.sql',
    '13_phase2_authorization_backbone.sql',
    '14_phase2_remediation.sql',
  ];

  for (const file of filesToApply) {
    console.log(`Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    try {
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`SUCCESS: ${file} (Exit code: 0)`);
    } catch (err: any) {
      console.error(`FAILED: ${file} (Exit code: 1)`);
      console.error(err.message);
      process.exit(1);
    }
  }

  console.log('--- VERIFYING SCHEMA ---');

  const queries = [
    {
      name: 'Phase 0A Canonical Outbox Columns',
      sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'outbox_events' AND column_name IN ('correlation_id', 'source_system', 'metadata');`,
    },
    {
      name: 'Phase 0B Lease/Idempotency/DLQ',
      sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'outbox_events' AND column_name IN ('status', 'lease_expires_at', 'error_count');`,
    },
    {
      name: 'Phase 1 Identity Tables',
      sql: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('patients', 'identity_merge_requests', 'patient_identities');`,
    },
    {
      name: 'Phase 2 Authorization Tables',
      sql: `SELECT table_name FROM information_schema.tables WHERE table_name IN ('doctor_patient_relationships', 'care_responsibilities', 'transfer_of_care', 'break_glass_activations');`,
    },
    {
      name: 'break_glass_activations',
      sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'break_glass_activations';`,
    },
    {
      name: 'departure_status/termination_reason',
      sql: `SELECT column_name FROM information_schema.columns WHERE table_name = 'care_responsibilities' AND column_name = 'termination_reason';`,
    },
    {
      name: 'Transfer Uniqueness Constraints/Indexes',
      sql: `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename IN ('care_responsibilities', 'transfer_of_care') 
      AND indexdef LIKE '%UNIQUE%';
    `,
    },
  ];

  for (const q of queries) {
    console.log(`\nVerification: ${q.name}`);
    const res = await client.query(q.sql);
    console.log(JSON.stringify(res.rows, null, 2));
  }

  await client.end();
  await container.stop();
  console.log('\nDONE.');
}

main().catch(console.error);
