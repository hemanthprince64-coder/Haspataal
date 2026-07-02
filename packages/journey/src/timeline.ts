import { prisma } from '@haspataal/db';
import { getTimelinePublisher } from '@haspataal/timeline';

export class JourneyTimelineIntegration {
  static async logMilestone(milestoneId: string, event: string) {
    const milestone = await prisma.journeyMilestone.findUnique({
      where: { id: milestoneId },
      include: { journey: true },
    });
    if (!milestone?.journeyId) return;

    // Publish to Timeline Engine with correct polymorphic references
    await getTimelinePublisher().publish({
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
