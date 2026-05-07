import { prisma } from '@haspataal/db';
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { BookingStatus } from '@haspataal/types';

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findById(id: string): Promise<Appointment | null> {
    const data = await prisma.appointment.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async findBySlot(doctorId: string, date: Date, slot: string): Promise<Appointment | null> {
    const data = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        slot,
        status: { in: [BookingStatus.BOOKED, BookingStatus.CONFIRMED] },
      },
    });
    if (!data) return null;
    return this.mapToDomain(data);
  }

  async create(appointment: Appointment): Promise<Appointment> {
    const data = await prisma.appointment.create({
      data: {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        hospitalId: appointment.hospitalId,
        date: appointment.date,
        slot: appointment.slot,
        status: appointment.status,
      },
    });
    return this.mapToDomain(data);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<void> {
    await prisma.appointment.update({
      where: { id },
      data: { status },
    });
  }

  private mapToDomain(data: any): Appointment {
    return new Appointment(
      data.id,
      data.patientId,
      data.doctorId,
      data.hospitalId,
      data.date,
      data.slot,
      data.status as BookingStatus,
      data.notes || undefined
    );
  }
}
