"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyTimelineIntegration = void 0;
const db_1 = require("@haspataal/db");
const timeline_1 = require("@haspataal/timeline");
class JourneyTimelineIntegration {
    static async logMilestone(milestoneId, event) {
        const milestone = await db_1.prisma.journeyMilestone.findUnique({
            where: { id: milestoneId },
            include: { journey: true },
        });
        if (!milestone?.journeyId)
            return;
        // Publish to Timeline Engine with correct polymorphic references
        await (0, timeline_1.getTimelinePublisher)().publish({
            patientId: milestone.journey.patientId,
            hospitalId: milestone.journey.hospitalId,
            eventType: event,
            category: 'CLINICAL',
            module: 'CARE_JOURNEY',
            title: `Milestone ${milestone.name} Updated`,
            subtitle: `Care Journey Event: ${event}`,
            description: `Journey milestone '${milestone.name}' reached status: ${milestone.status}`,
            entityType: 'JourneyMilestone',
            entityId: milestoneId,
            metadata: {
                journeyId: milestone.journeyId,
                milestoneName: milestone.name,
                milestoneStatus: milestone.status,
                updatedAt: new Date().toISOString(),
            },
            timestamp: new Date(),
        });
    }
}
exports.JourneyTimelineIntegration = JourneyTimelineIntegration;
