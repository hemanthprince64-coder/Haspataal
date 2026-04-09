import { PrismaClient } from '@prisma/client';
import { CareLifecycleService } from '../lib/services/care-lifecycle.ts';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function runRawTest() {
    console.log('🚀 Starting Continuous Care Engine Raw SQL Test...');
    try {
        const rand = Math.floor(Math.random() * 900000) + 100000;
        
        // 1. Raw SQL Insert (Bypasses Client Field Checks)
        const visitId = `VISIT-${rand}`;
        const patientId = `PATIENT-${rand}`;
        const journeyId = `JOURNEY-${rand}`;
        
        console.log(`✅ Creating Mock Journey for ${visitId}...`);
        
        // Insert Visit first
        await prisma.$executeRaw`INSERT INTO visits (id, hospital_id, patient_name, patient_phone, diagnosis, created_at) VALUES (${visitId}, 'REG123', 'Test', '999', 'Acute Bronchitis', now())`;
        
        // Insert Journey
        await prisma.$executeRaw`INSERT INTO care_journeys (id, visit_id, condition_simple, explanation, seriousness, timeline, created_at) VALUES (${journeyId}, ${visitId}, 'Acute Bronchitis', 'Mock', 'MODERATE', '7 Days', now() - interval '4 days')`;
        
        // Insert Check-ins
        await prisma.$executeRaw`INSERT INTO care_check_ins (id, care_journey_id, day_number, status, created_at) VALUES (${crypto.randomUUID()}, ${journeyId}, 2, 'SAME', now() - interval '2 days')`;
        await prisma.$executeRaw`INSERT INTO care_check_ins (id, care_journey_id, day_number, status, created_at) VALUES (${crypto.randomUUID()}, ${journeyId}, 4, 'WORSE', now())`;

        console.log('📝 Data Seeded via Raw SQL.');
        
        // 2. Run Drift Analysis
        const { CareLifecycleService } = require('../lib/services/care-lifecycle');
        const drift = await CareLifecycleService.analyzeRecoveryDrift(journeyId);

        console.log('\n--- FINAL TEST RESULTS ---');
        console.log(`Drift Detected: ${drift.drifted}`);
        console.log(`Reason: ${drift.reason}`);
        console.log(`Urgency: ${drift.urgency}`);
        console.log('--------------------------\n');

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

runRawTest();
