import { Appointment } from '../entities/Appointment';
import { IAppointmentRepository } from '../repositories/IAppointmentRepository';

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
    // 1. Check for slot availability
    const existing = await this.appointmentRepo.findBySlot(
      request.doctorId,
      request.date,
      request.slot
    );

    if (existing) {
      throw new Error('SLOT_ALREADY_TAKEN');
    }

    // 2. Create domain entity (this enforces basic business rules like no past dates)
    const appointment = Appointment.create({
      patientId: request.patientId,
      doctorId: request.doctorId,
      hospitalId: request.hospitalId,
      date: request.date,
      slot: request.slot,
    });

    // 3. Persist
    return await this.appointmentRepo.create(appointment);
  }
}
