// Outbox
export { OutboxService } from './domain/outbox/service';

// History
export * from './domain/history/patientHistoryService';

// Scheduling - Note: if scheduling causes a cycle later, it should be removed too. But it wasn't in package.json. Wait, I should just leave Outbox and History, the true core services.
// Note: Pharmacy, Laboratory, Radiology, etc., imports are removed to prevent cyclic dependencies.

// State Machine
export * from './domain/state-machine/BaseStateMachine';
