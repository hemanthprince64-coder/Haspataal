import { ClinicalOrderStatus } from '@haspataal/types';

export class ClinicalOrderStateMachine {
  private static readonly TRANSITIONS: Record<string, ClinicalOrderStatus[]> = {
    [ClinicalOrderStatus.ORDERED]: [
      ClinicalOrderStatus.ACCEPTED,
      ClinicalOrderStatus.CANCELLED,
      ClinicalOrderStatus.REJECTED,
    ],
    [ClinicalOrderStatus.ACCEPTED]: [
      ClinicalOrderStatus.SCHEDULED,
      ClinicalOrderStatus.IN_PROGRESS,
      ClinicalOrderStatus.CANCELLED,
    ],
    [ClinicalOrderStatus.SCHEDULED]: [
      ClinicalOrderStatus.IN_PROGRESS,
      ClinicalOrderStatus.CANCELLED,
    ],
    [ClinicalOrderStatus.IN_PROGRESS]: [
      ClinicalOrderStatus.VERIFIED,
      ClinicalOrderStatus.COMPLETED,
      ClinicalOrderStatus.CANCELLED,
    ],
    [ClinicalOrderStatus.VERIFIED]: [ClinicalOrderStatus.COMPLETED, ClinicalOrderStatus.CANCELLED],
    [ClinicalOrderStatus.COMPLETED]: [],
    [ClinicalOrderStatus.CANCELLED]: [],
    [ClinicalOrderStatus.REJECTED]: [],
  };

  static validateTransition(
    currentStatus: ClinicalOrderStatus,
    targetStatus: ClinicalOrderStatus,
  ): void {
    if (currentStatus === targetStatus) return;

    const allowedTransitions = this.TRANSITIONS[currentStatus];
    if (!allowedTransitions || !allowedTransitions.includes(targetStatus)) {
      throw new Error(
        `Invalid Clinical Order State Transition: Cannot move from ${currentStatus} to ${targetStatus}.`,
      );
    }
  }

  static isCompleted(status: ClinicalOrderStatus): boolean {
    return (
      status === ClinicalOrderStatus.COMPLETED ||
      status === ClinicalOrderStatus.CANCELLED ||
      status === ClinicalOrderStatus.REJECTED
    );
  }
}
