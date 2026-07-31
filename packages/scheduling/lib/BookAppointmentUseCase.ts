import { Appointment } from './Appointment';
import { IAppointmentRepository } from './IAppointmentRepository';

export interface BookAppointmentRequest {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  date: Date;
  slot: string;
}

export class BookAppointmentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(request: BookAppointmentRequest): Promise<Appointment> {
    const targetDate = new Date(request.date);
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

    if (isToday) {
      const [hours, minutes] = request.slot.split(':').map(Number);
      const slotDateTime = new Date(targetDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      const leadTimeMs = 2 * 60 * 60 * 1000; // 2 hours
      if (slotDateTime.getTime() <= now.getTime() + leadTimeMs) {
        throw new Error('Lead time requirement not met (2 hours minimum)');
      }
    }

    const appointment = Appointment.create({
      patientId: request.patientId,
      doctorId: request.doctorId,
      hospitalId: request.hospitalId,
      date: targetDate,
      slot: request.slot,
    });

    // The repository's `create` method relies on Prisma's unique constraint
    // (doctorId, date, slot) to throw 'SLOT_ALREADY_TAKEN' on concurrent bookings,
    // ensuring transactional safety.
    return await this.appointmentRepo.create(appointment);
  }
}
