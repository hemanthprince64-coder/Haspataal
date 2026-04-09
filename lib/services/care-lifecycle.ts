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
        
        const checkIn = await prisma.careCheckIn.create({
            data: {
                careJourneyId,
                dayNumber,
                status,
                analysis: status === 'WORSE' ? 'AI Escalation Required: Patient reported worsening symptoms.' : 'Recovery tracking in progress.'
            }
        });

        // If status is 'WORSE', immediately mark the journey for escalation
        if (status === 'WORSE') {
            await prisma.careJourney.update({
                where: { id: careJourneyId },
                data: { status: 'ESCALATED' }
            });
        }

        return checkIn;
    }

    /**
     * Scans for pending nudges and triggers them
     */
    static async processPendingNudges() {
        const now = new Date();
        const pending = await prisma.nudgeSchedule.findMany({
            where: {
                isTriggered: false,
                scheduledAt: { lte: now }
            },
            include: { careJourney: { include: { visit: { include: { patient: true } } } } }
        });

        logger.info({ count: pending.length }, 'Processing pending nudges');

        const results = [];

        for (const nudge of pending) {
            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Mark as triggered
                    await tx.nudgeSchedule.update({
                        where: { id: nudge.id },
                        data: { isTriggered: true }
                    });

                    // 2. Log engagement (simulated notification)
                    await tx.engagementLog.create({
                        data: {
                            careJourneyId: nudge.careJourneyId,
                            type: 'NUDGE_SENT',
                            metadata: {
                                messageType: nudge.messageType,
                                scheduledAt: nudge.scheduledAt.toISOString(),
                                sentAt: new Date().toISOString()
                            }
                        }
                    });
                });

                results.push({ id: nudge.id, status: 'SUCCESS' });
            } catch (err) {
                logger.error({ err, nudgeId: nudge.id }, 'Failed to process nudge');
                results.push({ id: nudge.id, status: 'FAILED', error: (err as Error).message });
            }
        }

        return results;
    }

    /**
     * Analytical engine to detect recovery drift
     */
    static async analyzeRecoveryDrift(careJourneyId: string) {
        const journey = await prisma.careJourney.findUnique({
            where: { id: careJourneyId },
            include: { checkIns: true, recoverySteps: true }
        });

        if (!journey || journey.checkIns.length === 0) return { drifted: false };

        // Simple Drift Logic: If patient reports 'WORSE' or 'SAME' 
        // more than 2 days in a row on a plan that predicts improvement
        const recentCheckIns = journey.checkIns.sort((a,b) => b.dayNumber - a.dayNumber);
        const lastTwo = recentCheckIns.slice(0, 2);

        const isPersistentStagnation = lastTwo.length >= 2 && lastTwo.every(c => c.status !== 'BETTER');
        const hasRecentEscalation = lastTwo.some(c => c.status === 'WORSE');

        if (hasRecentEscalation || isPersistentStagnation) {
            return {
                drifted: true,
                reason: hasRecentEscalation ? 'NEGATIVE_TREND' : 'PERSISTENT_STAGNATION',
                urgency: hasRecentEscalation ? 'HIGH' : 'MEDIUM',
                action: 'RE_CONSULTATION_RECOMMENDED'
            };
        }

        return { drifted: false };
    }
}
