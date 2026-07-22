/* eslint-disable @typescript-eslint/no-unused-vars */
import { prisma } from '@haspataal/db';
import crypto from 'crypto';

import logger from '../../../patient-portal/lib/logger';

// -----------------------------------------------------------------------------
// INTEGRATION HUB: EVENT ROUTER (API GATEWAY PATTERN)
// -----------------------------------------------------------------------------
// Acts as a centralized egress gateway for all internal domain events.
// Pipeline: Filtering -> Transformation -> Signing -> Retry Queue (DLQ supported)
// -----------------------------------------------------------------------------

export class EventRouter {
  /**
   * Main entrypoint for processing an event from the internal Event Bus.
   */
  async routeEvent(internalEvent: any) {
    logger.info({ eventId: internalEvent.id }, 'Event Router received domain event');

    // 1. Filtering: Find all webhooks configured for this event type and hospital
    const subscriptions = await this.getSubscriptions(internalEvent.hospitalId, internalEvent.type);

    if (subscriptions.length === 0) {
      logger.debug('No external subscriptions found for this event.');
      return;
    }

    for (const sub of subscriptions) {
      // 2. Transformation (e.g., mapping internal IDs to external system schemas)
      const payload = this.transformPayload(internalEvent, sub.payloadVersion);

      // 3. Signing (HMAC with secret)
      const signature = this.signPayload(payload, sub.webhookSecret);

      // 4. Enqueue for At-Least-Once Delivery
      await this.enqueueForDelivery({
        subscriptionId: sub.id,
        webhookUrl: sub.webhookUrl,
        payload,
        signature,
        idempotencyKey: `${internalEvent.id}-${sub.id}`,
      });
    }
  }

  // --- Pipeline Steps ---

  private async getSubscriptions(hospitalId: string, eventType: string) {
    // Mock: Returns active IntegrationConfigs subscribed to this event
    return [
      {
        id: 'sub-1',
        webhookUrl: 'https://api.external-lab.com/webhook',
        webhookSecret: 'super-secret-key',
        payloadVersion: 'v2',
      },
    ];
  }

  private transformPayload(internalEvent: any, targetVersion: string) {
    // Standardizes the event envelope (e.g., PatientAdmitted.v1 -> v2)
    return {
      eventId: internalEvent.id,
      eventType: `${internalEvent.type}.${targetVersion}`,
      timestamp: new Date().toISOString(),
      data: internalEvent.payload,
    };
  }

  private signPayload(payload: any, secret: string): string {
    return crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  }

  private async enqueueForDelivery(jobData: any) {
    // Mock: Submits to a durable queue (e.g., BullMQ / Redis Streams)
    // The worker processing this queue handles exponential backoff (30s -> 2m -> 10m -> DLQ)
    logger.info(
      {
        webhook: jobData.webhookUrl,
        idempotencyKey: jobData.idempotencyKey,
      },
      'Enqueued external webhook delivery (At-Least-Once Guarantee)',
    );
  }
}

export const eventRouter = new EventRouter();
