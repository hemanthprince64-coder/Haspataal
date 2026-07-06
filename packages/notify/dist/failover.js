"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFailover = void 0;
const db_1 = require("@haspataal/db");
class ProviderFailover {
    primary;
    fallback;
    constructor(primary, fallback) {
        this.primary = primary;
        this.fallback = fallback;
    }
    async deliverWithFailover(notificationId) {
        const result = await this.primary.deliver();
        if (result.success)
            return result;
        if (this.fallback) {
            await db_1.prisma.notificationDelivery.create({
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
exports.ProviderFailover = ProviderFailover;
