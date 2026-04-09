const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  try {
    const journeys = await prisma.careJourney.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { visitId: true, conditionSimple: true, createdAt: true }
    });
    console.log(JSON.stringify(journeys, null, 2));
  } catch (error) {
    console.error('Error fetching journeys:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();
