import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function simulate() {
  console.log('🏥 Starting Hospital Day Simulation (Gate 1)...');

  let hospital = await prisma.hospitalsMaster.findFirst();
  if (!hospital) {
    console.log('No hospital found. Seeding test hospital...');
    hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Muzaffarpur General Pilot',
        displayName: 'Muzaffarpur General Pilot',
        registrationNumber: 'HOSP-SIM-101',
        verificationStatus: 'verified',
        accountStatus: 'active',
      },
    });
  }

  let doctor = await prisma.doctorMaster.findFirst();
  if (!doctor) {
    console.log('No doctor found. Seeding test doctor...');
    doctor = await prisma.doctorMaster.create({
      data: {
        fullName: 'Dr. Pilot Tester',
        mobile: '9876543210',
        email: 'dr.pilot@haspataal.com',
        kycStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
  }

  console.log(
    `Using Hospital: ${hospital.displayName || hospital.legalName}, Doctor: ${doctor.fullName}`,
  );

  const startTime = Date.now();

  // 1. Simulate 300 OPD Registrations
  console.log('⏳ Simulating 300 OPD Registrations...');
  const patientIds = [];
  for (let i = 0; i < 300; i++) {
    const p = await prisma.patient.create({
      data: {
        name: `Sim Patient ${i}`,
        phone: `99${Math.floor(Math.random() * 100000000)
          .toString()
          .padStart(8, '0')}`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        dob: new Date(1980 + (i % 40), 1, 1),
      },
    });
    patientIds.push(p.id);

    // Create Appointment for OPD
    await prisma.appointment.create({
      data: {
        patientId: p.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        date: new Date(),
        slot: `10:00-${i}`,
        status: 'BOOKED',
      },
    });
  }

  // 2. Simulate 300 Consultations
  console.log('⏳ Simulating 300 Consultations...');
  const appointments = await prisma.appointment.findMany({
    where: {
      hospitalId: hospital.id,
      status: 'BOOKED',
      date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    take: 300,
  });

  for (const app of appointments) {
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: app.id },
        data: { status: 'COMPLETED' },
      });

      await tx.patientRecord.create({
        data: {
          patientId: app.patientId,
          doctorId: app.doctorId,
          diagnosis: 'Viral Fever (Simulated)',
          notes: 'Patient advised rest.',
          vitals: { temp: '98.6', bp: '120/80' },
          prescription: 'Paracetamol 500mg - 1 tab TID for 3 days',
        },
      });
    });
  }

  // 3. Simulate 180 Pharmacy Dispenses
  console.log('⏳ Simulating 180 Pharmacy Dispenses...');
  for (let i = 0; i < 180; i++) {
    await prisma.pharmacyDispense.create({
      data: {
        hospitalId: hospital.id,
        patientId: patientIds[i],
        totalAmount: 50,
        status: 'DISPENSED',
      },
    });
  }

  // 4. Simulate Billing
  console.log('⏳ Simulating 300 Bills...');
  for (let i = 0; i < 300; i++) {
    await prisma.bill.create({
      data: {
        hospitalId: hospital.id,
        patientId: patientIds[i],
        totalAmount: 500,
        status: 'PAID',
        payload: {
          items: [{ service: 'OPD Consultation', qty: 1, price: 500 }],
        },
      },
    });
  }

  const endTime = Date.now();
  console.log(`✅ Simulation complete in ${(endTime - startTime) / 1000} seconds.`);
}

simulate()
  .catch((e) => {
    console.error('Simulation Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
