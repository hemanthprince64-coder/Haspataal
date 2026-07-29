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
    const existing = await this.appointmentRepo.findBySlot(
      request.doctorId,
      request.date,
      request.slot
    );

    if (existing) {
      throw new Error('SLOT_ALREADY_TAKEN');
    }

    const appointment = Appointment.create({
      patientId: request.patientId,
      doctorId: request.doctorId,
      hospitalId: request.hospitalId,
      date: request.date,
      slot: request.slot,
    });

    return await this.appointmentRepo.create(appointment);
  }
}