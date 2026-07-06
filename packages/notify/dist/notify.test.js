"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const adapters_1 = require("../src/adapters");
const engine_1 = require("../src/engine");
(0, vitest_1.describe)('NotificationEngine', () => {
    (0, vitest_1.it)('should create an engine with adapters', () => {
        const engine = new engine_1.NotificationEngine([
            new adapters_1.TwilioSMSAdapter({ accountSid: 'test', authToken: 'test', from: 'test' }),
        ]);
        (0, vitest_1.expect)(engine).toBeDefined();
    });
});
(0, vitest_1.describe)('TwilioSMSAdapter', () => {
    (0, vitest_1.it)('should validate config', () => {
        const adapter = new adapters_1.TwilioSMSAdapter({ accountSid: 'sid', authToken: 'token', from: 'from' });
        (0, vitest_1.expect)(adapter.validateConfig({ accountSid: 'sid', authToken: 'token' })).toBe(true);
        (0, vitest_1.expect)(adapter.validateConfig({})).toBe(false);
    });
});
