import { z } from 'zod';
export declare const NotificationSentPayloadSchema: z.ZodObject<{
    notificationId: z.ZodString;
    channel: z.ZodString;
    recipient: z.ZodString;
    status: z.ZodString;
    deliveredAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    channel: string;
    status: string;
    recipient: string;
    deliveredAt: Date;
    notificationId: string;
}, {
    channel: string;
    status: string;
    recipient: string;
    deliveredAt: Date;
    notificationId: string;
}>;
export type NotificationSentPayload = z.infer<typeof NotificationSentPayloadSchema>;
export declare class NotificationOutbox {
    /**
     * Publishes a NOTIFICATION_SENT event to the Outbox
     */
    static publishSentEvent(payload: NotificationSentPayload, tenantContext: any, actorContext: any, correlationId: string, causationId: string): Promise<void>;
}
