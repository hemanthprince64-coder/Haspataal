import { AppointmentStatus } from '@haspataal/db';

export class ConsultationStateMachine {
  // Valid transitions mapping: Current State -> Array of Allowed Next States
  private static readonly transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
    [AppointmentStatus.AWAITING_PAYMENT]: [AppointmentStatus.BOOKED, AppointmentStatus.CANCELLED],
    [AppointmentStatus.BOOKED]: [
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ],
    [AppointmentStatus.PENDING_CONFIRMATION]: [
      AppointmentStatus.BOOKED,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.CONFIRMED]: [
      AppointmentStatus.CHECKED_IN,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.NO_SHOW,
    ],
    [AppointmentStatus.CHECKED_IN]: [
      AppointmentStatus.IN_CONSULTATION,
      AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.IN_CONSULTATION]: [AppointmentStatus.COMPLETED],
    [AppointmentStatus.COMPLETED]: [],
    [AppointmentStatus.FOLLOW_UP]: [],
    [AppointmentStatus.CANCELLED]: [],
    [AppointmentStatus.NO_SHOW]: [],
    [AppointmentStatus.REJECTED]: [],
    [AppointmentStatus.EXPIRED]: [],
    [AppointmentStatus.RESCHEDULE_REQUESTED]: [],
    [AppointmentStatus.RESCHEDULE_ACCEPTED]: [],
    [AppointmentStatus.RESCHEDULE_DECLINED]: [],
  };

  /**
   * Validates if a transition from currentState to targetState is allowed.
   * Throws an error if invalid.
   */
  public static validateTransition(
    currentState: AppointmentStatus,
    targetState: AppointmentStatus,
  ): void {
    const allowedNextStates = this.transitions[currentState];

    if (!allowedNextStates) {
      throw new Error(`Invalid current state: ${currentState}`);
    }

    if (!allowedNextStates.includes(targetState)) {
      throw new Error(
        `INVALID_STATE_TRANSITION: Cannot transition from ${currentState} to ${targetState}`,
      );
    }
  }
}
