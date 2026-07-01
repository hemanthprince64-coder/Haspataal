import { prisma } from '@haspataal/db';

import { NotificationInput, Channel, Priority } from './types';

export class NotificationRouter {
  static async route(input: NotificationInput): Promise<Channel> {
    if (input.channel) {
      return input.channel;
    }

    if (!input.patientId) {
      return 'SMS';
    }

    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: input.patientId },
    });

    if (!prefs) return 'SMS';

    const channelPriority: Channel[] = ['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP'];
    for (const channel of channelPriority) {
      if (prefs[channel.toLowerCase() as keyof typeof prefs]) {
        return channel;
      }
    }
    return 'SMS';
  }

  static getQueueName(channel: Channel, priority: Priority): string {
    return `${priority.toLowerCase()}-${channel.toLowerCase()}-notifications`;
  }
}
