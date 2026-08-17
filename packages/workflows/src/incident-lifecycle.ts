import { WorkflowDefinition, WorkflowEngine } from './engine';

export type IncidentState =
  | 'DETECTED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'MITIGATED'
  | 'RESOLVED'
  | 'POSTMORTEM';

export type IncidentAction =
  | 'ASSIGN'
  | 'ACKNOWLEDGE'
  | 'MITIGATE'
  | 'RESOLVE'
  | 'COMPLETE_POSTMORTEM';

export const incidentLifecycleDefinition: WorkflowDefinition<IncidentState, IncidentAction> = {
  id: 'IncidentLifecycle',
  initialState: 'DETECTED',
  transitions: [
    { from: 'DETECTED', action: 'ASSIGN', to: 'ASSIGNED', domainEvent: 'IncidentAssigned' },
    {
      from: ['DETECTED', 'ASSIGNED'],
      action: 'ACKNOWLEDGE',
      to: 'ACKNOWLEDGED',
      domainEvent: 'IncidentAcknowledged',
    },
    {
      from: ['DETECTED', 'ASSIGNED', 'ACKNOWLEDGED'],
      action: 'MITIGATE',
      to: 'MITIGATED',
      domainEvent: 'IncidentMitigated',
    },
    {
      from: ['DETECTED', 'ASSIGNED', 'ACKNOWLEDGED', 'MITIGATED'],
      action: 'RESOLVE',
      to: 'RESOLVED',
      domainEvent: 'IncidentResolved',
    },
    {
      from: 'RESOLVED',
      action: 'COMPLETE_POSTMORTEM',
      to: 'POSTMORTEM',
      domainEvent: 'IncidentPostmortemCompleted',
    },
  ],
};

export const IncidentWorkflow = new WorkflowEngine<IncidentState, IncidentAction>(
  incidentLifecycleDefinition,
);
