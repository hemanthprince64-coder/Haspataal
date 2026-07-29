import { BookingStatus } from '@haspataal/types';

export class Appointment {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly doctorId: string,
    public readonly hospitalId: string,
    public readonly date: Date,
    public readonly slot: string,
    private _status: BookingStatus,
    public readonly notes?: string,
  ) {}

  get status(): BookingStatus {
    return this._status;
  }

  static create(props: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    date: Date;
    slot: string;
  }): Appointment {
    if (props.date < new Date()) {
      throw new Error('CANNOT_BOOK_IN_PAST');
    }

    return new Appointment(
      '',
      props.patientId,
      props.doctorId,
      props.hospitalId,
      props.date,
      props.slot,
      BookingStatus.AWAITING_PAYMENT,
    );
  }

  confirm(): void {
    if (this._status !== BookingStatus.AWAITING_PAYMENT) {
      throw new Error('INVALID_TRANSITION');
    }
    this._status = BookingStatus.BOOKED;
  }

  cancel(reason: string): void {
    if (this._status === BookingStatus.BOOKED && !reason) {
      throw new Error('CANCEL_REASON_REQUIRED_FOR_BOOKED_APPOINTMENT');
    }

    if (this._status === BookingStatus.COMPLETED || this._status === BookingStatus.CANCELLED) {
      throw new Error('CANNOT_CANCEL_FINALIZED_APPOINTMENT');
    }

    this._status = BookingStatus.CANCELLED;
  }
}