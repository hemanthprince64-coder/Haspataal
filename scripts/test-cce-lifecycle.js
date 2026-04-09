import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ConsultationAiEngine } from '../lib/ai/engine';
import { CareLifecycleService } from '../lib/services/care-lifecycle';

const prisma = new PrismaClient();

async function runLifecycleTest() {
    console.log('🚀 Starting Continuous Care Engine Lifecycle Test...');

    try {
        const rand = Math.floor(Math.random() * 900000) + 100000;
        const patient = await prisma.patient.create({
            data: { name: 'Test Patient', phone: `99${rand}`, password: 'password' }
        });
        const doctor = await prisma.doctorMaster.create({
            data: { fullName: 'Dr. Test', mobile: `88${rand}`, email: `test${rand}@doctor.com` }
        });
        const hospital = await prisma.hospitalsMaster.findFirst() || await prisma.hospitalsMaster.create({
            data: { legalName: 'Test Hospital', registrationNumber: `REG${rand}` }
        });

        console.log(`✅ Entities Ready: Patient(${patient.id}), Doctor(${doctor.id})`);

        // 2. Create Visit
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                hospitalId: hospital.id,
                date: new Date(),
                slot: `Slot-${rand}`
            }
        });

        const visit = await prisma.visit.create({
            data: {
                appointmentId: appointment.id,
                hospitalId: hospital.id,
                patientName: patient.name,
                patientPhone: patient.phone,
                diagnosis: 'Acute Bronchitis',
                notes: {
                    create: {
                        content: 'Patient has acute bronchitis. Prescribed antibiotics and rest. Monitor for breathing difficulty.',
                        type: 'CLINICAL_NOTE'
                    }
                }
            }
        });

        console.log(`✅ Visit Created: ${visit.id}`);

        // 3. Mock AI Engine Processing (Skip API call for local test)
        console.log('🧠 Mocking Consultation AI Engine...');
        const journey = await prisma.careJourney.create({
            data: {
                visitId: visit.id,
                conditionSimple: 'Acute Bronchitis',
                explanation: 'Inflammation of bronchial tubes.',
                seriousness: 'MODERATE',
                timeline: '7-10 Days',
            }
        });

        await prisma.recoveryStep.createMany({
            data: [
                { careJourneyId: journey.id, dayNumber: 1, expectedSymptoms: 'Fever, Cough', markers: 'Rest', guidance: 'Fluid intake' },
                { careJourneyId: journey.id, dayNumber: 2, expectedSymptoms: 'Mild Fever', markers: 'Better appetite', guidance: 'Light walking' },
                { careJourneyId: journey.id, dayNumber: 4, expectedSymptoms: 'No Fever', markers: 'Clear lungs', guidance: 'Normal diet' }
            ]
        });

        console.log(`✅ Care Journey Generated: ${journey.id}`);

        // 4. Time Travel (Simulate Day 4)
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
        
        await prisma.careJourney.update({
            where: { id: journey.id },
            data: { createdAt: fourDaysAgo }
        });
        console.log('⏳ Time Traveled: Journey shifted to Day 4.');

        // 5. Simulate Check-ins (Day 2 SAME, Day 4 WORSE)
        console.log('📝 Submitting Check-ins...');
        await CareLifecycleService.submitCheckIn(journey.id, 2, 'SAME');
        await CareLifecycleService.submitCheckIn(journey.id, 4, 'WORSE');

        // 6. Analyze Drift
        console.log('🔍 Running Recovery Drift Analysis...');
        const stats = await CareLifecycleService.getRecoveryState(visit.id);
        const drift = await CareLifecycleService.analyzeRecoveryDrift(journey.id);

        console.log('\n--- FINAL TEST RESULTS ---');
        console.log(`Current Day: ${stats.currentDay}`);
        console.log(`Drift Detected: ${drift.drifted}`);
        console.log(`Reason: ${drift.reason}`);
        console.log(`Urgency: ${drift.urgency}`);
        console.log(`Action: ${drift.action}`);
        console.log('--------------------------\n');

        if (drift.drifted && drift.urgency === 'HIGH') {
            console.log('✨ SUCCESS: Lifecycle loop completed with correct AI escalation.');
        } else {
            console.log('❌ FAILED: Drift not detected correctly.');
        }

    } catch (error) {
        console.error('💥 Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runLifecycleTest();
