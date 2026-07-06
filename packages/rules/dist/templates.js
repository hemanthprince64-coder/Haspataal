import { v4 as uuidv4 } from 'uuid';
export class RuleTemplates {
    static getPregnancyTemplate(hospitalId) {
        return {
            id: uuidv4(),
            hospitalId,
            name: 'Pregnancy ANC Initial Workflow',
            description: 'Triggers ANC visit scheduling and tracking for newly registered pregnancies.',
            category: 'CLINICAL',
            triggerType: 'EVENT',
            triggerEvent: 'PregnancyRegistered',
            isActive: true,
            priority: 100,
            conditionJson: [
                {
                    field: 'patient.gender',
                    operator: 'eq',
                    value: 'FEMALE',
                },
            ],
            actionJson: [
                {
                    type: 'create_timeline',
                    payload: {
                        eventType: 'ANC_JOURNEY_STARTED',
                        title: 'ANC Journey Started',
                        severity: 'LOW',
                        priority: 5,
                    },
                },
                {
                    type: 'assign_task',
                    payload: {
                        title: 'Schedule ANC 1 Visit',
                        description: 'Please schedule the first ANC visit for the newly registered pregnancy.',
                        assignedTo: 'ROLE:ASHA',
                    },
                },
                {
                    type: 'send_notification',
                    payload: {
                        channel: 'AUTO',
                        template: 'pregnancy_welcome_message',
                    },
                },
            ],
        };
    }
    static getDiabetesRiskTemplate(hospitalId) {
        return {
            id: uuidv4(),
            hospitalId,
            name: 'High HbA1c Alert & Diabetes Workflow',
            description: 'Flags patients with high HbA1c as Diabetic Risk and notifies the provider.',
            category: 'CLINICAL',
            triggerType: 'EVENT',
            triggerEvent: 'LabCompleted',
            isActive: true,
            priority: 200,
            conditionJson: [
                {
                    field: 'testName',
                    operator: 'eq',
                    value: 'HbA1c',
                },
                {
                    field: 'numericResult',
                    operator: 'gt',
                    value: 6.5,
                },
            ],
            actionJson: [
                {
                    type: 'create_timeline',
                    payload: {
                        eventType: 'DIABETIC_RISK_IDENTIFIED',
                        title: 'Diabetic Risk Identified',
                        summary: 'HbA1c result > 6.5',
                        severity: 'HIGH',
                        priority: 8,
                    },
                },
                {
                    type: 'assign_task',
                    payload: {
                        title: 'Review High HbA1c Result',
                        description: 'Patient has high HbA1c. Please review and start diabetic care pathway.',
                        assignedTo: 'ROLE:DOCTOR',
                    },
                },
                {
                    type: 'update_journey_risk',
                    payload: {
                        journeyId: '{{context.journeyId}}',
                        score: 75, // Assuming 0-100 scale where > 70 is high risk
                    },
                },
            ],
        };
    }
    static getVaccinationReminderTemplate(hospitalId) {
        return {
            id: uuidv4(),
            hospitalId,
            name: 'Pediatric Vaccination Reminder',
            description: 'Sends a reminder 3 days before a scheduled vaccination.',
            category: 'NOTIFICATION',
            triggerType: 'SCHEDULED',
            triggerEvent: 'DailyVaccinationCheck',
            isActive: true,
            priority: 150,
            conditionJson: [
                {
                    field: 'daysUntilDue',
                    operator: 'eq',
                    value: 3,
                },
            ],
            actionJson: [
                {
                    type: 'send_notification',
                    payload: {
                        channel: 'AUTO',
                        template: 'vaccination_reminder',
                    },
                },
            ],
        };
    }
}
