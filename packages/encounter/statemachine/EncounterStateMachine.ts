import { EncounterStatus } from '@haspataal/types';

export class EncounterStateMachine {
  private static readonly TRANSITIONS: Record<string, EncounterStatus[]> = {
    [EncounterStatus.ACTIVE]: [
      EncounterStatus.TRIAGE,
      EncounterStatus.CONSULTATION,
      EncounterStatus.COMPLETED,
      EncounterStatus.CANCELLED,
    ],
    [EncounterStatus.TRIAGE]: [
      EncounterStatus.CONSULTATION,
      EncounterStatus.COMPLETED,
      EncounterStatus.CANCELLED,
    ],
    [EncounterStatus.CONSULTATION]: [EncounterStatus.COMPLETED, EncounterStatus.CANCELLED],
    [EncounterStatus.COMPLETED]: [],
    [EncounterStatus.CANCELLED]: [],
  };

  static validateTransition(currentStatus: EncounterStatus, targetStatus: EncounterStatus): void {
    if (currentStatus === targetStatus) return;

    const allowedTransitions = this.TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      throw new Error(
        `Invalid Encounter State Transition: Cannot move from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  static isEditable(status: EncounterStatus): boolean {
    return status !== EncounterStatus.COMPLETED && status !== EncounterStatus.CANCELLED;
  }
}
