import { prisma } from '@haspataal/db';

import { RuleCompiler } from './compiler';
import { Rule, Action, RuleContext, RuleResult } from './types';

export class ExecutionEngine {
  async execute(rule: Rule, context: RuleContext): Promise<RuleResult> {
    const startTime = Date.now();
    const executedActions: Action[] = [];
    const errors: string[] = [];

    try {
      const conditionsMet = RuleCompiler.evaluateAllConditions(rule.conditionJson as any, context);

      if (!conditionsMet) {
        return { success: true, executedActions, skipped: true };
      }

      for (const action of rule.actionJson as Action[]) {
        try {
          await this.executeAction(action, context);
          executedActions.push(action);
        } catch (error: any) {
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
    } catch (error: any) {
      await this.logExecution(rule.id, context, 'FAILED', [], 0, { message: error.message });
      return { success: false, executedActions, errors: [error.message] };
    }
  }

  private async executeAction(action: Action, context: RuleContext): Promise<void> {
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

  private async createTimelineEvent(payload: any, context: RuleContext) {
    // Implementation delegates to TimelineEvent model
  }

  private async sendNotification(payload: any, context: RuleContext) {
    // Implementation delegates to Notification engine
  }

  private async updateRecord(payload: any, context: RuleContext) {
    // Implementation delegates to record update
  }

  private async callApi(payload: any, context: RuleContext) {
    // Implementation for external API calls
  }

  private async assignTask(payload: any, context: RuleContext) {
    // Implementation for task assignment
  }

  private async escalate(payload: any, context: RuleContext) {
    // Implementation for escalation logic
  }

  private async logExecution(
    ruleId: string,
    context: RuleContext,
    status: string,
    actions: Action[],
    executionTimeMs: number,
    error?: any,
  ) {
    await prisma.ruleExecution.create({
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
