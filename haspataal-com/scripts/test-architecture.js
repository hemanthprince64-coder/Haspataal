require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Architecture Verification...');

    try {
        // 1. Create DoctorMaster
        const mobile = `+9199999${Math.floor(Math.random() * 100000)}`;
        const email = `dr.test.${Date.now()}@example.com`;

        console.log(`Creating Doctor with mobile: ${mobile}`);

        const doctor = await prisma.doctorMaster.create({
            data: {
                fullName: 'Dr. Test Architecture',
                mobile: mobile,
                email: email,
                accountStatus: 'ACTIVE',
                kycStatus: 'VERIFIED'
            }
        });
        console.log('✅ DoctorMaster created:', doctor.id);

        // 2. Create Registration
        const regNumber = `REG-${Date.now()}`;
        const registration = await prisma.doctorRegistration.create({
            data: {
                doctorId: doctor.id,
                registrationNumber: regNumber,
                councilName: 'Test Medical Council',
                registrationYear: 2020,
                verificationStatus: 'VERIFIED'
            }
        });
        console.log('✅ DoctorRegistration created:', registration.registrationNumber);

        // 3. Create Hospital
        const hospitalPhone = `+9188888${Math.floor(Math.random() * 100000)}`;
        const hospital = await prisma.hospital.create({
            data: {
                legalName: 'Test Multi-Tenant Hospital', // Changed from name to legalName
                displayName: 'Test Hospital Display Name',
                registrationNumber: `HREG-${Date.now()}`,
                city: 'Metropolis',
                phone: hospitalPhone,
                status: 'APPROVED'
            }
        });
        console.log('✅ Hospital created:', hospital.id);

        // 4. Create Affiliation
        const affiliation = await prisma.doctorHospitalAffiliation.create({
            data: {
                doctorId: doctor.id,
                hospitalId: hospital.id,
                role: 'Consultant',
                department: 'Cardiology',
                isCurrent: true,
                verificationStatus: 'VERIFIED'
            }
        });
        console.log('✅ Affiliation created:', affiliation.id);

        // 5. Verify Data Fetching
        const doctorWithAffiliations = await prisma.doctorMaster.findUnique({
            where: { id: doctor.id },
            include: {
                affiliations: {
                    include: {
                        hospital: true
                    }
                },
                registration: true
            }
        });

        console.log('🔍 Verified Fetch:');
        console.log(`- Doctor: ${doctorWithAffiliations.fullName}`);
        console.log(`- Branding: ${doctorWithAffiliations.registration.registrationNumber}`);
        console.log(`- Affiliations: ${doctorWithAffiliations.affiliations.length}`);
        console.log(`- First Hospital: ${doctorWithAffiliations.affiliations[0].hospital.displayName}`);

    } catch (e) {
        console.error('❌ Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
