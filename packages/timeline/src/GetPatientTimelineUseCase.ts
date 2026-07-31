import { prisma } from '@haspataal/db';
import {
  ClinicalTimelineEvent,
  TimelineCategory,
  TimelineEventType,
  UserRole,
} from '@haspataal/types';

export interface TimelineQueryOptions {
  patientId: string;
  hospitalId?: string;
  limit?: number;
  category?: TimelineCategory;
}

export class GetPatientTimelineUseCase {
  async execute(options: TimelineQueryOptions): Promise<ClinicalTimelineEvent[]> {
    const { patientId, hospitalId, limit = 50, category } = options;

    const where: any = {
      entityId: patientId, // Assuming EventLog stores patientId as entityId or in payload
      // Alternatively, we query events where payload->>'patientId' = patientId
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    // In a real implementation, we'd query the EventLog table.
    // For now, we use Prisma's raw query to filter by JSON payload if needed.
    // Assuming EventLog has: id, hospitalId, type, payload, createdAt, createdBy

    // Example query using Prisma raw since we might need to filter inside JSON payload
    // Or we use Prisma's standard findMany if patientId is a direct column.
    // Let's assume EventLog has a structured schema in Prisma.

    const events = await prisma.eventLog.findMany({
      where: {
        payload: {
          path: ['patientId'],
          equals: patientId,
        },
        ...(hospitalId && { hospitalId }),
        // We might need to map category to event types, but let's fetch all and filter for MVP
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Map EventLog entries to ClinicalTimelineEvent
    return events.map((event) => this.mapToTimelineEvent(event));
  }

  private mapToTimelineEvent(event: any): ClinicalTimelineEvent {
    // Map event type to category and severity
    const category = this.determineCategory(event.type);
    const severity = this.determineSeverity(event.type);

    return {
      id: event.id,
      patientId: event.payload?.patientId || event.aggregateId, // Fallback if needed
      visitId: event.payload?.visitId,
      encounterId: event.encounterId || event.payload?.encounterId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      schemaVersion: event.schemaVersion || 1,
      timestamp: event.createdAt,
      eventType: event.type as TimelineEventType,
      category,
      severity,
      title: this.generateTitle(event.type),
      summary: this.generateSummary(event.payload),
      actor: {
        id: event.createdBy || 'system',
        name: event.payload?.actorName || 'System',
        role: (event.payload?.actorRole as UserRole) || UserRole.STAFF,
      },
      payload: event.payload as Record<string, unknown>,
    };
  }

  private determineCategory(eventType: string): TimelineCategory {
    switch (eventType) {
      case 'VISIT_BOOKED':
        return TimelineCategory.BOOKING;
      case 'PATIENT_CHECKED_IN':
        return TimelineCategory.TRIAGE;
      case 'CONSULTATION_STARTED':
      case 'CONSULTATION_COMPLETED':
        return TimelineCategory.CONSULTATION;
      case 'VITALS_RECORDED':
        return TimelineCategory.TRIAGE;
      case 'DIAGNOSIS_ADDED':
        return TimelineCategory.DIAGNOSIS;
      case 'PRESCRIPTION_CREATED':
        return TimelineCategory.PRESCRIPTION;
      case 'INVESTIGATION_REQUESTED':
        return TimelineCategory.INVESTIGATION;
      case 'FOLLOWUP_SCHEDULED':
        return TimelineCategory.FOLLOWUP;
      default:
        return TimelineCategory.SYSTEM;
    }
  }

  private determineSeverity(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (eventType === 'ALERT_TRIGGERED') return 'HIGH';
    return 'LOW';
  }

  private generateTitle(eventType: string): string {
    return eventType
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  private generateSummary(payload: any): string {
    if (payload?.summary) return payload.summary;
    if (payload?.notes) return payload.notes;
    return 'Details unavailable';
  }
}
