'use server';

import { revalidatePath } from 'next/cache';

import { requireHospitalAccess } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

import {
  UpsertDoctorScheduleSchema,
  GenerateSlotsSchema,
  BlockSlotsSchema,
} from './validations/schedule';

// 1. getDoctorSchedule(doctorId)
export async function getDoctorSchedule(doctorId: string) {
  try {
    await requireHospitalAccess('opd', 'read');
    const schedule = await prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return { success: true, data: schedule };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to fetch doctor schedule' };
  }
}

// 2. upsertDoctorSchedule(doctorId, dayOfWeek, startTime, endTime, isActive)
export async function upsertDoctorSchedule(input: unknown) {
  try {
    await requireHospitalAccess('opd', 'manage_schedule');
    const validated = UpsertDoctorScheduleSchema.parse(input);

    const schedule = await prisma.doctorSchedule.upsert({
      where: {
        doctorId_dayOfWeek_startTime: {
          doctorId: validated.doctorId,
          dayOfWeek: validated.dayOfWeek,
          startTime: validated.startTime,
        },
      },
      create: {
        doctorId: validated.doctorId,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        isActive: validated.isActive,
        slotDurationMinutes: validated.slotDurationMinutes,
      },
      update: {
        endTime: validated.endTime,
        isActive: validated.isActive,
        slotDurationMinutes: validated.slotDurationMinutes,
      },
    });

    revalidatePath('/hospital/dashboard/schedule');
    return { success: true, data: schedule };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to upsert schedule' };
  }
}

// 3. generateSlotsFromSchedule(doctorId, dateRange)
export async function generateSlotsFromSchedule(input: unknown) {
  try {
    await requireHospitalAccess('opd', 'manage_schedule');
    const validated = GenerateSlotsSchema.parse(input);

    const start = new Date(validated.startDate);
    const end = new Date(validated.endDate);

    // Fetch weekly templates
    const templates = await prisma.doctorSchedule.findMany({
      where: {
        doctorId: validated.doctorId,
        isActive: true,
      },
    });

    if (templates.length === 0) {
      return { success: false, message: 'No active schedule templates found for this doctor.' };
    }

    const slotsToCreate: Array<{
      doctorId: string;
      startTime: Date;
      endTime: Date;
      capacity: number;
    }> = [];

    // Loop through each date
    const currentDate = new Date(start);
    while (currentDate <= end) {
      // Map JS getDay() [0=Sunday...6=Saturday] to our DayOfWeek [1=Monday...7=Sunday]
      const jsDay = currentDate.getDay();
      const dbDay = jsDay === 0 ? 7 : jsDay;

      const dayTemplates = templates.filter((t) => t.dayOfWeek === dbDay);

      for (const temp of dayTemplates) {
        const [startHour, startMin] = temp.startTime.split(':').map(Number);
        const [endHour, endMin] = temp.endTime.split(':').map(Number);

        const slotStartLimit = new Date(currentDate);
        slotStartLimit.setHours(startHour, startMin, 0, 0);

        const slotEndLimit = new Date(currentDate);
        slotEndLimit.setHours(endHour, endMin, 0, 0);

        let tempStart = new Date(slotStartLimit);
        while (tempStart < slotEndLimit) {
          const tempEnd = new Date(tempStart);
          tempEnd.setMinutes(tempEnd.getMinutes() + temp.slotDurationMinutes);

          if (tempEnd <= slotEndLimit) {
            slotsToCreate.push({
              doctorId: validated.doctorId,
              startTime: new Date(tempStart),
              endTime: new Date(tempEnd),
              capacity: 1,
            });
          }
          tempStart = new Date(tempEnd);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (slotsToCreate.length > 0) {
      await prisma.doctorSlot.createMany({
        data: slotsToCreate,
        skipDuplicates: true,
      });
    }

    revalidatePath('/hospital/dashboard/schedule');
    return { success: true, message: `Successfully generated ${slotsToCreate.length} slots.` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to generate slots' };
  }
}

// 4. blockExistingSlots(doctorId, date, startTime, endTime, reason)
export async function blockExistingSlots(input: unknown) {
  try {
    await requireHospitalAccess('opd', 'manage_schedule');
    const validated = BlockSlotsSchema.parse(input);

    const block = await prisma.doctorSlotBlock.create({
      data: {
        doctorId: validated.doctorId,
        blockStart: new Date(validated.blockStart),
        blockEnd: new Date(validated.blockEnd),
        reason: validated.reason,
      },
    });

    revalidatePath('/hospital/dashboard/schedule');
    return { success: true, data: block };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to block slots' };
  }
}

// 5. getSlotsForDoctor(doctorId, startDate, endDate)
export async function getSlotsForDoctor(doctorId: string, startDate: string, endDate: string) {
  try {
    await requireHospitalAccess('opd', 'read');
    const start = new Date(startDate);
    const end = new Date(endDate);

    const slots = await prisma.doctorSlot.findMany({
      where: {
        doctorId,
        startTime: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { startTime: 'asc' },
    });

    const blocks = await prisma.doctorSlotBlock.findMany({
      where: {
        doctorId,
        blockStart: {
          gte: start,
        },
        blockEnd: {
          lte: end,
        },
      },
    });

    // Map blocks to check status later in UI if needed
    return { success: true, data: { slots, blocks } };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to retrieve slots' };
  }
}
