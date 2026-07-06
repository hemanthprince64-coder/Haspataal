"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyCommandHandler = exports.CompleteMilestoneCommandSchema = exports.StartJourneyCommandSchema = exports.CompleteMilestonePayloadSchema = exports.StartJourneyPayloadSchema = void 0;
const zod_1 = require("zod");
const platform_contracts_1 = require("@haspataal/platform-contracts");
const engine_1 = require("./engine");
exports.StartJourneyPayloadSchema = zod_1.z.object({
    templateId: zod_1.z.string(),
    patientId: zod_1.z.string(),
    hospitalId: zod_1.z.string().optional(),
    careTeam: zod_1.z.any().optional(),
});
exports.CompleteMilestonePayloadSchema = zod_1.z.object({
    milestoneId: zod_1.z.string(),
});
exports.StartJourneyCommandSchema = (0, platform_contracts_1.createPlatformCommandSchema)(exports.StartJourneyPayloadSchema);
exports.CompleteMilestoneCommandSchema = (0, platform_contracts_1.createPlatformCommandSchema)(exports.CompleteMilestonePayloadSchema);
class JourneyCommandHandler {
    async handleStartJourney(rawCommand) {
        const command = exports.StartJourneyCommandSchema.parse(rawCommand);
        const payload = command.payload;
        // We already do tx.outboxEvent.create inside enroll, so this relies on
        // JourneyEngine acting as a domain service.
        await engine_1.JourneyEngine.enroll({
            templateId: payload.templateId,
            patientId: payload.patientId,
            hospitalId: payload.hospitalId || command.tenantContext.hospitalId,
            careTeam: payload.careTeam,
        });
    }
    async handleCompleteMilestone(rawCommand) {
        const command = exports.CompleteMilestoneCommandSchema.parse(rawCommand);
        const payload = command.payload;
        await engine_1.JourneyEngine.completeMilestone(payload.milestoneId);
    }
}
exports.JourneyCommandHandler = JourneyCommandHandler;
