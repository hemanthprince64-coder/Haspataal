import { prisma } from '../util/prisma-singleton';
import { addMinutes, parse, startOfDay, addDays, isBefore } from 'date-fns';
import { registerWorker } from '../util/worker-lifecycle';

/**
 * Slot Generator Service
 * Converts weekly DoctorSchedule records into discrete DoctorSlot rows.
 */
export async function generateDoctorSlots(doctorId: string, daysAhead: number = 30) {
  // 1. PURGE existing future unbooked slots (safe regeneration)
  await prisma.$executeRaw`
    DELETE FROM doctor_slots 
    WHERE doctor_id = ${doctorId}::uuid 
    AND start_time >= NOW() 
    AND id NOT IN (
      SELECT DISTINCT slot_time::text FROM appointments WHERE slot_time IS NOT NULL
    )
  `;

  // 2. Fetch active schedules (camelCase — Prisma generated types)
  const schedules = await prisma.doctorSchedule.findMany({
    where: { doctorId: doctorId, isActive: true }
  });

  if (schedules.length === 0) {
    console.log(`No active schedule found for doctor ${doctorId}`);
    return;
  }

  const startDate = startOfDay(new Date());
  const newSlots: { doctorId: string; startTime: Date; endTime: Date }[] = [];

  for (let d = 0; d < daysAhead; d++) {
    const currentDayDate = addDays(startDate, d);
    const dayOfWeek = currentDayDate.getDay();

    // Use camelCase field names from Prisma generated types
    const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

    for (const schedule of daySchedules) {
      let currentTime = parse(schedule.startTime as string, 'HH:mm:ss', currentDayDate);
      const endTime   = parse(schedule.endTime as string,   'HH:mm:ss', currentDayDate);

      while (isBefore(currentTime, endTime)) {
        newSlots.push({
          doctorId:  doctorId,
          startTime: currentTime,
          endTime:   addMinutes(currentTime, schedule.slotDurationMinutes),
        });
        currentTime = addMinutes(currentTime, schedule.slotDurationMinutes);
      }
    }
  }

  if (newSlots.length === 0) {
    console.log(`No slots to generate for doctor ${doctorId}`);
    return;
  }

  // 3. Bulk insert with ON CONFLICT DO NOTHING (idempotent regeneration)
  await prisma.$executeRaw`
    INSERT INTO doctor_slots (doctor_id, start_time, end_time)
    SELECT * FROM UNNEST(
      ${newSlots.map(s => s.doctorId)}::uuid[],
      ${newSlots.map(s => s.startTime)}::timestamptz[],
      ${newSlots.map(s => s.endTime)}::timestamptz[]
    ) AS t(doctor_id, start_time, end_time)
    ON CONFLICT (doctor_id, start_time) DO NOTHING;
  `;

  console.log(`Generated ${newSlots.length} slots for doctor ${doctorId} over ${daysAhead} days.`);
}
