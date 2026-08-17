import { z } from 'zod';

export const ORDER_EVENTS = {
  ORDER_REQUESTED: 'ORDER_REQUESTED',
  ORDER_AMENDED: 'ORDER_AMENDED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_PRIORITY_CHANGED: 'ORDER_PRIORITY_CHANGED',
  ORDER_EXECUTION_UPDATED: 'ORDER_EXECUTION_UPDATED',
} as const;

export const OrderRequestedPayloadSchema = z.object({
  orderId: z.string().uuid(),
  items: z.array(z.string().uuid()),
});
export type OrderRequestedPayload = z.infer<typeof OrderRequestedPayloadSchema>;

export const OrderAmendedPayloadSchema = z.object({
  orderId: z.string().uuid(),
  version: z.number().int().positive(),
  items: z.array(z.string().uuid()),
});
export type OrderAmendedPayload = z.infer<typeof OrderAmendedPayloadSchema>;

export const OrderCancelledPayloadSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.string(),
});
export type OrderCancelledPayload = z.infer<typeof OrderCancelledPayloadSchema>;

export const OrderCompletedPayloadSchema = z.object({
  orderId: z.string().uuid(),
});
export type OrderCompletedPayload = z.infer<typeof OrderCompletedPayloadSchema>;

export const OrderPriorityChangedPayloadSchema = z.object({
  orderId: z.string().uuid(),
  priority: z.string(),
});
export type OrderPriorityChangedPayload = z.infer<typeof OrderPriorityChangedPayloadSchema>;

export const OrderExecutionUpdatedPayloadSchema = z.object({
  orderId: z.string().uuid(),
  itemId: z.string().uuid().optional(),
  executionId: z.string().uuid(),
  status: z.string(),
});
export type OrderExecutionUpdatedPayload = z.infer<typeof OrderExecutionUpdatedPayloadSchema>;
