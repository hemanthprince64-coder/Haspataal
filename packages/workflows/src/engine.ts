import { prisma } from '@haspataal/db';
import { EventBus } from '@haspataal/events';
import { v4 as uuidv4 } from 'uuid';

export interface WorkflowActor {
  id: string;
  role: string;
}

export interface TransitionResult<State> {
  success: boolean;
  previousState: State;
  newState: State;
  correlationId: string;
  error?: string;
}

export interface TransitionRule<State, Action> {
  from: State | State[];
  action: Action;
  to: State;
  domainEvent?: string; // Event emitted on success
}

export interface WorkflowDefinition<State, Action> {
  id: string; // e.g., 'HospitalLifecycle'
  initialState: State;
  transitions: TransitionRule<State, Action>[];
}

export class WorkflowEngine<State extends string, Action extends string> {
  constructor(private definition: WorkflowDefinition<State, Action>) {}

  private getRule(fromState: State, action: Action): TransitionRule<State, Action> | undefined {
    return this.definition.transitions.find((rule) => {
      const isFromMatch = Array.isArray(rule.from)
        ? rule.from.includes(fromState)
        : rule.from === fromState;
      return isFromMatch && rule.action === action;
    });
  }

  async transition(
    entityType: string,
    entityId: string,
    currentState: State,
    action: Action,
    reason: string,
    actor: WorkflowActor,
    metadata: Record<string, any>,
    expectedState: State,
    updateStateFn: (entityId: string, newState: State, tx: any) => Promise<void>,
  ): Promise<TransitionResult<State>> {
    const correlationId = uuidv4();
    const executionStartTime = Date.now();

    if (currentState !== expectedState) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        correlationId,
        error: `Expected state ${expectedState}, but entity is in ${currentState}`,
      };
    }

    const rule = this.getRule(currentState, action);
    if (!rule) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        correlationId,
        error: `Illegal transition: Action ${action} not allowed from state ${currentState}`,
      };
    }

    const newState = rule.to;

    try {
      // 1. Transactionally update state and log to Timeline + Audit + Metrics
      await prisma.$transaction(async (tx) => {
        // Find previous timeline event to calculate wait time
        const lastEvent = await tx.platformTimelineEvent.findFirst({
          where: { entityType, entityId, workflowId: this.definition.id },
          orderBy: { createdAt: 'desc' },
        });
        const waitTimeMs = lastEvent ? Date.now() - lastEvent.createdAt.getTime() : 0;

        // Update the actual entity state
        await updateStateFn(entityId, newState, tx);

        // Emit Timeline Event (Immutable Log)
        await tx.platformTimelineEvent.create({
          data: {
            entityType,
            entityId,
            eventType: rule.domainEvent || `TransitionedTo${newState}`,
            previousState: currentState,
            newState,
            actorId: actor.id,
            actorRole: actor.role,
            correlationId,
            workflowId: this.definition.id,
            metadata: {
              action,
              reason,
              ...metadata,
            },
          },
        });

        const executionTimeMs = Date.now() - executionStartTime;

        // Emit Workflow Metric
        await tx.workflowMetric.create({
          data: {
            workflowId: this.definition.id,
            instanceId: correlationId, // using correlationId as instanceId for this transition
            entityType,
            entityId,
            startedAt: new Date(executionStartTime),
            completedAt: new Date(),
            durationMs: waitTimeMs + executionTimeMs,
            waitTimeMs,
            executionTimeMs,
            manualIntervention: (actor.role as string) === 'PLATFORM_ADMIN',
            finalStatus: 'COMPLETED',
          },
        });

        // Emit standard Audit Log
        await tx.auditLog.create({
          data: {
            userId: actor.id,
            hospitalId: entityType === 'HOSPITAL' ? entityId : null,
            action: `WORKFLOW_TRANSITION_${action}`,
            entity: entityType,
            entityId,
            details: {
              workflowId: this.definition.id,
              previousState: currentState,
              newState,
              reason,
              correlationId,
              executionTimeMs,
            },
          },
        });
      });

      // 2. Publish Domain Event (Metrics, Notifications, Integrations)
      if (rule.domainEvent) {
        EventBus.getInstance().publish({
          id: uuidv4(),
          type: rule.domainEvent,
          occurredAt: new Date(),
          correlationId,
          causationId: 'platform-workflows',
          actor: {
            id: actor.id,
            type: actor.role,
          },
          hospitalId: entityType === 'HOSPITAL' ? entityId : undefined,
          version: 1,
          eventVersion: 1,
          schemaVersion: 1,
          aggregateId: entityId,
          aggregateType: entityType,
          payload: {
            entityType,
            entityId,
            workflowId: this.definition.id,
            previousState: currentState,
            newState,
            reason,
            ...metadata,
          },
        });
      }

      return {
        success: true,
        previousState: currentState,
        newState,
        correlationId,
      };
    } catch (error: any) {
      return {
        success: false,
        previousState: currentState,
        newState: currentState,
        correlationId,
        error: error.message,
      };
    }
  }
}
