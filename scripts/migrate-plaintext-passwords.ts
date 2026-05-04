/**
 * scripts/migrate-plaintext-passwords.ts
 *
 * ONE-TIME MIGRATION — safe to run multiple times (idempotent).
 *
 * Purpose:
 *   Before bcrypt was enforced in services.ts, some Hospital and Agent rows may have
 *   been written with a plaintext password in their `password` column.
 *   This script reads every row, detects plaintext values using `isPlaintextPassword`,
 *   hashes them with bcrypt (cost-factor 12), and writes the hash back.
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/migrate-plaintext-passwords.ts
 *
 *   or, if you have tsx installed:
 *   npx tsx scripts/migrate-plaintext-passwords.ts
 */

import prisma from '../lib/prisma';
import { isPlaintextPassword } from '../lib/services';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

async function migrateHospitals(): Promise<void> {
  console.log('\n[hospitals_master] Reading all rows…');

  // Raw query because `password` is @ignore in the Prisma schema.
  const rows = await prisma.$queryRaw<{ id: string; password: string | null }[]>`
    SELECT id, password FROM hospitals_master
  `;

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.password) {
      // No password set — skip; let the application handle it on first login.
      skipped++;
      continue;
    }

    if (!isPlaintextPassword(row.password)) {
      // Already a bcrypt hash.
      skipped++;
      continue;
    }

    const hash = await bcrypt.hash(row.password, BCRYPT_ROUNDS);
    await prisma.$executeRaw`
      UPDATE hospitals_master SET password = ${hash} WHERE id = ${row.id}
    `;
    updated++;
    console.log(`  ✓ hospital ${row.id} — password rehashed`);
  }

  console.log(`[hospitals_master] done. updated=${updated}, skipped=${skipped}`);
}

async function migrateAgents(): Promise<void> {
  console.log('\n[agents] Reading all rows…');

  const agents = await prisma.agent.findMany({
    select: { id: true, password: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const agent of agents) {
    if (!agent.password) {
      skipped++;
      continue;
    }

    if (!isPlaintextPassword(agent.password)) {
      // Already hashed.
      skipped++;
      continue;
    }

    const hash = await bcrypt.hash(agent.password, BCRYPT_ROUNDS);
    await prisma.agent.update({
      where: { id: agent.id },
      data: { password: hash },
    });
    updated++;
    console.log(`  ✓ agent ${agent.id} — password rehashed`);
  }

  console.log(`[agents] done. updated=${updated}, skipped=${skipped}`);
}

async function main(): Promise<void> {
  console.log('=== Haspataal: Plaintext Password Migration ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log(`bcrypt cost factor: ${BCRYPT_ROUNDS}`);

  try {
    await migrateHospitals();
    await migrateAgents();
    console.log('\n✅ Migration complete.');
  } catch (err) {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
