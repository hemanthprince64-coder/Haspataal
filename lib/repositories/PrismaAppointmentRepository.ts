// ============================================================
// PrismaAppointmentRepository — Prisma implementation
// ============================================================

import prisma from '../prisma';
import type {
  IAppointmentRepository,
  AppointmentRecord,
  CreateBookingInput,
} from './interfaces/IAppointmentRepository';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findExistingBooking(
    doctorId: string,
    date: Date,
    slot: string,
    activeStatuses: string[]
  ): Promise<AppointmentRecord | null> {
    return prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        slot,
        status: { in: activeStatuses },
      },
    });
  }

  async createBookingTransactional(
    ensurePatient: () => Promise<{ id: string }>,
    checkSlot: () => Promise<AppointmentRecord | null>,
    input: CreateBookingInput
  ): Promise<AppointmentRecord> {
    return prisma.$transaction(async (tx) => {
      // 1. Ensure patient exists (delegated to caller for flexibility)
      const patient = await ensurePatient();

      // 2. Check slot availability within transaction snapshot
      const existing = await checkSlot();
      if (existing) {
        throw new Error(
          `SLOT_UNAVAILABLE: The slot ${input.slot} has already been booked.`
        );
      }

      // 3. Create the appointment — @@unique(doctorId, date, slot) constraint
      // acts as the final database-level lock against parallel inserts.
      return tx.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: input.doctorId,
          date: input.date,
          slot: input.slot,
          status: input.status,
        },
      });
    });
  }

  async findByIdForPatient(
    appointmentId: string,
    patientId: string
  ): Promise<AppointmentRecord | null> {
    return prisma.appointment.findFirst({
      where: { id: appointmentId, patientId },
    });
  }

  async updateStatus(
    appointmentId: string,
    newStatus: string
  ): Promise<AppointmentRecord> {
    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: newStatus },
    });
  }

  async getBookedSlots(
    doctorId: string,
    date: Date,
    activeStatuses: string[]
  ): Promise<string[]> {
    const bookings = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: { in: activeStatuses },
      },
      select: { slot: true },
    });
    return bookings.map((b) => b.slot);
  }

  async findByPatient(patientId: string): Promise<any[]> {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          include: {
            registration: true,
            affiliations: true,
          },
        },
        patient: true,
      },
      orderBy: { date: 'desc' },
    });
  }
}
