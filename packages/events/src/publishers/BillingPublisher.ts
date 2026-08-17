import { DomainEvent, EventBus } from '../index';

export class BillingPublisher {
  private static instance: BillingPublisher;
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): BillingPublisher {
    if (!BillingPublisher.instance) {
      BillingPublisher.instance = new BillingPublisher();
    }
    return BillingPublisher.instance;
  }

  public async publishEvent(event: DomainEvent): Promise<void> {
    await this.eventBus.publish(event);
  }
}

export const getBillingPublisher = () => BillingPublisher.getInstance();
