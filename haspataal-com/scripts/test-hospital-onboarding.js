require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Hospital Onboarding Verification...');

    try {
        // 1. Create Hospital (Pending)
        const hospitalReg = `HREG-${Date.now()}`;
        console.log(`Creating Hospital with Reg: ${hospitalReg}`);

        const hospital = await prisma.hospital.create({
            data: {
                legalName: 'New Global Hospital Ltd',
                displayName: 'Global Hospital',
                registrationNumber: hospitalReg,
                city: 'New York',
                verificationStatus: 'pending',
                accountStatus: 'inactive'
            }
        });
        console.log('✅ Hospital created:', hospital.id);

        // 2. Add Facilities
        const facilities = await prisma.hospitalFacilities.create({
            data: {
                hospitalId: hospital.id,
                icuAvailable: true,
                otCount: 4,
                emergency24x7: true
            }
        });
        console.log('✅ Facilities added:', facilities.id);

        // 3. Add Primary Admin
        const adminMobile = `+9177777${Math.floor(Math.random() * 100000)}`;
        const admin = await prisma.hospitalAdmin.create({
            data: {
                hospitalId: hospital.id,
                fullName: 'Admin User',
                mobile: adminMobile,
                email: `admin.${Date.now()}@hospital.com`,
                isPrimary: true,
                verificationStatus: 'pending'
            }
        });
        console.log('✅ Primary Admin added:', admin.id);

        // 4. Add Billing Profile
        const billing = await prisma.hospitalBillingProfile.create({
            data: {
                hospitalId: hospital.id,
                bankAccountNumber: '1234567890',
                bankIfsc: 'HDFC0001234',
                payoutCycle: 'monthly'
            }
        });
        console.log('✅ Billing Profile added:', billing.id);

        // 5. Verify Structure
        const fullHospital = await prisma.hospital.findUnique({
            where: { id: hospital.id },
            include: {
                facilities: true,
                admins: true,
                billingProfile: true
            }
        });

        console.log('🔍 Verified Onboarding Data:');
        console.log(`- Hospital: ${fullHospital.displayName} (${fullHospital.verificationStatus})`);
        console.log(`- ICU: ${fullHospital.facilities.icuAvailable}`);
        console.log(`- Admin: ${fullHospital.admins[0].fullName} (${fullHospital.admins[0].mobile})`);
        console.log(`- Billing IFSC: ${fullHospital.billingProfile.bankIfsc}`);

    } catch (e) {
        console.error('❌ Onboarding Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
