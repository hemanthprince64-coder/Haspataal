const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const targetPhones = ["8886392959", "8886392859", "8886392858"];
  
  // Find hospitals by contact number
  const hospitals = await prisma.hospitalsMaster.findMany({
    where: {
      contactNumber: { in: targetPhones }
    }
  });

  for (const h of hospitals) {
    console.log(`Resetting hospital ${h.legalName} (${h.id})...`);
    
    // 1. Reset status to inactive
    await prisma.hospitalsMaster.update({
      where: { id: h.id },
      data: {
        accountStatus: "inactive",
        verificationStatus: "verified" // keep verified so they are approved but in setup track
      }
    });

    // 2. Delete operational profile to restart discovery questionnaire
    try {
      await prisma.clinicOperationalProfile.delete({
        where: { hospitalId: h.id }
      });
      console.log(`- Deleted ClinicOperationalProfile for ${h.legalName}`);
    } catch (e) {
      console.log(`- No ClinicOperationalProfile found/deleted for ${h.legalName}`);
    }

    // 3. Delete staff entries (excluding admin to avoid lockouts)
    try {
      await prisma.staff.deleteMany({
        where: {
          hospitalId: h.id,
          NOT: {
            role: "HOSPITAL_ADMIN"
          }
        }
      });
      console.log(`- Cleared staff list (except admin) for ${h.legalName}`);
    } catch (e) {
      console.log(`- Error clearing staff list: ${e.message}`);
    }

    // 4. Delete opd config
    try {
      await prisma.opdConfig.delete({
        where: { hospitalId: h.id }
      });
      console.log(`- Deleted OPD Config for ${h.legalName}`);
    } catch (e) {
      console.log(`- No OPD Config found/deleted for ${h.legalName}`);
    }
  }

  console.log('Reset complete!');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
