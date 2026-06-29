#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DOCTOR_SKILLS = [
  'NICU',
  'PICU',
  'Ventilator Management',
  'Bronchoscopy',
  'Laparoscopy',
  'Ultrasound',
  'ECMO',
  'Dialysis',
  'Endoscopy',
  'Arthroscopy',
];

async function main() {
  console.log('[Phase1Seed] Seeding master data...');

  // Skills are stored as strings in DoctorSkill table
  // Just log them as reference - actual seeding happens when doctors add skills

  // The concepts (ICD-10, SNOMED, LOINC) are already seeded via seed-concepts.ts
  console.log('[Phase1Seed] Master skills for reference:', DOCTOR_SKILLS.join(', '));
  console.log('[Phase1Seed] Run seed-concepts.ts for ICD-10/SNOMED/LOINC codes.');
}

main()
  .catch((e) => {
    console.error('[Phase1Seed] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
