import { PostgreSqlContainer } from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();
  console.log('Postgres container started.');

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('Stubbing Supabase auth schema...');
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$ BEGIN RETURN '00000000-0000-0000-0000-000000000000'::uuid; END; $$ LANGUAGE plpgsql;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS text AS $$ BEGIN RETURN 'authenticated'; END; $$ LANGUAGE plpgsql;
    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb AS $$ BEGIN RETURN '{"hospital_id": "00000000-0000-0000-0000-000000000000"}'::jsonb; END; $$ LANGUAGE plpgsql;
  `);

  console.log('Applying base schema baseline.sql...');
  const baseSql = fs.readFileSync(path.join(__dirname, '../baseline.sql'), 'utf-8');
  await client.query(baseSql);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && f >= '10_' && f <= '18_z')
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    try {
      const sql = fs.readFileSync(filePath, 'utf-8');
      await client.query(sql);
      console.log(`✓ ${file} applied successfully.`);
    } catch (e) {
      console.error(`Failed on ${file}:`, e);
      await client.end();
      await container.stop();
      process.exit(1);
    }
  }

  console.log('Verifying Phase 3 schema changes...');
  const { rows } = await client.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'admissions' AND column_name IN ('clinical_status', 'physical_presence_status');
  `);
  console.log('Admissions Table Columns:', rows);

  const { rows: unique } = await client.query(`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'physical_departure_records' AND indexname = 'physical_departure_records_admission_id_key';
  `);
  console.log(
    'Unique index on PhysicalDepartureRecord.admissionId:',
    unique.length > 0 ? 'Exists' : 'Missing',
  );

  await client.end();
  await container.stop();
  console.log('Migration verification complete.');
}

main().catch(console.error);
