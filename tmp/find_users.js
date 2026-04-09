const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUsers() {
  try {
    const patient = await prisma.user.findFirst({
      where: { role: 'PATIENT' },
      select: { id: true, name: true }
    });
    const doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' },
      select: { id: true, name: true }
    });
    console.log(JSON.stringify({ patient, doctor }, null, 2));
  } catch (error) {
    console.error('Error fetching users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findUsers();
