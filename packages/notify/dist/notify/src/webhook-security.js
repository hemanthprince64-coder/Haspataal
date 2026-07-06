"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookHMAC = void 0;
const crypto_1 = require("crypto");
class WebhookHMAC {
    static verify(payload, signature, secret) {
        const hmac = (0, crypto_1.createHmac)('sha256', secret);
        hmac.update(payload);
        const expected = `sha256=${hmac.digest('hex')}`;
        return signature === expected;
    }
}
exports.WebhookHMAC = WebhookHMAC;
