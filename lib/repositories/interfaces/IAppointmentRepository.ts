// ============================================================
// IAppointmentRepository — Contract for appointment data access
// ============================================================

import type { BookingStatus } from '@haspataal/types';

export interface CreateBookingInput {
  patientId: string;
  doctorId: string;
  date: Date;
  slot: string;
  status: string;
  hospitalId?: string;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  slot: string;
  status: string;
  hospitalId?: string | null;
  createdAt?: Date;
}

export interface IAppointmentRepository {
  /**
   * Find an existing booking for a specific doctor/date/slot combination.
   * Used for double-booking prevention.
   */
  findExistingBooking(
    doctorId: string,
    date: Date,
    slot: string,
    activeStatuses: string[],
  ): Promise<AppointmentRecord | null>;

  /**
   * Create a new appointment booking within an ACID transaction.
   * Should throw on unique constraint violation (P2002).
   */
  createBookingTransactional(
    ensurePatient: () => Promise<{ id: string }>,
    checkSlot: () => Promise<AppointmentRecord | null>,
    input: CreateBookingInput,
  ): Promise<AppointmentRecord>;

  /**
   * Find an appointment by ID, optionally scoped to a patient.
   */
  findByIdForPatient(appointmentId: string, patientId: string): Promise<AppointmentRecord | null>;

  /**
   * Update the status of an appointment.
   */
  updateStatus(appointmentId: string, newStatus: string): Promise<AppointmentRecord>;

  /**
   * Get all bookings for a given doctor on a given date with given statuses.
   * Used for slot availability calculation.
   */
  getBookedSlots(doctorId: string, date: Date, activeStatuses: string[]): Promise<string[]>;

  /**
   * Get all appointments for a patient, with doctor and patient details.
   */
  findByPatient(patientId: string): Promise<any[]>;
}
