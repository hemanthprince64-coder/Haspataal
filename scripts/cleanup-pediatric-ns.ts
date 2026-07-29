import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Starting Cleanup of Pediatric Nephrotic Syndrome Simulation Data...');

  // 1. Find Hospital
  const hospital = await prisma.hospitalsMaster.findFirst({
    where: { registrationNumber: 'HOSP-SIM-NS-101' },
  });

  // 2. Find Doctor
  const doctor = await prisma.doctorMaster.findFirst({
    where: { email: 'dr.ns.sim@haspataal.com' },
  });

  if (hospital) {
    console.log(`- Deleting Hospital: ${hospital.legalName} (${hospital.id})`);

    // Deleting the hospital will cascade and delete associated patients, admissions, etc.
    // However, some relations might not have Cascade delete depending on the schema.
    // Let's delete the Patients explicitly first just in case.
    const deletedPatients = await prisma.patient.deleteMany({
      where: {
        name: {
          contains: '(Simulation)',
        },
      },
    });
    console.log(
      `- Deleted ${deletedPatients.count} simulation patients and their cascading records.`,
    );

    await prisma.hospitalsMaster.delete({
      where: { id: hospital.id },
    });
    console.log('- Hospital deleted successfully.');
  } else {
    console.log('- No simulation hospital found to delete.');
  }

  if (doctor) {
    console.log(`- Deleting Doctor: ${doctor.fullName} (${doctor.id})`);
    await prisma.doctorMaster.delete({
      where: { id: doctor.id },
    });
    console.log('- Doctor deleted successfully.');
  } else {
    console.log('- No simulation doctor found to delete.');
  }

  console.log('✅ Cleanup successfully completed. Environment is pristine.');
}

cleanup()
  .catch((e) => {
    console.error('Cleanup Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
