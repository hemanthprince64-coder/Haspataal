require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospitalsMaster.findMany({
    take: 5,
    select: {
      legalName: true,
      contactNumber: true,
      password: true,
      accountStatus: true
    }
  });

  console.log("\n--- Hospital Login Details ---");
  console.table(hospitals);

  const admins = await prisma.hospitalAdmin.findMany({
    take: 5,
    select: {
      fullName: true,
      mobile: true,
      email: true,
      hospital: {
        select: {
          legalName: true
        }
      }
    }
  });

  console.log("\n--- Hospital Admin Details ---");
  console.table(admins.map(a => ({
    Admin: a.fullName,
    Mobile: a.mobile,
    Email: a.email,
    Hospital: a.hospital.legalName
  })));
  
  await prisma.$disconnect();
}

main();
