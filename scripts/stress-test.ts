const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const pino = require('pino');
const logger = pino({ level: 'info' });
const { services } = require('../lib/services');

async function runConcurrencyTest() {
    logger.info('Starting Week 3 Stress Test: Concurrency & Race Conditions');

    const doctorId = 'test-doctor-' + Date.now();
    const date = new Date();
    date.setDate(date.getDate() + 1); // Tomorrow
    const dateString = date.toISOString().split('T')[0];
    const slotTime = '10:00';
    const hospitalId = 'test-hospital-' + Date.now();

    try {
        // 1. Setup Test Data - Satisfy Foreign Keys!
        logger.info('Creating mock Doctor and Hospital to satisfy FK constraints...');
        await prisma.hospitalsMaster.create({
            data: {
                id: hospitalId,
                legalName: 'Test Concurrency Hospital',
                registrationNumber: 'REG-' + Date.now()
            }
        });

        await prisma.doctorMaster.create({
            data: {
                id: doctorId,
                fullName: 'Dr. Concurrency Test',
                mobile: `999${Date.now().toString().slice(-7)}`,
                email: `drtest${Date.now()}@example.com`
            }
        });

        logger.info({ doctorId, hospitalId, date: dateString, slot: slotTime }, 'Generated test slot targets');
        // 2. Simulate 5 Simultaneous Clicks 
        // Five separate users trying to hit 'Book' on the same slot at the exact same millisecond
        logger.info('Simulating 5 simultaneous parallel requests via Promise.all...');

        const parallelRequests = Array.from({ length: 5 }).map((_, index) => {
            return services.patient.createVisit(hospitalId, {
                patientMobile: `999990000${index}`,
                patientName: `Test Patient ${index}`,
                doctorId: doctorId,
                date: dateString,
                slot: slotTime
            }).catch(e => ({ error: e.message }));
        });

        // Fire them all mathematically parallel
        const results = await Promise.all(parallelRequests);

        // 3. Analyze Results
        const successes = results.filter(r => !r.error);
        const failures = results.filter(r => r.error);

        logger.info({
            totalRequests: 5,
            successes: successes.length,
            failures: failures.length
        }, 'Concurrency Results Processed');

        if (successes.length === 1 && failures.length === 4) {
            logger.info('✅ STRESS TEST PASSED: Exactly 1 mathematically validated success and 4 locks.');
        } else {
            logger.fatal('❌ STRESS TEST FAILED: Concurrency leak detected! Bookings: ' + successes.length);
            process.exit(1);
        }

        // 4. Verify DB Row Count
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);

        const dbVerification = await prisma.appointment.count({
            where: { doctorId, date: targetDate, slot: slotTime }
        });

        if (dbVerification === 1) {
            logger.info('✅ DB INTEGRITY PASSED: Only 1 row exists in DB for this slot.');
        } else {
            logger.fatal('❌ DB INTEGRITY FAILED: Duplicate rows found in database! Rows: ' + dbVerification);
            process.exit(1);
        }

    } catch (e) {
        logger.error({ error: e }, 'Fatal test error');
    } finally {
        // Cleanup test data
        logger.info('Cleaning up test data...');
        try {
            await prisma.appointment.deleteMany({ where: { doctorId } });
            await prisma.doctorMaster.deleteMany({ where: { id: doctorId } });
            await prisma.hospitalsMaster.deleteMany({ where: { id: hospitalId } });
        } catch (cleanupErr) {
            logger.warn('Cleanup warning (safe to ignore if cascaded): ' + cleanupErr.message);
        }

        await prisma.$disconnect();
    }
}

runConcurrencyTest();
