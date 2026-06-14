const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospitalsMaster.findMany({
    select: {
      id: true,
      legalName: true,
      contactNumber: true,
      accountStatus: true,
      verificationStatus: true,
    }
  });
  console.log('Hospitals in DB:', JSON.stringify(hospitals, null, 2));
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
