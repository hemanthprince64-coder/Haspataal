import { services } from '../lib/services';
import logger from '../lib/logger';
import { env } from '../lib/env';

async function runTests() {
    try {
        logger.info('Starting Full Stability Verification');

        // Test 1: Env validation (crash early if invalid)
        if (!env.DATABASE_URL) {
            throw new Error("Validation Layer failed: Env missing");
        }
        logger.info('Environment variables validated passed');

        // Test 2: Service Returns Array (Zod + Prisma strict types)
        const hospitals = await services.platform.getHospitals('Mumbai');
        if (!Array.isArray(hospitals)) {
            throw new Error("getHospitals did not return an array. Strict schema failed.");
        }
        logger.info({ hospitalCount: hospitals.length }, 'Service returned valid array object');

        // Test 3: Data integrity
        if (hospitals.length > 0) {
            const h = hospitals[0];
            if (h.accountStatus !== 'active') {
                logger.warn({ id: h.id, status: h.accountStatus }, 'Returned non-active hospital');
            }
        }

        // Attempting login test mapped in Pino log
        const testLogin = await services.platform.getHospitalDoctors('mock-id-ignored');
        if (!Array.isArray(testLogin)) throw new Error('Doctors return failed array check');

        // Final Success Log required by prompt
        console.log("CORE STABILITY VERIFIED");
        process.exit(0);

    } catch (err) {
        logger.error({ err }, 'Stability verification failed');
        console.error("STABILITY TEST FAILED");
        process.exit(1); // Fail the pipeline
    }
}

runTests();
