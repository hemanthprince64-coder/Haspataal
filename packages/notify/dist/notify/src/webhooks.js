"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookPlatform = void 0;
const db_1 = require("@haspataal/db");
class WebhookPlatform {
    static async receiveWebhook(payload) {
        await db_1.prisma.notificationEvent.create({
            data: { event: payload.event, payload: payload.data },
        });
        return { received: true };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async sendWebhook(_url, _payload) {
        return { sent: true };
    }
}
exports.WebhookPlatform = WebhookPlatform;
