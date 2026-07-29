export {
  BookAppointmentUseCase,
  SlotUnavailableError,
  ConcurrencyError,
} from './BookAppointmentUseCase';
export type { BookAppointmentInput, BookAppointmentResult } from './BookAppointmentUseCase';

export {
  CancelAppointmentUseCase,
  CancellationWindowError,
  InvalidTransitionError,
} from './CancelAppointmentUseCase';
export type { CancelAppointmentInput } from './CancelAppointmentUseCase';

export { GetAvailableSlotsUseCase } from './GetAvailableSlotsUseCase';
export type { SlotInfo } from './GetAvailableSlotsUseCase';