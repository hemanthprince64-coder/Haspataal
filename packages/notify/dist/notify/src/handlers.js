"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationCommandHandler = void 0;
const platform_contracts_1 = require("@haspataal/platform-contracts");
const types_1 = require("./types");
const engine_1 = require("./engine");
const SendNotificationCommandSchema = (0, platform_contracts_1.createPlatformCommandSchema)(types_1.NotificationInputSchema);
class NotificationCommandHandler {
    engine;
    constructor(engine) {
        this.engine = engine || new engine_1.NotificationEngine();
    }
    async handleSendNotification(rawCommand) {
        // Validate command envelope and payload
        const command = SendNotificationCommandSchema.parse(rawCommand);
        // Inherit hospital context if not provided explicitly in payload
        const input = {
            ...command.payload,
            hospitalId: command.payload.hospitalId || command.tenantContext.hospitalId,
        };
        // Note: The inbox processor has already guaranteed idempotency before reaching here.
        await this.engine.enqueue(input);
    }
}
exports.NotificationCommandHandler = NotificationCommandHandler;
