import prisma from "../prisma";
import logger from "../logger";

export class CareLifecycleService {
    /**
     * Calculates the current Day of recovery and fetches the relevant plan
     */
    static async getRecoveryState(visitId: string) {
        const journey = await prisma.careJourney.findUnique({
            where: { visitId },
            include: {
                recoverySteps: true,
                engagements: true,
                checkIns: true,
                medications: true,
                followUp: true
            }
        });

        if (!journey) return null;

        const visitDate = new Date(journey.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        // Cap at 14 days
        const currentDay = Math.min(Math.max(diffDays, 1), 14);

        return {
            journeyId: journey.id,
            currentDay,
            condition: journey.conditionSimple,
            explanation: journey.explanation,
            medications: journey.medications,
            todayPlan: journey.recoverySteps.find(s => s.dayNumber === currentDay),
            fullHistory: journey.recoverySteps.sort((a,b) => a.dayNumber - b.dayNumber),
            engagements: journey.engagements,
            checkIns: journey.checkIns,
            followUp: journey.followUp
        };
    }

    /**
     * Logs a medication adherence event
     */
    static async logMedication(careJourneyId: string, medName: string, schedule: string) {
        return await prisma.engagementLog.create({
            data: {
                careJourneyId,
                type: 'MED_TAKEN',
                metadata: { medName, schedule, recordedAt: new Date().toISOString() }
            }
        });
    }

    /**
     * Records a patient's self-reported recovery status
     */
    static async submitCheckIn(careJourneyId: string, dayNumber: number, status: 'BETTER' | 'SAME' | 'WORSE') {
        logger.info({ action: 'submit_checkin', careJourneyId, dayNumber, status }, 'Patient submitted recovery status');
        
        return await prisma.careCheckIn.create({
            data: {
                careJourneyId,
                dayNumber,
                status,
                analysis: status === 'WORSE' ? 'AI Escalation Required: Patient reported worsening symptoms.' : 'Recovery tracking in progress.'
            }
        });
    }
}
