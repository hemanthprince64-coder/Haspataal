import { PlatformQuery, createPlatformQuerySchema } from '@haspataal/platform-contracts';
import { z } from 'zod';
import { prisma } from '@haspataal/db';

export const NotificationFiltersSchema = z.object({
  status: z.string().optional(),
});
export type NotificationFilters = z.infer<typeof NotificationFiltersSchema>;

export const NotificationQuerySchema = createPlatformQuerySchema(NotificationFiltersSchema as any);
export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

export class NotificationQueryHandler {
  static async getNotifications(query: PlatformQuery<NotificationFilters>) {
    const { hospitalId } = query.tenantScope;
    const { status } = query.filters;

    const notifications = await prisma.notification.findMany({
      where: {
        hospitalId,
        ...(status && { status }),
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return notifications;
  }

  static async getAnalytics(query: PlatformQuery<Record<string, unknown>>) {
    const { hospitalId } = query.tenantScope;
    const { NotificationAnalytics } = await import('./analytics');
    
    const [delivery, failure, channelUsage] = await Promise.all([
      NotificationAnalytics.deliveryRate(hospitalId),
      NotificationAnalytics.failureRate(hospitalId),
      NotificationAnalytics.channelUsage(hospitalId),
    ]);
    
    return { delivery, failure, channelUsage };
  }
  static async getTemplates(query: PlatformQuery<Record<string, unknown>>) {
    const { hospitalId } = query.tenantScope;
    return await prisma.notificationTemplate.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      where: hospitalId ? { hospitalId } : undefined,
    });
  }

  static async getCampaigns(query: PlatformQuery<Record<string, unknown>>) {
    const { hospitalId } = query.tenantScope;
    return await prisma.notificationCampaign.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      where: hospitalId ? { hospitalId } : undefined,
    });
  }
}
