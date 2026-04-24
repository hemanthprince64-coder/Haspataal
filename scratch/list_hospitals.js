const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospitalsMaster.findMany({
    select: { id: true, legalName: true }
  });
  console.log(JSON.stringify(hospitals, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
