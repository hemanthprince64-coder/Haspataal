"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationQueryHandler = exports.NotificationQuerySchema = exports.NotificationFiltersSchema = void 0;
const platform_contracts_1 = require("@haspataal/platform-contracts");
const zod_1 = require("zod");
const db_1 = require("@haspataal/db");
exports.NotificationFiltersSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
});
exports.NotificationQuerySchema = (0, platform_contracts_1.createPlatformQuerySchema)(exports.NotificationFiltersSchema);
class NotificationQueryHandler {
    static async getNotifications(query) {
        const { hospitalId } = query.tenantScope;
        const { status } = query.filters;
        const notifications = await db_1.prisma.notification.findMany({
            where: {
                hospitalId,
                ...(status && { status }),
            },
            take: 100,
            orderBy: { createdAt: 'desc' },
        });
        return notifications;
    }
    static async getAnalytics(query) {
        const { hospitalId } = query.tenantScope;
        const { NotificationAnalytics } = await Promise.resolve().then(() => __importStar(require('./analytics')));
        const [delivery, failure, channelUsage] = await Promise.all([
            NotificationAnalytics.deliveryRate(hospitalId),
            NotificationAnalytics.failureRate(hospitalId),
            NotificationAnalytics.channelUsage(hospitalId),
        ]);
        return { delivery, failure, channelUsage };
    }
    static async getTemplates(query) {
        const { hospitalId } = query.tenantScope;
        return await db_1.prisma.notificationTemplate.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            where: hospitalId ? { hospitalId } : undefined,
        });
    }
    static async getCampaigns(query) {
        const { hospitalId } = query.tenantScope;
        return await db_1.prisma.notificationCampaign.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' },
            where: hospitalId ? { hospitalId } : undefined,
        });
    }
}
exports.NotificationQueryHandler = NotificationQueryHandler;
