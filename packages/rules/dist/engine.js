import { prisma } from '@haspataal/db';
import { RuleCompiler } from './compiler';
export class ExecutionEngine {
    constructor() { }
    async execute(rule, context, tx) {
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
                    await this.executeAction(action, context, tx);
                    executedActions.push(action);
                }
                catch (error) {
                    errors.push(`Action ${action.type} failed: ${error.message}`);
                }
            }
            const executionTimeMs = Date.now() - startTime;
            await this.logExecution(rule.id, context, 'SUCCESS', executedActions, executionTimeMs, undefined, tx);
            return {
                success: errors.length === 0,
                executedActions,
                errors: errors.length ? errors : undefined,
            };
        }
        catch (error) {
            await this.logExecution(rule.id, context, 'FAILED', [], 0, { message: error.message }, tx);
            return { success: false, executedActions, errors: [error.message] };
        }
    }
    async executeAction(action, context, tx) {
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
    async createTimelineEvent(payload, context, tx) {
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
            metadata: Object.assign(Object.assign({}, payload.metadata), { triggeredByRule: true }),
            timestamp: new Date(),
        });
    }
    async sendNotification(payload, context, tx) {
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
    async updateRecord(payload, context, tx) {
        // Implementation delegates to record update
        const { table, id, data } = payload;
        const db = tx || prisma;
        await db[table].update({
            where: { id },
            data,
        });
    }
    async callApi(payload, context, tx) {
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
    async assignTask(payload, context, tx) {
        // Implementation for task assignment
        const db = tx || prisma;
        await db.task.create({
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
    async escalate(payload, context, tx) {
        const db = tx || prisma;
        await db.escalation.create({
            data: {
                level: payload.level || 'DOCTOR',
                reason: payload.reason,
                patientId: context.patientId,
                hospitalId: context.hospitalId,
                status: 'PENDING',
                metadata: payload.metadata,
            },
        });
        await this.createTimelineEvent({
            eventType: 'ESCALATION_TRIGGERED',
            title: `Escalation: ${payload.reason}`,
            severity: 'HIGH',
            metadata: { level: payload.level },
        }, context, tx);
    }
    async completeMilestone(payload, context, tx) {
        const { milestoneId } = payload;
        if (!milestoneId)
            return;
        const db = tx || prisma;
        await db.journeyMilestone.update({
            where: { id: milestoneId },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        await this.createTimelineEvent({
            eventType: 'MILESTONE_COMPLETED',
            title: 'Clinical Milestone Completed',
            severity: 'LOW',
            metadata: { milestoneId },
        }, context, tx);
    }
    async updateJourneyRisk(payload, context, tx) {
        const { journeyId, score, factors } = payload;
        if (!journeyId)
            return;
        const db = tx || prisma;
        await db.journeyRisk.upsert({
            where: { journeyId },
            update: { score, factors },
            create: { journeyId, score, factors },
        });
    }
    async logExecution(ruleId, context, status, actions, executionTimeMs, error, tx) {
        const db = tx || prisma;
        await db.ruleExecution.create({
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
