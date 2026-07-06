"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppNotificationAdapter = exports.PushNotificationAdapter = void 0;
class PushNotificationAdapter {
    channel = 'PUSH';
    async deliver() {
        return { success: true, messageId: 'push-mock-id' };
    }
    validateConfig(config) {
        return !!config.fcmToken;
    }
}
exports.PushNotificationAdapter = PushNotificationAdapter;
class InAppNotificationAdapter {
    channel = 'IN_APP';
    async deliver() {
        return { success: true, messageId: 'inapp-mock-id' };
    }
}
exports.InAppNotificationAdapter = InAppNotificationAdapter;
