require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  const hospital = await prisma.hospitalsMaster.update({
    where: { registrationNumber: 'REG-1771766206477' }, // Test Integration Hospital
    data: { password: hashedPassword }
  });

  console.log(`Updated hospital ${hospital.legalName} with hashed password: password123`);
  await prisma.$disconnect();
}

main();
