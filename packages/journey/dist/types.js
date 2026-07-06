"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatus = exports.JourneyStatus = exports.JourneyCategory = void 0;
const zod_1 = require("zod");
exports.JourneyCategory = zod_1.z.enum([
    'MATERNAL',
    'CHRONIC_DIABETES',
    'CHRONIC_HYPERTENSION',
    'POST_OP',
    'CANCER',
    'ASTHMA',
    'COPD',
    'NICU',
    'PICU',
    'MENTAL_HEALTH',
]);
exports.JourneyStatus = zod_1.z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']);
exports.TaskStatus = zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']);
