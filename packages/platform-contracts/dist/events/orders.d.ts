import { z } from 'zod';
export declare const ORDER_EVENTS: {
    readonly ORDER_REQUESTED: "ORDER_REQUESTED";
    readonly ORDER_AMENDED: "ORDER_AMENDED";
    readonly ORDER_CANCELLED: "ORDER_CANCELLED";
    readonly ORDER_COMPLETED: "ORDER_COMPLETED";
    readonly ORDER_PRIORITY_CHANGED: "ORDER_PRIORITY_CHANGED";
    readonly ORDER_EXECUTION_UPDATED: "ORDER_EXECUTION_UPDATED";
};
export declare const OrderRequestedPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    items: string[];
}, {
    orderId: string;
    items: string[];
}>;
export type OrderRequestedPayload = z.infer<typeof OrderRequestedPayloadSchema>;
export declare const OrderAmendedPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
    version: z.ZodNumber;
    items: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    items: string[];
    version: number;
}, {
    orderId: string;
    items: string[];
    version: number;
}>;
export type OrderAmendedPayload = z.infer<typeof OrderAmendedPayloadSchema>;
export declare const OrderCancelledPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
    reason: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    reason: string;
}, {
    orderId: string;
    reason: string;
}>;
export type OrderCancelledPayload = z.infer<typeof OrderCancelledPayloadSchema>;
export declare const OrderCompletedPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
}, {
    orderId: string;
}>;
export type OrderCompletedPayload = z.infer<typeof OrderCompletedPayloadSchema>;
export declare const OrderPriorityChangedPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
    priority: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    priority: string;
}, {
    orderId: string;
    priority: string;
}>;
export type OrderPriorityChangedPayload = z.infer<typeof OrderPriorityChangedPayloadSchema>;
export declare const OrderExecutionUpdatedPayloadSchema: z.ZodObject<{
    orderId: z.ZodString;
    itemId: z.ZodOptional<z.ZodString>;
    executionId: z.ZodString;
    status: z.ZodString;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    status: string;
    executionId: string;
    itemId?: string | undefined;
}, {
    orderId: string;
    status: string;
    executionId: string;
    itemId?: string | undefined;
}>;
export type OrderExecutionUpdatedPayload = z.infer<typeof OrderExecutionUpdatedPayloadSchema>;
//# sourceMappingURL=orders.d.ts.map