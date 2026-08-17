import { DomainEvent, EventBus } from '../index';

export class NotificationPublisher {
  private static instance: NotificationPublisher;
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): NotificationPublisher {
    if (!NotificationPublisher.instance) {
      NotificationPublisher.instance = new NotificationPublisher();
    }
    return NotificationPublisher.instance;
  }

  public async publishEvent(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }
}

export const getNotificationPublisher = () => NotificationPublisher.getInstance();
