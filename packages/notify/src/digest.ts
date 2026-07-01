import { prisma } from '@haspataal/db';

export class DigestEngine {
  static async generateDigest(patientId: string, type: 'daily' | 'weekly' | 'pregnancy') {
    const since = new Date();
    if (type === 'daily') since.setDate(since.getDate() - 1);
    if (type === 'weekly') since.setDate(since.getDate() - 7);

    const notifications = await prisma.notification.findMany({
      where: { createdAt: { gte: since }, NOT: { status: 'READ' } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      type,
      count: notifications.length,
      items: notifications.map((n: any) => ({ channel: n.channel, body: n.body })),
    };
  }
}
