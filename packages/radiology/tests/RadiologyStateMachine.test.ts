import { describe, it, expect } from 'vitest';
import { RadiologyStateMachine } from '../src/domain/state-machine/RadiologyStateMachine';

describe('RadiologyStateMachine', () => {
  it('should initialize with ORDERED state', () => {
    const sm = new RadiologyStateMachine();
    expect(sm.getState()).toBe('ORDERED');
  });

  it('should transition from ORDERED to ACCESSIONED', () => {
    const sm = new RadiologyStateMachine();
    sm.transition({ type: 'ACCESSION', accessionNumber: '123' });
    expect(sm.getState()).toBe('ACCESSIONED');
  });

  it('should transition through the full happy path', () => {
    const sm = new RadiologyStateMachine();
    sm.transition({ type: 'SCHEDULE', timestamp: new Date() });
    expect(sm.getState()).toBe('SCHEDULED');

    sm.transition({ type: 'ACCESSION', accessionNumber: '123' });
    expect(sm.getState()).toBe('ACCESSIONED');

    sm.transition({ type: 'ACQUIRE_IMAGE', seriesCount: 2, imageCount: 100 });
    expect(sm.getState()).toBe('IMAGE_ACQUIRED');

    sm.transition({ type: 'DRAFT_REPORT', findings: 'Normal', impression: 'All good' });
    expect(sm.getState()).toBe('REPORT_DRAFTED');

    sm.transition({ type: 'VERIFY_REPORT', verifiedBy: 'Dr. Smith' });
    expect(sm.getState()).toBe('REPORT_VERIFIED');

    sm.transition({ type: 'COMPLETE' });
    expect(sm.getState()).toBe('COMPLETED');
  });

  it('should throw error on invalid transition', () => {
    const sm = new RadiologyStateMachine();
    expect(() => {
      sm.transition({ type: 'COMPLETE' });
    }).toThrowError(/Invalid transition/);
  });

  it('should allow cancellation from ORDERED', () => {
    const sm = new RadiologyStateMachine();
    sm.transition({ type: 'CANCEL', reason: 'Patient declined' });
    expect(sm.getState()).toBe('CANCELLED');
  });

  it('should not allow transition after CANCELLED', () => {
    const sm = new RadiologyStateMachine('CANCELLED');
    expect(() => {
      sm.transition({ type: 'SCHEDULE', timestamp: new Date() });
    }).toThrowError(/Invalid transition/);
  });
});
