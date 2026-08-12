import { PrismaClient } from '@prisma/client';

import { IdentityCryptography } from '../../../packages/core/domain/identity/cryptography';
import { MobileNormalization } from '../../../packages/core/domain/identity/normalization';

const prisma = new PrismaClient();

async function backfillIdentityData() {
  console.log('Starting Phase 1 Identity Backfill...');

  let counts = {
    processed: 0,
    contactCreated: 0,
    alreadyMigrated: 0,
    invalid: 0,
    noMobile: 0,
    ambiguousDuplicates: 0,
    failed: 0,
  };

  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      phone: true,
    },
  });

  for (const patient of patients) {
    counts.processed++;

    if (!patient.phone) {
      counts.noMobile++;
      continue;
    }

    try {
      let normalizedMobile: string | null = null;
      try {
        normalizedMobile = MobileNormalization.normalize(patient.phone);
      } catch (e) {
        counts.invalid++;
        continue;
      }

      if (!normalizedMobile) {
        counts.invalid++;
        continue;
      }

      const { hash: lookupHash, version: hmacVersion } =
        IdentityCryptography.generateLookupHash(normalizedMobile);
      const { encrypted: encryptedMobile, version: encVersion } =
        IdentityCryptography.encryptValue(normalizedMobile);

      await prisma.$transaction(async (tx) => {
        const existingContact = await tx.patientContactPoint.findFirst({
          where: {
            patientId: patient.id,
            type: 'MOBILE',
            valueLookupHash: lookupHash,
          },
        });

        if (existingContact) {
          counts.alreadyMigrated++;
          return;
        }

        const otherPatientSameMobile = await tx.patientContactPoint.findFirst({
          where: {
            type: 'MOBILE',
            valueLookupHash: lookupHash,
            patientId: { not: patient.id },
          },
        });

        if (otherPatientSameMobile) {
          counts.ambiguousDuplicates++;
        }

        await tx.patientContactPoint.create({
          data: {
            patientId: patient.id,
            type: 'MOBILE',
            relationship: 'SELF',
            valueEncrypted: encryptedMobile,
            valueLookupHash: lookupHash,
            lookupKeyVersion: hmacVersion,
            status: 'UNVERIFIED',
            isPrimary: true,
          },
        });

        counts.contactCreated++;
      });
    } catch (error) {
      counts.failed++;
    }
  }

  console.log('--- Backfill Completed ---');
  console.log(`Processed: ${counts.processed}`);
  console.log(`Contact Created: ${counts.contactCreated}`);
  console.log(`Already Migrated: ${counts.alreadyMigrated}`);
  console.log(`Invalid: ${counts.invalid}`);
  console.log(`No Mobile: ${counts.noMobile}`);
  console.log(`Ambiguous Duplicate Candidates: ${counts.ambiguousDuplicates}`);
  console.log(`Failed: ${counts.failed}`);
}

backfillIdentityData()
  .catch((e) => {
    console.error('Fatal error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
