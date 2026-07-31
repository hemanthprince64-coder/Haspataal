export type RadiologyState =
  | 'ORDERED'
  | 'SCHEDULED'
  | 'ACCESSIONED'
  | 'IMAGE_ACQUIRED'
  | 'REPORT_DRAFTED'
  | 'REPORT_VERIFIED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RadiologyEvent =
  | { type: 'SCHEDULE'; timestamp: Date }
  | { type: 'ACCESSION'; accessionNumber: string }
  | { type: 'ACQUIRE_IMAGE'; seriesCount: number; imageCount: number }
  | { type: 'DRAFT_REPORT'; findings: string; impression: string }
  | { type: 'VERIFY_REPORT'; verifiedBy: string }
  | { type: 'COMPLETE' }
  | { type: 'CANCEL'; reason: string };

export class RadiologyStateMachine {
  private currentState: RadiologyState;

  constructor(initialState: RadiologyState = 'ORDERED') {
    this.currentState = initialState;
  }

  public getState(): RadiologyState {
    return this.currentState;
  }

  public transition(event: RadiologyEvent): void {
    const nextState = this.getNextState(this.currentState, event);
    if (!nextState) {
      throw new Error(`Invalid transition from ${this.currentState} with event ${event.type}`);
    }
    this.currentState = nextState;
  }

  private getNextState(state: RadiologyState, event: RadiologyEvent): RadiologyState | null {
    switch (state) {
      case 'ORDERED':
        if (event.type === 'SCHEDULE') return 'SCHEDULED';
        if (event.type === 'ACCESSION') return 'ACCESSIONED';
        if (event.type === 'CANCEL') return 'CANCELLED';
        break;

      case 'SCHEDULED':
        if (event.type === 'ACCESSION') return 'ACCESSIONED';
        if (event.type === 'CANCEL') return 'CANCELLED';
        break;

      case 'ACCESSIONED':
        if (event.type === 'ACQUIRE_IMAGE') return 'IMAGE_ACQUIRED';
        if (event.type === 'CANCEL') return 'CANCELLED';
        break;

      case 'IMAGE_ACQUIRED':
        if (event.type === 'DRAFT_REPORT') return 'REPORT_DRAFTED';
        if (event.type === 'CANCEL') return 'CANCELLED';
        break;

      case 'REPORT_DRAFTED':
        if (event.type === 'VERIFY_REPORT') return 'REPORT_VERIFIED';
        // A drafted report can also be re-drafted but we'll stick to verified for now
        break;

      case 'REPORT_VERIFIED':
        if (event.type === 'COMPLETE') return 'COMPLETED';
        break;

      case 'COMPLETED':
      case 'CANCELLED':
        // Terminal states
        return null;
    }
    return null;
  }
}
