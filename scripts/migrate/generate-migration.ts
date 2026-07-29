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
  const targetFilename = process.argv[2];
  if (!targetFilename || !targetFilename.endsWith('.sql')) {
    console.error('Usage: npx ts-node generate-migration.ts <migration_name.sql>');
    process.exit(1);
  }

  const container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();
  console.log('Postgres container started at:', dbUrl);

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
    .filter((f) => f.endsWith('.sql') && f >= '10_' && f < targetFilename)
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    await client.query(sql);
  }

  await client.end();

  console.log('Generating Prisma diff...');
  const prismaDir = path.join(__dirname, '../packages/db/prisma');
  const schemaPath = path.join(prismaDir, 'schema.prisma');

  // Set DATABASE_URL so Prisma can connect
  process.env.DATABASE_URL = dbUrl;

  const cmd = `npx prisma migrate diff --from-url "${dbUrl}" --to-schema-datamodel "${schemaPath}" --script`;
  console.log(`Running: ${cmd}`);

  try {
    const output = execSync(cmd, { encoding: 'utf-8', cwd: path.join(__dirname, '../') });
    const outPath = path.join(migrationsDir, targetFilename);
    fs.writeFileSync(outPath, output);
    console.log(`Successfully generated ${targetFilename}!`);
  } catch (e) {
    console.error('Error generating diff:', e);
  }

  await container.stop();
}

main().catch(console.error);
