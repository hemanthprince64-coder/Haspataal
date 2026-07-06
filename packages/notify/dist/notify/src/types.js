"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationInputSchema = exports.NotificationStatus = exports.NotificationPriority = exports.NotificationChannel = void 0;
const zod_1 = require("zod");
exports.NotificationChannel = zod_1.z.enum(['SMS', 'WHATSAPP', 'EMAIL', 'PUSH', 'IN_APP']);
exports.NotificationPriority = zod_1.z.enum([
    'EMERGENCY',
    'CRITICAL',
    'HIGH',
    'NORMAL',
    'LOW',
    'BACKGROUND',
]);
exports.NotificationStatus = zod_1.z.enum([
    'QUEUED',
    'PROCESSING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED',
    'EXPIRED',
    'CANCELLED',
]);
exports.NotificationInputSchema = zod_1.z.object({
    hospitalId: zod_1.z.string().uuid().optional(),
    patientId: zod_1.z.string().uuid().optional(),
    doctorId: zod_1.z.string().uuid().optional(),
    templateId: zod_1.z.string().uuid().optional(),
    channel: exports.NotificationChannel.optional(),
    priority: exports.NotificationPriority.default('NORMAL'),
    recipient: zod_1.z.string(),
    subject: zod_1.z.string().optional(),
    body: zod_1.z.string(),
    variables: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
});
