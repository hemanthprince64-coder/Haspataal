import { prisma } from '@haspataal/db';
import { NotificationEngine } from '@haspataal/notify';
import { Queue } from 'bullmq';

import { JourneyTimelineIntegration } from './timeline';

// Setup Redis connection for Rules Engine Queue
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const rulesQueue = new Queue('rules-execution', { connection });
const notificationEngine = new NotificationEngine();

export class JourneyEngine {
  /**
   * Enrolls a patient in a care journey, creates stages/milestones,
   * logs to Timeline Engine, and triggers Rules Engine.
   */
  static async enroll(payload: {
    templateId: string;
    patientId: string;
    hospitalId?: string;
    careTeam?: any;
  }) {
    const template = await prisma.journeyTemplate.findUnique({
      where: { id: payload.templateId },
    });
    if (!template) throw new Error('Template not found');

    const instance = await prisma.journeyInstance.create({
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
    const stages = (template.stages as any)?.stages || [];
    const milestones = [];
    for (const stage of stages) {
      const milestone = await prisma.journeyMilestone.create({
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

    // 1. Log Journey Enrollment in Timeline Engine
    await prisma.timelineEvent.create({
      data: {
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
      },
    });

    // 2. Trigger Rules Engine
    await rulesQueue.add('rules-execution', {
      eventType: 'JOURNEY_ENROLLED',
      patientId: payload.patientId,
      hospitalId: payload.hospitalId,
      event: {
        journeyId: instance.id,
        templateName: template.name,
        category: template.category,
      },
    });

    return instance;
  }

  /**
   * Retrieves journey instances for a patient.
   */
  static async get(patientId: string) {
    return await prisma.journeyInstance.findMany({
      where: { patientId },
      include: { milestones: true, tasks: true },
    });
  }

  /**
   * Completes a milestone, logs to Timeline, and triggers Rules.
   */
  static async completeMilestone(milestoneId: string) {
    const milestone = await prisma.journeyMilestone.update({
      where: { id: milestoneId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { journey: true },
    });

    // 1. Log to Timeline Engine
    await JourneyTimelineIntegration.logMilestone(milestoneId, 'MILESTONE_COMPLETED');

    // 2. Trigger Rules Engine
    await rulesQueue.add('rules-execution', {
      eventType: 'MILESTONE_COMPLETED',
      patientId: milestone.journey.patientId,
      hospitalId: milestone.journey.hospitalId,
      event: {
        journeyId: milestone.journeyId,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        category: milestone.category,
      },
    });

    return milestone;
  }

  /**
   * Creates a care journey task, logs to Timeline, and triggers Rules.
   */
  static async createTask(payload: {
    journeyId: string;
    milestoneId?: string;
    name: string;
    category: string;
    assignedTo?: string;
    dueDate?: Date;
    priority?: string;
  }) {
    const journey = await prisma.journeyInstance.findUnique({
      where: { id: payload.journeyId },
    });
    if (!journey) throw new Error('Journey not found');

    const task = await prisma.journeyTask.create({
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

    // 1. Log task creation to Timeline Engine
    await prisma.timelineEvent.create({
      data: {
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
      },
    });

    // 2. Trigger Rules Engine
    await rulesQueue.add('rules-execution', {
      eventType: 'JOURNEY_TASK_CREATED',
      patientId: journey.patientId,
      hospitalId: journey.hospitalId,
      event: {
        journeyId: journey.id,
        taskId: task.id,
        taskName: task.name,
        category: task.category,
      },
    });

    return task;
  }

  /**
   * Completes a task, logs to Timeline, and triggers Rules.
   */
  static async completeTask(taskId: string) {
    const task = await prisma.journeyTask.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { journey: true },
    });

    // 1. Log task completion to Timeline Engine
    await prisma.timelineEvent.create({
      data: {
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
      },
    });

    // 2. Trigger Rules Engine
    await rulesQueue.add('rules-execution', {
      eventType: 'JOURNEY_TASK_COMPLETED',
      patientId: task.journey.patientId,
      hospitalId: task.journey.hospitalId,
      event: {
        journeyId: task.journeyId,
        taskId: task.id,
        taskName: task.name,
        category: task.category,
      },
    });

    return task;
  }

  /**
   * Sends a patient reminder notification via the Notification Engine.
   */
  static async sendPatientReminder(payload: {
    patientId: string;
    hospitalId?: string;
    recipient: string;
    body: string;
    channel?: 'SMS' | 'WHATSAPP' | 'EMAIL' | 'PUSH' | 'IN_APP';
    subject?: string;
    metadata?: Record<string, any>;
  }) {
    // Queue notification via NotificationEngine
    const response = await notificationEngine.enqueue({
      patientId: payload.patientId,
      hospitalId: payload.hospitalId,
      recipient: payload.recipient,
      body: payload.body,
      channel: payload.channel || 'SMS',
      priority: 'NORMAL',
      subject: payload.subject,
      metadata: payload.metadata,
    });

    // Log the reminder action to Timeline
    await prisma.timelineEvent.create({
      data: {
        patientId: payload.patientId,
        hospitalId: payload.hospitalId,
        eventType: 'PATIENT_REMINDER_SENT',
        category: 'NOTIFICATION',
        module: 'CARE_JOURNEY',
        title: `Reminder Sent: ${payload.subject || 'Care Update'}`,
        description: `Notification reminder queued via ${response.channel}.`,
        metadata: {
          recipient: payload.recipient,
          channel: response.channel,
          ...payload.metadata,
        },
      },
    });

    return response;
  }
}
