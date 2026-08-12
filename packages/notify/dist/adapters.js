"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendEmailAdapter = exports.MetaWhatsAppAdapter = exports.TwilioSMSAdapter = exports.ChannelAdapter = void 0;
class ChannelAdapter {
}
exports.ChannelAdapter = ChannelAdapter;
class TwilioSMSAdapter extends ChannelAdapter {
    channel = 'SMS';
    client;
    constructor(config) {
        super();
        this.client = { ...config };
    }
    validateConfig(config) {
        return !!config.accountSid && !!config.authToken;
    }
    async deliver() {
        return { success: false, error: 'Provider unavailable' };
    }
}
exports.TwilioSMSAdapter = TwilioSMSAdapter;
class MetaWhatsAppAdapter extends ChannelAdapter {
    channel = 'WHATSAPP';
    client;
    constructor(config) {
        super();
        this.client = { ...config };
    }
    validateConfig(config) {
        return !!config.accessToken;
    }
    async deliver() {
        return { success: false, error: 'Provider unavailable' };
    }
}
exports.MetaWhatsAppAdapter = MetaWhatsAppAdapter;
class ResendEmailAdapter extends ChannelAdapter {
    channel = 'EMAIL';
    constructor() {
        super();
    }
    validateConfig(config) {
        return !!config.apiKey;
    }
    async deliver() {
        return { success: false, error: 'Provider unavailable' };
    }
}
exports.ResendEmailAdapter = ResendEmailAdapter;
