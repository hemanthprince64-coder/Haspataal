require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hospital = await prisma.hospitalsMaster.findFirst({
    where: {
      password: { not: null },
      accountStatus: 'active'
    },
    select: {
      legalName: true,
      contactNumber: true,
      registrationNumber: true,
      password: true
    }
  });

  if (hospital) {
    console.log("\n--- Valid Hospital Login ---");
    console.log(`Hospital: ${hospital.legalName}`);
    console.log(`Phone: ${hospital.contactNumber}`);
    console.log(`Reg No: ${hospital.registrationNumber}`);
    console.log(`Password: ${hospital.password}`);
  } else {
    console.log("No hospital found with a password.");
  }

  const doctor = await prisma.doctorMaster.findFirst({
    where: {
      password: { not: null },
      accountStatus: 'ACTIVE'
    },
    select: {
      fullName: true,
      mobile: true,
      password: true
    }
  });

  if (doctor) {
    console.log("\n--- Valid Doctor Login ---");
    console.log(`Doctor: ${doctor.fullName}`);
    console.log(`Mobile: ${doctor.mobile}`);
    console.log(`Password: ${doctor.password}`);
  }

  const staff = await prisma.staff.findFirst({
    select: {
      name: true,
      mobile: true,
      password: true,
      role: true,
      hospital: { select: { legalName: true } }
    }
  });

  if (staff) {
    console.log("\n--- Valid Staff Login ---");
    console.log(`Staff: ${staff.name} (${staff.role})`);
    console.log(`Mobile: ${staff.mobile}`);
    console.log(`Password: ${staff.password}`);
    console.log(`Hospital: ${staff.hospital.legalName}`);
  }

  await prisma.$disconnect();
}

main();
