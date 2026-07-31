import { BookingStatus } from '@haspataal/types';

import type { IAppointmentRepository } from './IAppointmentRepository';

export interface SlotInfo {
  time: string;
  available: boolean;
  reason?: string;
}

// Standard clinic hours: 09:00 to 17:00, 30-min intervals
const ALL_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export class GetAvailableSlotsUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(doctorId: string, date: string): Promise<SlotInfo[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Domain Rule: Maximum booking window (30 days)
    const thirtyDaysFromNow = new Date(todayMidnight);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (targetDate.getTime() > thirtyDaysFromNow.getTime()) {
      throw new Error('Cannot book more than 30 days in advance.');
    }

    // Domain Rule: No booking in the past
    if (targetDate.getTime() < todayMidnight.getTime()) {
      throw new Error('Cannot book in the past.');
    }

    const isToday = targetDate.getTime() === todayMidnight.getTime();

    // Fetch booked slots from repository
    const bookedSlots = await this.appointmentRepo.getBookedSlots(doctorId, targetDate, [
      BookingStatus.BOOKED,
      BookingStatus.CONFIRMED,
      BookingStatus.CHECKED_IN,
      BookingStatus.IN_CONSULTATION,
    ]);
    const bookedSet = new Set(bookedSlots);

    return ALL_SLOTS.map((time) => {
      let available = !bookedSet.has(time);
      let reason: string | undefined;

      if (!available) {
        reason = 'Booked';
      }

      // Domain Rule: Minimum lead time (2 hours)
      // We apply this for today's slots.
      if (isToday && available) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDateTime = new Date(targetDate);
        slotDateTime.setHours(hours, minutes, 0, 0);

        const leadTimeMs = 2 * 60 * 60 * 1000; // 2 hours
        if (slotDateTime.getTime() <= now.getTime() + leadTimeMs) {
          available = false;
          reason = 'Lead time requirement not met (2 hours minimum)';
        }
      }

      return { time, available, reason };
    });
  }
}
