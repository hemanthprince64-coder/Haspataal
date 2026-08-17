import { prisma } from '@haspataal/db';

export class RateLimiter {
  static buildKey(hospitalId: string, channel: string, userId?: string): string {
    const parts = [hospitalId, channel];
    if (userId) parts.push(userId);
    return `rate:${parts.join(':')}`;
  }
}

export class ProviderHealth {
  static async getHealthiestProvider(channel: string, hospitalId?: string) {
    return await prisma.notificationProvider.findFirst({
      where: {
        channel,
        isActive: true,
        ...(hospitalId && { hospitalId }),
      },
      orderBy: { priority: 'asc' },
    });
  }
}
