import { prisma } from '@haspataal/db';
import { NotificationEngine } from '@haspataal/notify';

import { RuleCompiler } from './compiler';
import { Rule, Action, RuleContext, RuleResult } from './types';

export class ExecutionEngine {
  constructor() {}

  async execute(rule: Rule, context: RuleContext, tx?: any): Promise<RuleResult> {
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
          await this.executeAction(action, context, tx);
          executedActions.push(action);
        } catch (error: any) {
          errors.push(`Action ${action.type} failed: ${error.message}`);
        }
      }

      const executionTimeMs = Date.now() - startTime;
      await this.logExecution(
        rule.id,
        context,
        'SUCCESS',
        executedActions,
        executionTimeMs,
        undefined,
        tx,
      );

      return {
        success: errors.length === 0,
        executedActions,
        errors: errors.length ? errors : undefined,
      };
    } catch (error: any) {
      await this.logExecution(rule.id, context, 'FAILED', [], 0, { message: error.message }, tx);
      return { success: false, executedActions, errors: [error.message] };
    }
  }

  private async executeAction(action: Action, context: RuleContext, tx?: any): Promise<void> {
    switch (action.type) {
      case 'create_timeline':
        await this.createTimelineEvent(action.payload, context, tx);
        break;
      case 'send_notification':
        await this.sendNotification(action.payload, context, tx);
        break;
      case 'update_record':
        await this.updateRecord(action.payload, context, tx);
        break;
      case 'call_api':
        await this.callApi(action.payload, context, tx);
        break;
      case 'assign_task':
        await this.assignTask(action.payload, context, tx);
        break;
      case 'escalate':
        await this.escalate(action.payload, context, tx);
        break;
      case 'complete_milestone':
        await this.completeMilestone(action.payload, context, tx);
        break;
      case 'update_journey_risk':
        await this.updateJourneyRisk(action.payload, context, tx);
        break;
    }
  }

  private async createTimelineEvent(payload: any, context: RuleContext, tx?: any): Promise<void> {
    if (!context.patientId) {
      throw new Error('patientId required for timeline event creation');
    }

    const { getTimelinePublisher } = await import('@haspataal/timeline');

    await getTimelinePublisher().publish({
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
      timestamp: new Date(),
    });
  }

  private async sendNotification(payload: any, context: RuleContext, tx?: any): Promise<void> {
    const { randomUUID } = await import('crypto');
    const { createPlatformCommandSchema } = await import('@haspataal/platform-contracts');

    // Wave 6: Write PlatformCommand to Outbox instead of synchronous execution
    const commandId = randomUUID();
    const commandPayload = {
      patientId: context.patientId || undefined,
      hospitalId: context.hospitalId || undefined,
      channel: payload.channel || 'SMS',
      priority: payload.priority || 'NORMAL',
      templateId: payload.templateId,
      recipient: payload.recipient || 'UNKNOWN',
      body: payload.body || 'Automated Rule Notification',
      variables: payload.variables,
      metadata: payload.metadata,
    };

    const outboxCommand = {
      id: commandId,
      eventType: 'SEND_NOTIFICATION_COMMAND',
      payload: {
        commandPayload,
        metadata: {
          aggregateType: 'NotificationEngine',
          aggregateId: commandId,
          traceId: randomUUID(),
          tenantId: context.hospitalId,
        },
      },
      processed: false,
    };

    const db = tx || prisma;
    await db.outboxEvent.create({
      data: outboxCommand,
    });
  }

  private async updateRecord(payload: any, context: RuleContext, tx?: any): Promise<void> {
    // Implementation delegates to record update
    const { table, id, data } = payload;
    const db = tx || prisma;
    await (db as any)[table].update({
      where: { id },
      data,
    });
  }

  private async callApi(payload: any, context: RuleContext, tx?: any): Promise<void> {
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

  private async assignTask(payload: any, context: RuleContext, tx?: any): Promise<void> {
    // Implementation for task assignment
    const db = tx || prisma;
    await (db as any).task.create({
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

  private async escalate(payload: any, context: RuleContext, tx?: any): Promise<void> {
    const db = tx || prisma;
    await (db as any).escalation.create({
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
      tx,
    );
  }

  private async completeMilestone(payload: any, context: RuleContext, tx?: any): Promise<void> {
    const { milestoneId } = payload;
    if (!milestoneId) return;

    const db = tx || prisma;
    await db.journeyMilestone.update({
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
      tx,
    );
  }

  private async updateJourneyRisk(payload: any, context: RuleContext, tx?: any): Promise<void> {
    const { journeyId, score, factors } = payload;
    if (!journeyId) return;

    const db = tx || prisma;
    await db.journeyRisk.upsert({
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
    tx?: any,
  ): Promise<void> {
    const db = tx || prisma;
    await db.ruleExecution.create({
      data: {
        ruleId,
        patientId: context.patientId,
        hospitalId: context.hospitalId,
        triggeredBy: 'EVENT',
        status,
        resultJson: actions as any,
        errorJson: error as any,
        executionTimeMs,
      },
    });
  }
}
