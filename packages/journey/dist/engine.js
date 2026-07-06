"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyEngine = void 0;
const db_1 = require("@haspataal/db");
const uuid_1 = require("uuid");
class JourneyEngine {
    /**
     * Enrolls a patient in a care journey, creates stages/milestones,
     * and securely creates Outbox Events for Timeline Engine and Rules Engine.
     */
    static async enroll(payload) {
        const template = await db_1.prisma.journeyTemplate.findUnique({
            where: { id: payload.templateId },
        });
        if (!template)
            throw new Error('Template not found');
        const correlationId = (0, uuid_1.v4)();
        const hospitalId = payload.hospitalId || 'system';
        const result = await db_1.prisma.$transaction(async (tx) => {
            const instance = await tx.journeyInstance.create({
                data: {
                    templateId: payload.templateId,
                    patientId: payload.patientId,
                    hospitalId: payload.hospitalId,
                    currentStage: 'INITIAL',
                    status: 'ACTIVE',
                    startDate: new Date(),
                    careTeam: payload.careTeam ?? {},
                    riskScore: 0,
                },
            });
            // Create initial milestones from template
            const stages = template.stages?.stages || [];
            const milestones = [];
            for (const stage of stages) {
                const milestone = await tx.journeyMilestone.create({
                    data: {
                        journeyId: instance.id,
                        name: stage.name,
                        category: stage.category || 'CLINICAL',
                        status: 'PENDING',
                        dueDate: stage.dueDate ? new Date(stage.dueDate) : undefined,
                    },
                });
                milestones.push(milestone);
            }
            // 1. Log Journey Enrollment in Timeline Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'ADD_TO_TIMELINE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'timeline',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `timeline-journey-enrolled-${instance.id}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: payload.patientId,
                            hospitalId: payload.hospitalId,
                            eventType: 'JOURNEY_ENROLLED',
                            category: 'CLINICAL',
                            module: 'CARE_JOURNEY',
                            title: `Enrolled in ${template.name}`,
                            subtitle: `Category: ${template.category}`,
                            description: `Patient enrolled in clinical care journey '${template.name}'.`,
                            entityType: 'JourneyInstance',
                            entityId: instance.id,
                            metadata: {
                                templateId: payload.templateId,
                                journeyId: instance.id,
                                milestonesCount: milestones.length,
                            },
                            timestamp: new Date(),
                        },
                    },
                    processed: false,
                }
            });
            // 2. Trigger Rules Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'EVALUATE_RULE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'rules',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `rules-journey-enrolled-${instance.id}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            eventType: 'JOURNEY_ENROLLED',
                            patientId: payload.patientId,
                            hospitalId: payload.hospitalId,
                            event: {
                                journeyId: instance.id,
                                templateName: template.name,
                                category: template.category,
                            },
                        }
                    },
                    processed: false,
                }
            });
            return instance;
        });
        return result;
    }
    /**
     * Retrieves journey instances for a patient.
     */
    static async get(patientId) {
        return await db_1.prisma.journeyInstance.findMany({
            where: { patientId },
            include: { milestones: true, tasks: true },
        });
    }
    /**
     * Completes a milestone, logs to Timeline, and triggers Rules using Outbox.
     */
    static async completeMilestone(milestoneId) {
        const correlationId = (0, uuid_1.v4)();
        return await db_1.prisma.$transaction(async (tx) => {
            const milestone = await tx.journeyMilestone.update({
                where: { id: milestoneId },
                data: { status: 'COMPLETED', completedAt: new Date() },
                include: { journey: true },
            });
            const hospitalId = milestone.journey.hospitalId || 'system';
            // 1. Log to Timeline Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'ADD_TO_TIMELINE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'timeline',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `timeline-milestone-${milestoneId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: milestone.journey.patientId,
                            hospitalId: milestone.journey.hospitalId,
                            eventType: 'MILESTONE_COMPLETED',
                            category: 'CLINICAL',
                            module: 'CARE_JOURNEY',
                            title: `Milestone ${milestone.name} Updated`,
                            subtitle: `Care Journey Event: MILESTONE_COMPLETED`,
                            description: `Journey milestone '${milestone.name}' reached status: ${milestone.status}`,
                            entityType: 'JourneyMilestone',
                            entityId: milestoneId,
                            metadata: {
                                journeyId: milestone.journeyId,
                                milestoneName: milestone.name,
                                milestoneStatus: milestone.status,
                                updatedAt: new Date().toISOString(),
                            },
                            timestamp: new Date(),
                        }
                    },
                    processed: false,
                }
            });
            // 2. Trigger Rules Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'EVALUATE_RULE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'rules',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `rules-milestone-${milestoneId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            eventType: 'MILESTONE_COMPLETED',
                            patientId: milestone.journey.patientId,
                            hospitalId: milestone.journey.hospitalId,
                            event: {
                                journeyId: milestone.journeyId,
                                milestoneId: milestone.id,
                                milestoneName: milestone.name,
                                category: milestone.category,
                            }
                        }
                    },
                    processed: false,
                }
            });
            return milestone;
        });
    }
    /**
     * Creates a care journey task, logs to Timeline, and triggers Rules using Outbox.
     */
    static async createTask(payload) {
        const journey = await db_1.prisma.journeyInstance.findUnique({
            where: { id: payload.journeyId },
        });
        if (!journey)
            throw new Error('Journey not found');
        const correlationId = (0, uuid_1.v4)();
        const hospitalId = journey.hospitalId || 'system';
        return await db_1.prisma.$transaction(async (tx) => {
            const task = await tx.journeyTask.create({
                data: {
                    journeyId: payload.journeyId,
                    milestoneId: payload.milestoneId,
                    name: payload.name,
                    category: payload.category,
                    assignedTo: payload.assignedTo,
                    dueDate: payload.dueDate,
                    priority: payload.priority || 'NORMAL',
                    status: 'PENDING',
                },
            });
            // 1. Log task creation to Timeline Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'ADD_TO_TIMELINE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'timeline',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `timeline-task-created-${task.id}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: journey.patientId,
                            hospitalId: journey.hospitalId,
                            eventType: 'JOURNEY_TASK_CREATED',
                            category: 'CLINICAL',
                            module: 'CARE_JOURNEY',
                            title: `Task Created: ${task.name}`,
                            subtitle: `Category: ${task.category}`,
                            description: `New care journey task '${task.name}' assigned.`,
                            entityType: 'JourneyTask',
                            entityId: task.id,
                            metadata: {
                                journeyId: payload.journeyId,
                                taskId: task.id,
                                milestoneId: payload.milestoneId,
                            },
                            timestamp: new Date(),
                        }
                    },
                    processed: false,
                }
            });
            // 2. Trigger Rules Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'EVALUATE_RULE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'rules',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `rules-task-created-${task.id}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            eventType: 'JOURNEY_TASK_CREATED',
                            patientId: journey.patientId,
                            hospitalId: journey.hospitalId,
                            event: {
                                journeyId: journey.id,
                                taskId: task.id,
                                taskName: task.name,
                                category: task.category,
                            },
                        }
                    },
                    processed: false,
                }
            });
            return task;
        });
    }
    /**
     * Completes a task, logs to Timeline, and triggers Rules using Outbox.
     */
    static async completeTask(taskId) {
        const correlationId = (0, uuid_1.v4)();
        return await db_1.prisma.$transaction(async (tx) => {
            const task = await tx.journeyTask.update({
                where: { id: taskId },
                data: { status: 'COMPLETED', completedAt: new Date() },
                include: { journey: true },
            });
            const hospitalId = task.journey.hospitalId || 'system';
            // 1. Log task completion to Timeline Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'ADD_TO_TIMELINE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'timeline',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `timeline-task-completed-${taskId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: task.journey.patientId,
                            hospitalId: task.journey.hospitalId,
                            eventType: 'JOURNEY_TASK_COMPLETED',
                            category: 'CLINICAL',
                            module: 'CARE_JOURNEY',
                            title: `Task Completed: ${task.name}`,
                            subtitle: `Category: ${task.category}`,
                            description: `Care journey task '${task.name}' completed.`,
                            entityType: 'JourneyTask',
                            entityId: task.id,
                            metadata: {
                                journeyId: task.journeyId,
                                taskId: task.id,
                                milestoneId: task.milestoneId,
                            },
                            timestamp: new Date(),
                        }
                    },
                    processed: false,
                }
            });
            // 2. Trigger Rules Engine via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'EVALUATE_RULE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'rules',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `rules-task-completed-${taskId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            eventType: 'JOURNEY_TASK_COMPLETED',
                            patientId: task.journey.patientId,
                            hospitalId: task.journey.hospitalId,
                            event: {
                                journeyId: task.journeyId,
                                taskId: task.id,
                                taskName: task.name,
                                category: task.category,
                            },
                        }
                    },
                    processed: false,
                }
            });
            return task;
        });
    }
    /**
     * Sends a patient reminder notification via Outbox (Notification Engine).
     */
    static async sendPatientReminder(payload) {
        const correlationId = (0, uuid_1.v4)();
        const hospitalId = payload.hospitalId || 'system';
        return await db_1.prisma.$transaction(async (tx) => {
            // Create SEND_NOTIFICATION_COMMAND via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'SEND_NOTIFICATION_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'notify',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `notify-reminder-${correlationId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: payload.patientId,
                            hospitalId: payload.hospitalId,
                            recipient: payload.recipient,
                            body: payload.body,
                            channel: payload.channel || 'SMS',
                            priority: 'NORMAL',
                            subject: payload.subject,
                            metadata: payload.metadata,
                        }
                    },
                    processed: false,
                }
            });
            // Log the reminder action to Timeline via Outbox
            await tx.outboxEvent.create({
                data: {
                    id: (0, uuid_1.v4)(),
                    eventType: 'ADD_TO_TIMELINE_COMMAND',
                    payload: {
                        commandId: (0, uuid_1.v4)(),
                        commandVersion: 1,
                        target: 'timeline',
                        tenantContext: { hospitalId, branchId: 'default' },
                        actorContext: { actorId: 'system', actorType: 'SYSTEM' },
                        correlationId,
                        idempotencyKey: `timeline-reminder-${correlationId}`,
                        timestamp: new Date().toISOString(),
                        payload: {
                            patientId: payload.patientId,
                            hospitalId: payload.hospitalId,
                            eventType: 'PATIENT_REMINDER_SENT',
                            category: 'NOTIFICATION',
                            module: 'CARE_JOURNEY',
                            title: `Reminder Sent: ${payload.subject || 'Care Update'}`,
                            description: `Notification reminder queued via ${payload.channel || 'SMS'}.`,
                            metadata: {
                                recipient: payload.recipient,
                                channel: payload.channel || 'SMS',
                                ...payload.metadata,
                            },
                            timestamp: new Date(),
                        }
                    },
                    processed: false,
                }
            });
            return { success: true, channel: payload.channel || 'SMS' };
        });
    }
}
exports.JourneyEngine = JourneyEngine;
