const prisma = require('../lib/prisma').default;

async function main() {
    console.log('Starting Auth Logic Verification...');

    try {
        // 1. Create Mock Users if they don't exist for testing
        // Admin
        const adminMobile = '9999999999';
        let admin = await prisma.hospitalAdmin.findUnique({ where: { mobile: adminMobile } });

        if (!admin) {
            // Need a hospital first
            const hospital = await prisma.hospital.create({
                data: {
                    legalName: 'Auth Test Hospital',
                    displayName: 'Auth Test', // brandName -> displayName
                    addressLine1: 'Test Addr', // address -> addressLine1
                    city: 'Test City',
                    pincode: '123456',
                    state: 'Test State',
                    contactNumber: '8888888888', // mobile -> contactNumber
                    officialEmail: 'test@hospital.com', // email -> officialEmail
                    registrationNumber: 'HOSP-TEST-001'
                }
            });

            admin = await prisma.hospitalAdmin.create({
                data: {
                    mobile: adminMobile,
                    fullName: 'Test Admin',
                    email: 'admin@test.com',
                    hospitalId: hospital.id,
                    isPrimary: true
                }
            });
            console.log('✅ Created Mock Admin:', admin.mobile);
        } else {
            console.log('ℹ️ Mock Admin exists:', admin.mobile);
        }

        // Doctor
        const docMobile = '7777777777';
        let doctor = await prisma.doctorMaster.findUnique({ where: { mobile: docMobile } });

        if (!doctor) {
            doctor = await prisma.doctorMaster.create({
                data: {
                    mobile: docMobile,
                    fullName: 'Dr. Auth Test',
                    email: 'doc@test.com'
                }
            });
            console.log('✅ Created Mock Doctor:', doctor.mobile);
        } else {
            console.log('ℹ️ Mock Doctor exists:', doctor.mobile);
        }

        // 2. Simulate Login Logic (Mirroring auth.js authorize function)
        console.log('\n--- Testing Login Logic ---');

        // Test Admin Login
        const adminCreds = { mobile: adminMobile, password: '1234', role: 'admin' };
        const authAdmin = await prisma.hospitalAdmin.findUnique({
            where: { mobile: adminCreds.mobile },
            include: { hospital: true }
        });

        if (authAdmin && adminCreds.password === '1234') {
            console.log('✅ Admin Login Success:', authAdmin.fullName);
        } else {
            console.error('❌ Admin Login Failed');
        }

        // Test Doctor Login
        const docCreds = { mobile: docMobile, password: '1234', role: 'doctor' };
        const authDoc = await prisma.doctorMaster.findUnique({
            where: { mobile: docCreds.mobile }
        });

        if (authDoc && docCreds.password === '1234') {
            console.log('✅ Doctor Login Success:', authDoc.fullName);
        } else {
            console.error('❌ Doctor Login Failed');
        }

        // Test Invalid Login
        const invalidCreds = { mobile: '0000000000', password: '1234', role: 'admin' };
        const authInvalid = await prisma.hospitalAdmin.findUnique({
            where: { mobile: invalidCreds.mobile }
        });

        if (!authInvalid) {
            console.log('✅ Invalid Login correctly rejected (User not found).');
        } else {
            console.error('❌ Invalid Login passed unexpectedly.');
        }

    } catch (e) {
        console.error('❌ Verification Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
