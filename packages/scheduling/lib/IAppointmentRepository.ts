import { Appointment } from './Appointment';
import { BookingStatus } from '@haspataal/types';

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findBySlot(doctorId: string, date: Date, slot: string): Promise<Appointment | null>;
  create(appointment: Appointment): Promise<Appointment>;
  updateStatus(id: string, status: BookingStatus): Promise<void>;
}