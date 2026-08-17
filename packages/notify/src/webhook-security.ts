import { createHmac } from 'crypto';

export class WebhookHMAC {
  static verify(payload: string, signature: string, secret: string): boolean {
    const hmac = createHmac('sha256', secret);
    hmac.update(payload);
    const expected = `sha256=${hmac.digest('hex')}`;
    return signature === expected;
  }
}
