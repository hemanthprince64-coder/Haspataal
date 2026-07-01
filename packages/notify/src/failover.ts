import { prisma } from '@haspataal/db';

import { ProviderResponse, ChannelAdapter } from './adapters';

export class ProviderFailover {
  constructor(
    private primary: ChannelAdapter,
    private fallback?: ChannelAdapter,
  ) {}

  async deliverWithFailover(notificationId: string): Promise<ProviderResponse> {
    const result = await this.primary.deliver();
    if (result.success) return result;

    if (this.fallback) {
      await prisma.notificationDelivery.create({
        data: {
          notificationId,
          channel: this.fallback.channel,
          provider: this.fallback.constructor.name,
          status: 'QUEUED',
          attempt: 1,
        },
      });
      const fallbackResult = await this.fallback.deliver();
      return fallbackResult;
    }

    return result;
  }
}
