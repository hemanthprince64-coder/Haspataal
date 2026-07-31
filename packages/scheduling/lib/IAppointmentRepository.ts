import { BookingStatus } from '@haspataal/types';

import { Appointment } from './Appointment';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findBySlot(doctorId: string, date: Date, slot: string): Promise<Appointment | null>;
  getBookedSlots(doctorId: string, date: Date, statuses: BookingStatus[]): Promise<string[]>;
  create(appointment: Appointment): Promise<Appointment>;
  updateStatus(id: string, status: BookingStatus): Promise<void>;
}
