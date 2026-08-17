"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
/**
 * lib/redis.ts
 *
 * Root-level Redis client entry-point shared by services/ and workers/.
 * Delegates to the real client in apps/patient-portal/lib/redis.ts.
 */
const redis_1 = __importDefault(require("../apps/patient-portal/lib/redis"));
exports.redis = redis_1.default;
exports.default = redis_1.default;
