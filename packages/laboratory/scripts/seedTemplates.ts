import { PrismaClient } from '@haspataal/db';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Laboratory Templates...');

  const cbc = await prisma.testTemplate.upsert({
    where: { hospitalId_code: { hospitalId: 'GLOBAL', code: 'CBC' } }, // use a dummy hospitalId for global? Schema allows hospitalId to be null for global. But @@unique is [hospitalId, code]. We can just create if it doesn't exist. Let's delete it first just in case.
    update: {},
    create: {
      code: 'CBC',
      name: 'Complete Blood Count',
      description: 'Standard CBC panel',
      parameters: {
        create: [
          {
            name: 'Hemoglobin',
            unit: 'g/dL',
            normalMin: 13.0,
            normalMax: 17.0,
            criticalMin: 7.0,
            criticalMax: 20.0,
            displayOrder: 1,
            decimalPlaces: 1,
          },
          {
            name: 'WBC Count',
            unit: 'x10^9/L',
            normalMin: 4.0,
            normalMax: 11.0,
            criticalMin: 2.0,
            criticalMax: 30.0,
            displayOrder: 2,
            decimalPlaces: 1,
          },
          {
            name: 'Platelet Count',
            unit: 'x10^9/L',
            normalMin: 150,
            normalMax: 450,
            criticalMin: 50,
            criticalMax: 1000,
            displayOrder: 3,
            decimalPlaces: 0,
          },
          {
            name: 'RBC Count',
            unit: 'x10^12/L',
            normalMin: 4.5,
            normalMax: 5.5,
            displayOrder: 4,
            decimalPlaces: 2,
          },
          {
            name: 'Hematocrit',
            unit: '%',
            normalMin: 40,
            normalMax: 50,
            criticalMin: 21,
            criticalMax: 60,
            displayOrder: 5,
            decimalPlaces: 1,
          },
        ],
      },
    },
  });

  const lft = await prisma.testTemplate.upsert({
    where: { hospitalId_code: { hospitalId: 'GLOBAL', code: 'LFT' } },
    update: {},
    create: {
      code: 'LFT',
      name: 'Liver Function Test',
      description: 'Comprehensive liver panel',
      parameters: {
        create: [
          {
            name: 'Total Bilirubin',
            unit: 'mg/dL',
            normalMin: 0.1,
            normalMax: 1.2,
            criticalMax: 15.0,
            displayOrder: 1,
            decimalPlaces: 1,
          },
          {
            name: 'Direct Bilirubin',
            unit: 'mg/dL',
            normalMin: 0.0,
            normalMax: 0.3,
            displayOrder: 2,
            decimalPlaces: 1,
          },
          {
            name: 'SGOT (AST)',
            unit: 'U/L',
            normalMin: 8,
            normalMax: 40,
            criticalMax: 1000,
            displayOrder: 3,
            decimalPlaces: 0,
          },
          {
            name: 'SGPT (ALT)',
            unit: 'U/L',
            normalMin: 7,
            normalMax: 56,
            criticalMax: 1000,
            displayOrder: 4,
            decimalPlaces: 0,
          },
          {
            name: 'Alkaline Phosphatase',
            unit: 'U/L',
            normalMin: 44,
            normalMax: 147,
            displayOrder: 5,
            decimalPlaces: 0,
          },
        ],
      },
    },
  });

  console.log('Seeded CBC:', cbc.id);
  console.log('Seeded LFT:', lft.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
