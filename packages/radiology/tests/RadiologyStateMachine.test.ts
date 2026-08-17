import { describe, it, expect } from 'vitest';

import { RadiologyStateMachine } from '../src/domain/state-machine/RadiologyStateMachine';

describe('RadiologyStateMachine', () => {
  it('should transition from ORDERED to ACCESSIONED', () => {
    expect(() => RadiologyStateMachine.validateTransition('ORDERED', 'ACCESSIONED')).not.toThrow();
  });

  it('should transition through the full happy path', () => {
    expect(() => RadiologyStateMachine.validateTransition('ORDERED', 'SCHEDULED')).not.toThrow();
    expect(() =>
      RadiologyStateMachine.validateTransition('SCHEDULED', 'ACCESSIONED'),
    ).not.toThrow();
    expect(() =>
      RadiologyStateMachine.validateTransition('ACCESSIONED', 'IMAGE_ACQUIRED'),
    ).not.toThrow();
    expect(() =>
      RadiologyStateMachine.validateTransition('IMAGE_ACQUIRED', 'REPORT_DRAFTED'),
    ).not.toThrow();
    expect(() =>
      RadiologyStateMachine.validateTransition('REPORT_DRAFTED', 'REPORT_VERIFIED'),
    ).not.toThrow();
    expect(() =>
      RadiologyStateMachine.validateTransition('REPORT_VERIFIED', 'COMPLETED'),
    ).not.toThrow();
  });

  it('should throw error on invalid transition', () => {
    expect(() => {
      RadiologyStateMachine.validateTransition('ORDERED', 'COMPLETED');
    }).toThrowError(/Invalid state transition/);
  });

  it('should allow cancellation from ORDERED', () => {
    expect(() => RadiologyStateMachine.validateTransition('ORDERED', 'CANCELLED')).not.toThrow();
  });

  it('should not allow transition after CANCELLED', () => {
    expect(() => {
      RadiologyStateMachine.validateTransition('CANCELLED', 'SCHEDULED');
    }).toThrowError(/Invalid state transition/);
  });
});
