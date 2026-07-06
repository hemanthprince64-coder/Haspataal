import { ProviderResponse, ChannelAdapter } from './adapters';
export declare class ProviderFailover {
    private primary;
    private fallback?;
    constructor(primary: ChannelAdapter, fallback?: ChannelAdapter | undefined);
    deliverWithFailover(notificationId: string): Promise<ProviderResponse>;
}
