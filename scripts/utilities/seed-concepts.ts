import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONCEPTS_DATA = [
  {
    name: 'Hypertension',
    description: 'High blood pressure condition',
    mappings: [
      { source: 'ICD-11', code: 'BA00', displayName: 'Essential hypertension' },
      { source: 'SNOMED-CT', code: '38341003', displayName: 'Hypertensive disorder' },
      { source: 'CIEL', code: '1173', displayName: 'Hypertension' },
    ],
  },
  {
    name: 'Malaria',
    description: 'Mosquito-borne infectious disease',
    mappings: [
      { source: 'ICD-11', code: '1A20', displayName: 'Malaria' },
      { source: 'SNOMED-CT', code: '61462000', displayName: 'Malaria' },
      { source: 'CIEL', code: '116124', displayName: 'Malaria' },
    ],
  },
  {
    name: 'Kala-azar (Visceral Leishmaniasis)',
    description: 'Protozoan parasitic disease transmitted by sandflies',
    mappings: [
      { source: 'ICD-11', code: '1F54.0', displayName: 'Visceral leishmaniasis' },
      { source: 'SNOMED-CT', code: '241103006', displayName: 'Visceral leishmaniasis' },
      { source: 'CIEL', code: '113824', displayName: 'Kala-azar' },
    ],
  },
  {
    name: 'Tuberculosis',
    description: 'Infectious disease caused by Mycobacterium tuberculosis',
    mappings: [
      { source: 'ICD-11', code: '1B10', displayName: 'Tuberculosis' },
      { source: 'SNOMED-CT', code: '56717001', displayName: 'Tuberculosis' },
      { source: 'CIEL', code: '112141', displayName: 'Tuberculosis' },
    ],
  },
  {
    name: 'Antenatal Care (ANC)',
    description: 'Routine clinical care during pregnancy',
    mappings: [
      { source: 'SNOMED-CT', code: '116859006', displayName: 'Antenatal care' },
      { source: 'CIEL', code: '161636', displayName: 'Antenatal Care' },
    ],
  },
  {
    name: 'Systolic Blood Pressure',
    description: 'Systolic arterial blood pressure',
    mappings: [
      { source: 'LOINC', code: '8480-6', displayName: 'Systolic blood pressure' },
      { source: 'CIEL', code: '5085', displayName: 'Systolic blood pressure' },
    ],
  },
  {
    name: 'Diastolic Blood Pressure',
    description: 'Diastolic arterial blood pressure',
    mappings: [
      { source: 'LOINC', code: '8462-4', displayName: 'Diastolic blood pressure' },
      { source: 'CIEL', code: '5086', displayName: 'Diastolic blood pressure' },
    ],
  },
  {
    name: 'Body Temperature',
    description: 'Core body temperature measurement',
    mappings: [
      { source: 'LOINC', code: '8310-5', displayName: 'Body temperature' },
      { source: 'CIEL', code: '5088', displayName: 'Temperature' },
    ],
  },
  {
    name: 'Heart Rate',
    description: 'Heart beats per minute',
    mappings: [
      { source: 'LOINC', code: '8867-4', displayName: 'Heart rate' },
      { source: 'CIEL', code: '5087', displayName: 'Pulse' },
    ],
  },
  {
    name: 'Oxygen Saturation (SpO2)',
    description: 'Peripheral blood oxygen saturation',
    mappings: [
      { source: 'LOINC', code: '2708-6', displayName: 'Oxygen saturation' },
      { source: 'CIEL', code: '5092', displayName: 'SpO2' },
    ],
  },
];

async function main() {
  console.log('[SeedConcepts] Starting concept seed...');
  let count = 0;

  for (const item of CONCEPTS_DATA) {
    const existing = await prisma.concept.findFirst({
      where: { name: item.name },
    });

    if (existing) {
      console.log(`[SeedConcepts] Concept "${item.name}" already exists. Skipping.`);
      continue;
    }

    // Create Concept and mappings in a transaction
    await prisma.concept.create({
      data: {
        name: item.name,
        description: item.description,
        mappings: {
          create: item.mappings,
        },
      },
    });

    console.log(
      `[SeedConcepts] Created concept "${item.name}" with ${item.mappings.length} mappings.`,
    );
    count++;
  }

  console.log(`[SeedConcepts] Completed. Seeded ${count} concepts.`);
}

main()
  .catch((e) => {
    console.error('[SeedConcepts] Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
