const { PrismaClient } = require('./packages/db/node_modules/@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function run() {
  try {
    const hospital = await prisma.hospitalsMaster.findFirst({
      select: { id: true, legalName: true, facilityType: true },
    });
    console.log('findFirst OK — sample facility_type:', hospital?.facilityType ?? '(null)');
    await prisma.$disconnect();
  } catch (e) {
    console.error('findFirst FAILED:', e.message);
    process.exit(1);
  }
}
run();
