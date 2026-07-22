"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderExecutionUpdatedPayloadSchema = exports.OrderPriorityChangedPayloadSchema = exports.OrderCompletedPayloadSchema = exports.OrderCancelledPayloadSchema = exports.OrderAmendedPayloadSchema = exports.OrderRequestedPayloadSchema = exports.ORDER_EVENTS = void 0;
const zod_1 = require("zod");
exports.ORDER_EVENTS = {
    ORDER_REQUESTED: 'ORDER_REQUESTED',
    ORDER_AMENDED: 'ORDER_AMENDED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    ORDER_COMPLETED: 'ORDER_COMPLETED',
    ORDER_PRIORITY_CHANGED: 'ORDER_PRIORITY_CHANGED',
    ORDER_EXECUTION_UPDATED: 'ORDER_EXECUTION_UPDATED',
};
exports.OrderRequestedPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.string().uuid()),
});
exports.OrderAmendedPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    version: zod_1.z.number().int().positive(),
    items: zod_1.z.array(zod_1.z.string().uuid()),
});
exports.OrderCancelledPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    reason: zod_1.z.string(),
});
exports.OrderCompletedPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
});
exports.OrderPriorityChangedPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    priority: zod_1.z.string(),
});
exports.OrderExecutionUpdatedPayloadSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    itemId: zod_1.z.string().uuid().optional(),
    executionId: zod_1.z.string().uuid(),
    status: zod_1.z.string(),
});
