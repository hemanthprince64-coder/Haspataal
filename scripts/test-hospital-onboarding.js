const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Instead of directly importing services.ts which requires TS setup,
// we'll simulate what the service does or use it via tsx if we have it.
// The project is a Next.js app, we can use `npx tsx` to run it.

async function testOnboarding() {
    console.log('--- Starting Hospital Onboarding Test ---');
    const { services } = require('../lib/services.ts');

    const testMobile = `999${Math.floor(Math.random() * 10000000)}`;

    const data = {
        hospitalName: 'Test Integration Hospital',
        city: 'Mumbai',
        adminName: 'Integration Admin',
        mobile: testMobile,
        password: 'password123'
    };

    try {
        console.log('1. Registering Hospital...');
        const newHospital = await services.hospital.register(data);
        console.log(`✅ Hospital registered with ID: ${newHospital.id}, Status: ${newHospital.verificationStatus}`);

        console.log('2. Admin fetching pending hospitals...');
        const pending = await services.admin.getPendingHospitals();
        const found = pending.find(h => h.id === newHospital.id);
        if (found) {
            console.log('✅ Hospital found in pending list.');
        } else {
            throw new Error('Hospital NOT found in pending list!');
        }

        console.log('3. Admin approving hospital...');
        await services.admin.approveHospital(newHospital.id);
        console.log('✅ Hospital approved.');

        console.log('4. Attempting Hospital Admin Login...');
        // Let's check if the admin login logic uses password? 
        // Hospital.login checks `contactNumber` and `password`. But we didn't save the password to the hospital record!
        // Let's check if login works.
        const loginResult = await services.hospital.login(testMobile, 'password123');
        if (loginResult) {
            console.log('✅ Hospital logged in successfully.');
        } else {
            console.log('❌ Hospital login failed! (Note: The test checks password but register did not save it in Hospital!)');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testOnboarding();
