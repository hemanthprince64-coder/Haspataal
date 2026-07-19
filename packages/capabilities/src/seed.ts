import { prisma } from '@haspataal/db';

async function run() {
  console.log('Seeding Capability Registry...');

  const capabilities = [
    {
      key: 'appointments',
      name: 'Appointments Module',
      category: 'CLINICAL',
      description: 'Core appointment booking and scheduling.',
      version: '1.0.0',
      defaultEnabled: true,
      dependencies: [],
    },
    {
      key: 'billing',
      name: 'Billing Module',
      category: 'BILLING',
      description: 'Invoicing, receipts, and revenue tracking.',
      version: '1.0.0',
      defaultEnabled: true,
      dependencies: [],
    },
    {
      key: 'emr',
      name: 'Electronic Medical Records',
      category: 'CLINICAL',
      description: 'Patient records, prescriptions, and clinical notes.',
      version: '1.0.0',
      defaultEnabled: true,
      dependencies: ['appointments'],
    },
    {
      key: 'abdm',
      name: 'ABDM Integration',
      category: 'INTEGRATION',
      description: 'Ayushman Bharat Digital Mission integration (ABHA).',
      version: '1.0.0',
      defaultEnabled: false,
      dependencies: ['emr'],
    },
    {
      key: 'telemedicine',
      name: 'Telemedicine Suite',
      category: 'CLINICAL',
      description: 'Remote video consultations.',
      version: '1.0.0',
      defaultEnabled: false,
      dependencies: ['appointments', 'billing'],
    },
    {
      key: 'ai_scribe',
      name: 'AI Clinical Scribe',
      category: 'AI',
      description: 'Automated clinical note generation via voice.',
      version: '1.0.0',
      defaultEnabled: false,
      dependencies: ['emr'],
    },
  ];

  for (const cap of capabilities) {
    await prisma.capabilityRegistry.upsert({
      where: { key: cap.key },
      update: cap,
      create: cap,
    });
  }

  console.log('Capability Registry seeded successfully.');
}

run()
  .catch(console.error)
  .finally(() => process.exit(0));
