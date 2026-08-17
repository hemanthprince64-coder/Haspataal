export declare class WebhookPlatform {
    static receiveWebhook(payload: {
        event: string;
        data: any;
    }): Promise<{
        received: boolean;
    }>;
    static sendWebhook(_url: string, _payload: any): Promise<{
        sent: boolean;
    }>;
}
