const prisma = require('../lib/prisma').default;

async function runDataSecurityTests() {
    console.log('--- STARTING DATA-LEVEL SECURITY TESTS ---');
    
    // IDs from previous debug run
    const hospA = '00940ac9-9b1c-4a30-9b42-f4fb6dd91c4a'; // Demo Hospital 19
    const hospB = '01946cc4-a5e2-4ab7-b4a0-b903-2fe991ece991'; // Another Hospital

    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // 1. UNAUTHENTICATED: Should NOT see private data if RLS works
        // (Note: some tables allow public read, check specific policy)
        const allHospitals = await prisma.hospitalsMaster.findMany({ take: 5 });
        assert(allHospitals.length > 0, 'Public can view hospitals');

        // 2. HOSPITAL ADMIN A: Accessing Hospital B info
        const sessionA = { user: { id: 'admin-a', role: 'HOSPITAL_ADMIN', hospitalId: hospA } };
        
        await prisma.withAuth(sessionA, async (authTx) => {
            // Check if can see own hospital
            const myHosp = await authTx.hospitalsMaster.findUnique({ where: { id: hospA } });
            assert(myHosp !== null, 'Hospital Admin A can see Hospital A');

            // Check if can see Hospital B (Should be NULL or filtered if strict RLS applied)
            // Current policy for hospitals_master allows Public View Active, so this might pass SELECT.
            // Let's check a strict table like 'visits'.
            
            const visitsB = await authTx.visit.findMany({ where: { hospitalId: hospB } });
            assert(visitsB.length === 0, 'Hospital Admin A cannot see Hospital B visits (Isolation)');
        });

        // 3. DOCTOR B: Accessing Hospital A data
        const sessionDocB = { user: { id: 'doc-b', role: 'DOCTOR' } }; // Not affiliated with A
        await prisma.withAuth(sessionDocB, async (authTx) => {
            const secretVisits = await authTx.visit.findMany({ where: { hospitalId: hospA } });
            assert(secretVisits.length === 0, 'Doctor B cannot see Hospital A visits');
        });

        // 4. INVALID ROLE: Trying to use a fake role
        const sessionHacker = { user: { id: 'hacker', role: 'HACKER' } };
        await prisma.withAuth(sessionHacker, async (authTx) => {
            // RLS policies only grant access to known roles
            const data = await authTx.hospitalsMaster.findMany({ where: { accountStatus: 'active' } });
            // Since Public View Active is allowed, this might pass if ROLE doesn't match PLATFORM_ADMIN
            // But let's check doctors_master (Private if not verified)
            const doctors = await authTx.doctorMaster.findMany({ where: { accountStatus: 'ACTIVE' } });
            assert(doctors.length > 0, 'Public/Unknown role can see active doctors (Public Read)');
        });

    } catch (e) {
        console.error('ERROR DURING SECURITY TEST:', e);
        failed++;
    } finally {
        await prisma.$disconnect();
    }

    console.log(`\n--- DATA TEST RESULTS: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) process.exit(1);
}

runDataSecurityTests();
