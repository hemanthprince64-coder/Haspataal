import { RuleCompiler } from './compiler';

export class ExecutionEngine {
  constructor(prismaClient) {
    this.prisma = prismaClient;
  }
  async execute(rule, context) {
    const startTime = Date.now();
    const executedActions = [];
    const errors = [];
    try {
      const conditionsMet = RuleCompiler.evaluateAllConditions(rule.conditionJson, context);
      if (!conditionsMet) {
        return { success: true, executedActions, skipped: true };
      }
      for (const action of rule.actionJson) {
        try {
          await this.executeAction(action, context);
          executedActions.push(action);
        } catch (error) {
          errors.push(`Action ${action.type} failed: ${error.message}`);
        }
      }
      const executionTimeMs = Date.now() - startTime;
      await this.logExecution(rule.id, context, 'SUCCESS', executedActions, executionTimeMs);
      return {
        success: errors.length === 0,
        executedActions,
        errors: errors.length ? errors : undefined,
      };
    } catch (error) {
      await this.logExecution(rule.id, context, 'FAILED', [], 0, { message: error.message });
      return { success: false, executedActions, errors: [error.message] };
    }
  }
  async executeAction(action, context) {
    switch (action.type) {
      case 'create_timeline':
        await this.createTimelineEvent(action.payload, context);
        break;
      case 'send_notification':
        await this.sendNotification(action.payload, context);
        break;
      case 'update_record':
        await this.updateRecord(action.payload, context);
        break;
      case 'call_api':
        await this.callApi(action.payload, context);
        break;
      case 'assign_task':
        await this.assignTask(action.payload, context);
        break;
      case 'escalate':
        await this.escalate(action.payload, context);
        break;
    }
  }
  async createTimelineEvent(payload, context) {
    // Implementation delegates to TimelineEvent model
  }
  async sendNotification(payload, context) {
    // Implementation delegates to Notification engine
  }
  async updateRecord(payload, context) {
    // Implementation delegates to record update
  }
  async callApi(payload, context) {
    // Implementation for external API calls
  }
  async assignTask(payload, context) {
    // Implementation for task assignment
  }
  async escalate(payload, context) {
    // Implementation for escalation logic
  }
  async logExecution(ruleId, context, status, actions, executionTimeMs, error) {
    await this.prisma.ruleExecution.create({
      data: {
        ruleId,
        patientId: context.patientId,
        hospitalId: context.hospitalId,
        triggeredBy: 'EVENT',
        status,
        resultJson: actions,
        errorJson: error,
        executionTimeMs,
      },
    });
  }
}
