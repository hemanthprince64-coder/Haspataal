"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyConsumer = void 0;
class JourneyConsumer {
    consumerName = 'Journey';
    consumerVersion = 1;
    supportedEvents() {
        return [
            'PATIENT_ADMITTED',
            'PATIENT_CLINICALLY_DISCHARGED',
            'PATIENT_PHYSICALLY_LEFT_STANDARD',
            'PATIENT_PHYSICALLY_LEFT_LAMA',
            'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE',
        ];
    }
    async handle(envelope, tx) {
        const payload = envelope.payload;
        const patientId = payload.patientId || payload.id;
        // We only care about admissions/episodes mapping to a specific journey instance
        // For Phase 4, we generate 'Ad-hoc' implicit journeys if no template exists, or just record milestones.
        // Given the Phase 4 scope: 'Derives longitudinal care pathways (JourneyMilestone) purely from canonical events.'
        // We'll upsert a generic CareJourney or JourneyInstance for the patient if it doesn't exist.
        // We'll use JourneyInstance since it has JourneyMilestone.
        // Attempt to find an active JourneyInstance for this patient/hospital.
        let journey = await tx.journeyInstance.findFirst({
            where: {
                patientId,
                status: 'ACTIVE',
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!journey && envelope.eventType === 'PATIENT_ADMITTED') {
            // Auto-create a generic 'Hospital Stay' journey instance.
            journey = await tx.journeyInstance.create({
                data: {
                    patientId,
                    hospitalId: envelope.scope.hospitalId,
                    templateId: 'generic-hospital-stay',
                    status: 'ACTIVE',
                    currentStage: 'ADMISSION',
                    startDate: envelope.occurredAt ?? new Date(),
                    riskScore: 0,
                },
            });
        }
        if (journey) {
            let milestoneName = 'Unknown Event';
            const status = 'COMPLETED';
            switch (envelope.eventType) {
                case 'PATIENT_ADMITTED':
                    milestoneName = 'Admission Complete';
                    break;
                case 'PATIENT_CLINICALLY_DISCHARGED':
                    milestoneName = 'Clinical Discharge';
                    break;
                case 'PATIENT_PHYSICALLY_LEFT_STANDARD':
                    milestoneName = 'Physical Departure (Standard)';
                    break;
                case 'PATIENT_PHYSICALLY_LEFT_LAMA':
                    milestoneName = 'Physical Departure (LAMA)';
                    break;
                case 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE':
                    milestoneName = 'Physical Departure (Absconded)';
                    break;
            }
            await tx.journeyMilestone.create({
                data: {
                    journeyId: journey.id,
                    name: milestoneName,
                    category: 'ADMISSION_EPISODE',
                    status: status,
                    completedAt: envelope.occurredAt ?? new Date(),
                    projectionVersion: 1,
                    lastProcessedEventId: envelope.eventId,
                    lastProcessedOccurredAt: envelope.occurredAt ?? new Date(),
                },
            });
        }
    }
}
exports.JourneyConsumer = JourneyConsumer;
