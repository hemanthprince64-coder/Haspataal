import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
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
  const baseSql = fs.readFileSync(path.join(__dirname, '../../infra/sql/baseline.sql'), 'utf-8');
  await client.query(baseSql);

  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql') && f >= '10_' && f < '16_')
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
  await client.end();

  console.log('Generating Phase 4 diff...');
  try {
    execSync(
      `npx prisma migrate diff --from-url ${dbUrl} --to-schema-datamodel packages/db/prisma/schema.prisma --script > scripts/migrations/16_phase4_event_consumers.sql`,
      { stdio: 'inherit' },
    );
    console.log('Diff generated to scripts/migrations/16_phase4_event_consumers.sql');
  } catch (e) {
    console.error('Failed to generate diff', e);
  }

  await container.stop();
}

main().catch(console.error);
