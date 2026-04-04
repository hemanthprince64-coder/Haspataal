import { PrismaClient } from '@prisma/client';
import { generateDoctorSlots } from '../lib/infrastructure/slot-generator';
import { bookSmartSlot } from '../lib/infrastructure/slot-engine';

const prisma = new PrismaClient();

/**
 * Demo: Smart Slot Engine
 * Demonstrates concurrent booking, idempotency, and slot generation.
 * Run with: npx ts-node scripts/demo-smart-engine.ts
 */
async function demo() {
  console.log('--- STARTING SMART SLOT ENGINE DEMO ---');

  // 1. Setup Doctor Schedule (using camelCase Prisma fields)
  const doctorId = '11111111-1111-1111-1111-111111111111';
  await prisma.doctorSchedule.upsert({
    where: {
      doctorId_dayOfWeek_startTime: {
        doctorId: doctorId,
        dayOfWeek: 1,       // Monday
        startTime: '09:00:00'
      }
    },
    update: {},
    create: {
      doctorId: doctorId,
      dayOfWeek: 1,
      startTime: '09:00:00',
      endTime: '12:00:00',
      slotDurationMinutes: 30
    }
  });

  // 2. Generate Slots
  console.log('Generating slots for doctor...');
  await generateDoctorSlots(doctorId, 7); // Next 7 days

  // 3. Concurrent Booking Simulation
  const slotTime = new Date('2026-04-06T09:00:00Z'); // Next Monday

  console.log(`Simulating concurrent booking for ${slotTime.toISOString()}...`);

  // Simulate 3 parallel requests — only 1 should succeed (capacity = 1)
  const requests = [
    bookSmartSlot({ doctorId, hospitalId: 'hosp-1', patientGlobalId: 'pt-1', slotTime, idempotencyKey: 'key-1' }),
    bookSmartSlot({ doctorId, hospitalId: 'hosp-1', patientGlobalId: 'pt-2', slotTime, idempotencyKey: 'key-2' }),
    bookSmartSlot({ doctorId, hospitalId: 'hosp-1', patientGlobalId: 'pt-3', slotTime, idempotencyKey: 'key-3' }),
  ];

  const results = await Promise.allSettled(requests);

  results.forEach((res, i) => {
    if (res.status === 'fulfilled') {
      console.log(`Request ${i + 1}: SUCCESS ✅ (appointmentId: ${res.value.id})`);
    } else {
      console.log(`Request ${i + 1}: REJECTED ❌ (${(res.reason as Error).message})`);
    }
  });

  console.log('--- DEMO COMPLETE ---');
  await prisma.$disconnect();
}

demo().catch(console.error);
