// ============================================================
// @haspataal/events - Event Bus Singleton (Redis Streams)
// ============================================================
import { Queue } from 'bullmq';
import { EventEmitter } from 'events';

export interface DomainEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  correlationId?: string;
  hospitalId?: string;
  actorId?: string;
  actorType?: string;
}

export type EventCallback = (event: DomainEvent) => Promise<void> | void;

export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private outboxQueue: Queue | null = null;

  private constructor() {
    super();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async initialize(redisUrl?: string): Promise<void> {
    if (redisUrl && process.env.REDIS_URL) {
      this.outboxQueue = new Queue('outbox', {
        connection: {
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      });
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    this.emit(event.type, event);

    if (this.outboxQueue) {
      await this.outboxQueue.add('event', {
        ...event,
        timestamp: event.timestamp.toISOString(),
      });
    }
  }

  subscribe(type: string, callback: EventCallback): void {
    this.on(type, callback);
  }

  unsubscribe(type: string, callback: EventCallback): void {
    this.off(type, callback);
  }
}

export const eventBus = EventBus.getInstance();

// Event Types
export const EVENT_TYPES = {
  PATIENT_REGISTERED: 'PatientRegistered',
  APPOINTMENT_BOOKED: 'AppointmentBooked',
  VISIT_STARTED: 'VisitStarted',
  VITALS_RECORDED: 'VitalsRecorded',
  PRESCRIPTION_CREATED: 'PrescriptionCreated',
  INVESTIGATION_ORDERED: 'InvestigationOrdered',
  VISIT_COMPLETED: 'VisitCompleted',
  FOLLOW_UP_SCHEDULED: 'FollowUpScheduled',
  DOCTOR_VERIFIED: 'DoctorVerified',
  HOSPITAL_VERIFIED: 'HospitalVerified',
} as const;
