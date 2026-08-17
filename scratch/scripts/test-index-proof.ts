import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  console.log('Starting Testcontainers PostgreSQL...');
  const container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  console.log('Applying baseline schema...');
  const baseline = fs.readFileSync(path.join(__dirname, '../../infra/sql/baseline.sql'), 'utf8');
  await client.query(baseline);

  const migrations = [
    '10_add_outbox_canonical_columns.sql',
    '11_phase0b_idempotency_dlq.sql',
    '12_phase1_canonical_patient_registry.sql',
    '13_phase2_authorization_backbone.sql',
    '14_phase2_remediation.sql',
  ];

  for (const file of migrations) {
    console.log(`Applying ${file}...`);
    const sql = fs.readFileSync(path.join(__dirname, 'scripts', 'migrations', file), 'utf8');
    await client.query(sql);
  }

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  console.log('Querying pg_indexes for unique_active_primary_care...');
  const indexes = await prisma.$queryRaw<any[]>`
    SELECT indexname, indexdef FROM pg_indexes 
    WHERE tablename = 'care_responsibilities' AND indexname = 'unique_active_primary_care';
  `;
  console.log('Index found:', indexes);

  console.log('Inserting duplicate ACTIVE primary responsibilities...');
  await prisma.careResponsibility.create({
    data: {
      id: 'res-1',
      patientId: 'pat-1',
      doctorId: 'dr-1',
      episodeId: 'ep-1',
      status: 'ACTIVE',
      isPrimary: true,
    },
  });
  console.log('Inserted first record successfully.');

  try {
    await prisma.careResponsibility.create({
      data: {
        id: 'res-2',
        patientId: 'pat-1',
        doctorId: 'dr-2',
        episodeId: 'ep-1',
        status: 'ACTIVE',
        isPrimary: true,
      },
    });
    console.log('ERROR: Second insert succeeded (should have failed!).');
  } catch (err: any) {
    console.log('SUCCESS: Second insert failed as expected.');
    console.log('Error message:', err.message);
  }

  await prisma.$disconnect();
  await client.end();
  await container.stop();
}

main().catch(console.error);
