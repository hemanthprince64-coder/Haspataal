export interface ProviderResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare abstract class ChannelAdapter {
    abstract channel: string;
    abstract deliver(): Promise<ProviderResponse>;
    abstract validateConfig(config: Record<string, any>): boolean;
}
export declare class TwilioSMSAdapter extends ChannelAdapter {
    channel: string;
    private client;
    constructor(config: {
        accountSid: string;
        authToken: string;
        from: string;
    });
    validateConfig(config: Record<string, any>): boolean;
    deliver(): Promise<ProviderResponse>;
}
export declare class MetaWhatsAppAdapter extends ChannelAdapter {
    channel: string;
    private client;
    constructor(config: {
        accessToken: string;
        phoneNumberId: string;
    });
    validateConfig(config: Record<string, any>): boolean;
    deliver(): Promise<ProviderResponse>;
}
export declare class ResendEmailAdapter extends ChannelAdapter {
    channel: string;
    constructor();
    validateConfig(config: Record<string, any>): boolean;
    deliver(): Promise<ProviderResponse>;
}
