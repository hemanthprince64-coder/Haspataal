import { prisma } from '@haspataal/db';

export class NotificationAnalytics {
  static async deliveryRate(hospitalId?: string) {
    const where = hospitalId ? { where: { hospitalId } } : {};
    const total = await prisma.notification.count(where as any);
    const sent = await prisma.notification.count({
      where: { ...(where.where || {}), status: 'SENT' },
    } as any);
    return { total, sent, rate: total > 0 ? (sent / total) * 100 : 0 };
  }

  static async failureRate(hospitalId?: string) {
    const where = hospitalId ? { where: { hospitalId } } : {};
    const total = await prisma.notification.count(where as any);
    const failed = await prisma.notification.count({
      where: { ...(where.where || {}), status: 'FAILED' },
    } as any);
    return { total, failed, rate: total > 0 ? (failed / total) * 100 : 0 };
  }

  static async channelUsage(hospitalId?: string) {
    const base = hospitalId ? { hospitalId } : {};
    const channels = ['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP'];
    const stats = await Promise.all(
      channels.map(async (channel) => ({
        channel,
        count: await prisma.notification.count({
          where: { ...base, channel },
        }),
      })),
    );
    return stats;
  }
}
