"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppNotificationAdapter = exports.PushNotificationAdapter = void 0;
class PushNotificationAdapter {
    channel = 'PUSH';
    async deliver() {
        return { success: false, error: 'Provider unavailable' };
    }
    validateConfig(config) {
        return !!config.fcmToken;
    }
}
exports.PushNotificationAdapter = PushNotificationAdapter;
class InAppNotificationAdapter {
    channel = 'IN_APP';
    async deliver() {
        return { success: false, error: 'Provider unavailable' };
    }
}
exports.InAppNotificationAdapter = InAppNotificationAdapter;
