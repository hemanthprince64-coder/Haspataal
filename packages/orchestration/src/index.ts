import { eventBus, DomainEvent } from '@haspataal/events';

// import { WorkflowEngine } from "@haspataal/workflows";
// import { DecisionEngine } from "@haspataal/decision-engine";

export class OrchestrationEngine {
  /**
   * Initializes the event listeners that coordinate the Autonomous Operations lifecycle.
   */
  static start() {
    eventBus.subscribe('PredictionGenerated', async (payload: DomainEvent) => {
      // Coordinate: Prediction -> Decision Engine
      console.log(
        `[Orchestrator] Prediction ${(payload.payload as any).insightId} generated. Routing to Decision Engine.`,
      );
    });

    eventBus.subscribe('DecisionCreated', async (payload: DomainEvent) => {
      // Coordinate: Decision -> Approval Platform
      console.log(
        `[Orchestrator] Decision ${(payload.payload as any).planId} created. Requesting Approval.`,
      );
    });

    eventBus.subscribe('ApprovalGranted', async (payload: DomainEvent) => {
      if ((payload.payload as any).targetType === 'DECISION_EXECUTION') {
        // Coordinate: Approval -> Workflow Engine
        console.log(
          `[Orchestrator] Approval granted for Decision ${(payload.payload as any).targetId}. Starting Workflow.`,
        );
      }
    });

    eventBus.subscribe('WorkflowCompleted', async (payload: DomainEvent) => {
      // Coordinate: Workflow -> Audit / Closure
      console.log(
        `[Orchestrator] Workflow ${(payload.payload as any).executionId} completed. Logging execution success.`,
      );
    });
  }
}
