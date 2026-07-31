import { prisma } from '@haspataal/db';
import { BookingStatus } from '@haspataal/types';

import { Appointment } from '../lib/Appointment';
import { IAppointmentRepository } from '../lib/IAppointmentRepository';

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

  async getBookedSlots(doctorId: string, date: Date, statuses: BookingStatus[]): Promise<string[]> {
    const data = await prisma.appointment.findMany({
      where: {
        doctorId,
        date,
        status: { in: statuses },
      },
      select: { slot: true },
    });
    return data.map((d: any) => d.slot);
  }

  async create(appointment: Appointment): Promise<Appointment> {
    try {
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
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('SLOT_ALREADY_TAKEN');
      }
      throw error;
    }
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
      data.notes || undefined,
    );
  }
}
