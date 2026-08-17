// ============================================================
// GetAvailableSlotsUseCase — Slot availability calculation
// ============================================================

import { BookingStatus } from '../../../types';
import type { IAppointmentRepository } from '@/lib/repositories/interfaces/IAppointmentRepository';

export interface SlotInfo {
  time: string;
  available: boolean;
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
    const isToday = targetDate.getTime() === todayMidnight.getTime();

    // Fetch booked slots from repository
    const bookedSlots = await this.appointmentRepo.getBookedSlots(doctorId, targetDate, [
      BookingStatus.BOOKED,
      BookingStatus.CONFIRMED,
    ]);
    const bookedSet = new Set(bookedSlots);

    return ALL_SLOTS.map((time) => {
      let available = !bookedSet.has(time);

      // Filter out past slots for today
      if (isToday && available) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDateTime = new Date(targetDate);
        slotDateTime.setHours(hours, minutes, 0, 0);

        if (slotDateTime.getTime() <= now.getTime()) {
          available = false;
        }
      }

      return { time, available };
    });
  }
}