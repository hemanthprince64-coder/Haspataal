import { RuleCompiler } from './compiler';
import { prisma } from '@haspataal/db';
export class ExecutionEngine {
    constructor() { }
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
                }
                catch (error) {
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
        }
        catch (error) {
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
            case 'complete_milestone':
                await this.completeMilestone(action.payload, context);
                break;
            case 'update_journey_risk':
                await this.updateJourneyRisk(action.payload, context);
                break;
        }
    }
    async createTimelineEvent(payload, context) {
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
    async sendNotification(payload, context) {
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
                }
            },
            processed: false,
        };
        await prisma.outboxEvent.create({
            data: outboxCommand,
        });
    }
    async updateRecord(payload, context) {
        // Implementation delegates to record update
        const { table, id, data } = payload;
        await prisma[table].update({
            where: { id },
            data,
        });
    }
    async callApi(payload, context) {
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
    async assignTask(payload, context) {
        // Implementation for task assignment
        await prisma.task.create({
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
    async escalate(payload, context) {
        await prisma.escalation.create({
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
        }, context);
    }
    async completeMilestone(payload, context) {
        const { milestoneId } = payload;
        if (!milestoneId)
            return;
        await prisma.journeyMilestone.update({
            where: { id: milestoneId },
            data: { status: 'COMPLETED', completedAt: new Date() },
        });
        await this.createTimelineEvent({
            eventType: 'MILESTONE_COMPLETED',
            title: 'Clinical Milestone Completed',
            severity: 'LOW',
            metadata: { milestoneId },
        }, context);
    }
    async updateJourneyRisk(payload, context) {
        const { journeyId, score, factors } = payload;
        if (!journeyId)
            return;
        await prisma.journeyRisk.upsert({
            where: { journeyId },
            update: { score, factors },
            create: { journeyId, score, factors },
        });
    }
    async logExecution(ruleId, context, status, actions, executionTimeMs, error) {
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
