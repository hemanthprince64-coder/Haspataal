import { prisma } from '@haspataal/db';

export class ProviderHealthMonitor {
  static async checkProvider(providerId: string, latency: number, error?: string) {
    const health = await prisma.notificationProviderHealth.upsert({
      where: { providerId },
      update: {
        latency,
        lastCheck: new Date(),
        errorCount: error ? { increment: 1 } : undefined,
      },
      create: {
        providerId,
        latency,
        errorCount: error ? 1 : 0,
        successCount: error ? 0 : 1,
      },
    });
    return health;
  }

  static async selectProvider(channel: string, hospitalId?: string) {
    return await prisma.notificationProvider.findFirst({
      where: {
        channel,
        isActive: true,
        ...(hospitalId && { hospitalId }),
      },
      orderBy: { priority: 'asc' },
    });
  }

  static async getHealthStats() {
    return await prisma.notificationProviderHealth.findMany();
  }
}
