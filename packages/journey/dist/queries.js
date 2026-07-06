"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyQueryHandler = exports.JourneyQuerySchema = exports.JourneyFiltersSchema = void 0;
const db_1 = require("@haspataal/db");
const platform_contracts_1 = require("@haspataal/platform-contracts");
const zod_1 = require("zod");
exports.JourneyFiltersSchema = zod_1.z.object({
    patientId: zod_1.z.string(),
});
exports.JourneyQuerySchema = (0, platform_contracts_1.createPlatformQuerySchema)(exports.JourneyFiltersSchema);
class JourneyQueryHandler {
    /**
     * Retrieves journey instances for a patient.
     */
    static async getPatientJourneys(query) {
        const { patientId } = query.filters;
        const { hospitalId } = query.tenantScope;
        return await db_1.prisma.journeyInstance.findMany({
            where: {
                patientId,
                // Optional: enforce hospital isolation if it's not a cross-tenant query
                ...(hospitalId !== 'system' && { hospitalId }),
            },
            include: { milestones: true, tasks: true },
        });
    }
}
exports.JourneyQueryHandler = JourneyQueryHandler;
