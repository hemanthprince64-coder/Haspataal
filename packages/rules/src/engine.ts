import { NotificationEngine } from '@haspataal/notify';

import { RuleCompiler } from './compiler';
import { Rule, Action, RuleContext, RuleResult } from './types';

export class ExecutionEngine {
  private prisma: any;
  private notificationEngine: NotificationEngine;

  constructor(prismaClient: any) {
    this.prisma = prismaClient;
    this.notificationEngine = new NotificationEngine();
  }

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
      case 'complete_milestone':
        await this.completeMilestone(action.payload, context);
        break;
      case 'update_journey_risk':
        await this.updateJourneyRisk(action.payload, context);
        break;
    }
  }

  private async createTimelineEvent(payload: any, context: RuleContext): Promise<void> {
    if (!context.patientId) {
      throw new Error('patientId required for timeline event creation');
    }

    await this.prisma.timelineEvent.create({
      data: {
        patientId: context.patientId,
        hospitalId: context.hospitalId,
        eventType: payload.eventType || 'RULE_TRIGGERED',
        category: payload.category || 'RULE',
        title: payload.title || 'Rule Action Executed',
        subtitle: payload.subtitle,
        summary: payload.summary,
        description: payload.description,
        severity: payload.severity || 'MEDIUM',
        priority: payload.priority || 5,
        tags: payload.tags || ['rule', context.patientId],
        metadata: {
          ...payload.metadata,
          triggeredByRule: true,
        },
      },
    });
  }

  private async sendNotification(payload: any, context: RuleContext): Promise<void> {
    await this.notificationEngine.enqueue({
      patientId: context.patientId || undefined,
      hospitalId: context.hospitalId || undefined,
      channel: payload.channel || 'SMS',
      priority: payload.priority || 'NORMAL',
      templateId: payload.templateId,
      recipient: payload.recipient || 'UNKNOWN',
      body: payload.body || 'Automated Rule Notification',
      variables: payload.variables,
      metadata: payload.metadata,
    });
  }

  private async updateRecord(payload: any, context: RuleContext): Promise<void> {
    // Implementation delegates to record update
    const { table, id, data } = payload;
    await this.prisma[table].update({
      where: { id },
      data,
    });
  }

  private async callApi(payload: any, context: RuleContext): Promise<void> {
    // Implementation for external API calls
    const response = await fetch(payload.url, {
      method: payload.method || 'POST',
      headers: payload.headers || {},
      body: payload.body ? JSON.stringify(payload.body) : undefined,
    });
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
  }

  private async assignTask(payload: any, context: RuleContext): Promise<void> {
    // Implementation for task assignment
    await this.prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description,
        assignedTo: payload.assignedTo,
        patientId: context.patientId,
        hospitalId: context.hospitalId,
        dueAt: payload.dueAt ? new Date(payload.dueAt) : undefined,
        status: 'PENDING',
      },
    });
  }

  private async escalate(payload: any, context: RuleContext): Promise<void> {
    await this.prisma.escalation.create({
      data: {
        level: payload.level || 'DOCTOR',
        reason: payload.reason,
        patientId: context.patientId,
        hospitalId: context.hospitalId,
        status: 'PENDING',
        metadata: payload.metadata,
      },
    });

    await this.createTimelineEvent(
      {
        eventType: 'ESCALATION_TRIGGERED',
        title: `Escalation: ${payload.reason}`,
        severity: 'HIGH',
        metadata: { level: payload.level },
      },
      context,
    );
  }

  private async completeMilestone(payload: any, context: RuleContext): Promise<void> {
    const { milestoneId } = payload;
    if (!milestoneId) return;

    await this.prisma.journeyMilestone.update({
      where: { id: milestoneId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await this.createTimelineEvent(
      {
        eventType: 'MILESTONE_COMPLETED',
        title: 'Clinical Milestone Completed',
        severity: 'LOW',
        metadata: { milestoneId },
      },
      context,
    );
  }

  private async updateJourneyRisk(payload: any, context: RuleContext): Promise<void> {
    const { journeyId, score, factors } = payload;
    if (!journeyId) return;

    await this.prisma.journeyRisk.upsert({
      where: { journeyId },
      update: { score, factors },
      create: { journeyId, score, factors },
    });
  }

  private async logExecution(
    ruleId: string,
    context: RuleContext,
    status: string,
    actions: Action[],
    executionTimeMs: number,
    error?: any,
  ): Promise<void> {
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
