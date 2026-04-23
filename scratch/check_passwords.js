require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hospitals = await prisma.hospitalsMaster.findMany({
    where: {
      password: { not: null },
      accountStatus: 'active'
    },
    select: {
      legalName: true,
      contactNumber: true,
      password: true
    }
  });

  console.log("\n--- Hospital Password Check ---");
  for (const h of hospitals) {
    const isBcrypt = h.password.startsWith('$2a$') || h.password.startsWith('$2b$');
    console.log(`Hospital: ${h.legalName} | Mobile: ${h.contactNumber} | Password: ${h.password} | Bcrypt: ${isBcrypt}`);
    
    // Test a common password if it's bcrypt
    if (isBcrypt) {
       const testPasses = ['hospital1', 'hospital123', 'password123', '123456'];
       for (const tp of testPasses) {
         if (await bcrypt.compare(tp, h.password)) {
           console.log(`  >>> FOUND PASSWORD: ${tp}`);
         }
       }
    }
  }

  const staff = await prisma.staff.findMany({
    take: 5,
    select: {
      name: true,
      mobile: true,
      password: true,
      role: true
    }
  });

  console.log("\n--- Staff Password Check ---");
  for (const s of staff) {
    const isBcrypt = s.password.startsWith('$2a$') || s.password.startsWith('$2b$');
    console.log(`Staff: ${s.name} | Mobile: ${s.mobile} | Role: ${s.role} | Bcrypt: ${isBcrypt}`);
    if (isBcrypt) {
       const testPasses = ['admin123', 'hospital123', 'password123', '123', '123456'];
       for (const tp of testPasses) {
         if (await bcrypt.compare(tp, s.password)) {
           console.log(`  >>> FOUND PASSWORD: ${tp}`);
         }
       }
    }
  }

  await prisma.$disconnect();
}

main();
