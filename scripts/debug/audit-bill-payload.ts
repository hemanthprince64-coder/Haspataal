/**
 * audit-bill-payload.ts
 * Run with: npx ts-node --project tsconfig.json scripts/audit-bill-payload.ts
 *
 * Finds all PAID bills where payload is null or payload.source is null,
 * logs them, and optionally backfills with source: 'legacy'.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BACKFILL = process.argv.includes('--backfill');

async function main() {
  console.log('🔍 Auditing PAID bills for missing payload.source metadata...\n');

  const paidBills = await prisma.bill.findMany({
    where: { status: 'PAID' },
    select: { id: true, hospitalId: true, payload: true, paidAt: true, createdAt: true },
  });

  const missingSource = paidBills.filter((b) => {
    if (!b.payload) return true;
    const p = b.payload as Record<string, unknown>;
    return !p.source;
  });

  console.log(`Total PAID bills:          ${paidBills.length}`);
  console.log(`Bills missing source:       ${missingSource.length}`);
  console.log(`Bills with source:          ${paidBills.length - missingSource.length}`);

  if (missingSource.length > 0) {
    console.log('\nSample missing bills (first 10):');
    for (const b of missingSource.slice(0, 10)) {
      console.log(`  ID: ${b.id} | Hospital: ${b.hospitalId} | PaidAt: ${b.paidAt}`);
    }
  }

  if (BACKFILL && missingSource.length > 0) {
    console.log(`\n⚙️  Backfilling ${missingSource.length} bills with source: 'legacy'...`);
    let updated = 0;
    for (const b of missingSource) {
      const existing = (b.payload as Record<string, unknown>) ?? {};
      await prisma.bill.update({
        where: { id: b.id },
        data: {
          source: 'legacy',
          payload: { ...existing, source: 'legacy', paidAt: b.paidAt?.toISOString() },
        },
      });
      updated++;
    }
    console.log(`✅ Backfilled ${updated} bills.\n`);
  } else if (missingSource.length > 0) {
    console.log('\nRun with --backfill to update these records with source: "legacy".');
  } else {
    console.log('\n✅ All PAID bills have payload.source set. No action needed.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
