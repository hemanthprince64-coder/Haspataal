import { prisma } from '@haspataal/db';

export class WebhookPlatform {
  static async receiveWebhook(payload: { event: string; data: any }) {
    await prisma.notificationEvent.create({
      data: { event: payload.event, payload: payload.data },
    });
    return { received: true };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async sendWebhook(_url: string, _payload: any) {
    return { sent: true };
  }
}
