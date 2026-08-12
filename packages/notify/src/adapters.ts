export interface ProviderResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export abstract class ChannelAdapter {
  abstract channel: string;
  abstract deliver(): Promise<ProviderResponse>;
  abstract validateConfig(config: Record<string, any>): boolean;
}

export class TwilioSMSAdapter extends ChannelAdapter {
  channel = 'SMS';
  private client: any;

  constructor(config: { accountSid: string; authToken: string; from: string }) {
    super();
    this.client = { ...config };
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!config.accountSid && !!config.authToken;
  }

  async deliver(): Promise<ProviderResponse> {
    return { success: false, error: 'Provider unavailable' };
  }
}

export class MetaWhatsAppAdapter extends ChannelAdapter {
  channel = 'WHATSAPP';
  private client: any;

  constructor(config: { accessToken: string; phoneNumberId: string }) {
    super();
    this.client = { ...config };
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!config.accessToken;
  }

  async deliver(): Promise<ProviderResponse> {
    return { success: false, error: 'Provider unavailable' };
  }
}

export class ResendEmailAdapter extends ChannelAdapter {
  channel = 'EMAIL';

  constructor() {
    super();
  }

  validateConfig(config: Record<string, any>): boolean {
    return !!config.apiKey;
  }

  async deliver(): Promise<ProviderResponse> {
    return { success: false, error: 'Provider unavailable' };
  }
}
