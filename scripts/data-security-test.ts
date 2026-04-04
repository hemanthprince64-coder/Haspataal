import prisma from '../lib/prisma';

async function runDataSecurityTests() {
    console.log('--- STARTING DATA-LEVEL SECURITY TESTS ---');
    
    // IDs from previous debug run
    const hospA = '00940ac9-9b1c-4a30-9b42-f4fb6dd91c4a'; // Demo Hospital 19
    const hospB = '01946cc4-a5e2-4ab7-b4a0-b903-2fe991ece991'; // Another Hospital

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // 1. UNAUTHENTICATED: Should see public data
        const allHospitals = await prisma.hospitalsMaster.findMany({ take: 5 });
        assert(allHospitals.length > 0, 'Public can view hospitals');

        // 2. HOSPITAL ADMIN A: Accessing Hospital B info
        const sessionA: any = { user: { id: 'admin-a', role: 'HOSPITAL_ADMIN', hospitalId: hospA } };
        
        // @ts-ignore - withAuth is a custom helper added in prisma.ts
        await prisma.withAuth(sessionA, async (authTx: any) => {
            // Check if can see own hospital
            const myHosp = await authTx.hospitalsMaster.findUnique({ where: { id: hospA } });
            assert(myHosp !== null, 'Hospital Admin A can see Hospital A');

            // Check isolation for visits
            const visitsB = await authTx.visit.findMany({ where: { hospitalId: hospB } });
            assert(visitsB.length === 0, 'Hospital Admin A cannot see Hospital B visits (Isolation)');
        });

        // 3. DOCTOR B: Accessing Hospital A data
        const sessionDocB: any = { user: { id: 'doc-b', role: 'DOCTOR' } };
        // @ts-ignore
        await prisma.withAuth(sessionDocB, async (authTx: any) => {
            const secretVisits = await authTx.visit.findMany({ where: { hospitalId: hospA } });
            assert(secretVisits.length === 0, 'Doctor B cannot see Hospital A visits');
        });

    } catch (e) {
        console.error('ERROR DURING SECURITY TEST:', e);
        failed++;
    } finally {
        await prisma.$disconnect();
    }

    console.log(`\n--- DATA TEST RESULTS: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) process.exit(1);
    process.exit(0);
}

runDataSecurityTests();
