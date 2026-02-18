require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Schema Finalization Verification...');

    try {
        // 0. Clean Reviews
        await prisma.review.deleteMany({});

        // 1. Create Patient with Profile
        const patientPhone = `+91${Math.floor(Math.random() * 10000000000)}`;
        const patient = await prisma.patient.create({
            data: {
                name: 'Reviewer Rohit',
                phone: patientPhone,
                password: 'hashedpassword',
                role: 'PATIENT',
                dob: new Date('1990-01-01'),
                gender: 'Male',
                bloodGroup: 'O+',
                address: '123 Health St, Wellness City',
                pincode: '110001'
            }
        });
        console.log('✅ Patient created with profile:', patient.name, patient.bloodGroup);

        // 2. Find Targets
        const doctor = await prisma.doctorMaster.findFirst();
        const hospital = await prisma.hospital.findFirst();

        if (!doctor || !hospital) {
            throw new Error('Need at least one doctor and hospital to test reviews.');
        }

        // 3. Create Doctor Review
        const docReview = await prisma.review.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                rating: 5,
                comment: 'Excellent diagnosis!'
            }
        });
        console.log('✅ Doctor Review created:', docReview.rating);

        // 4. Create Hospital Review
        const hospReview = await prisma.review.create({
            data: {
                patientId: patient.id,
                hospitalId: hospital.id,
                rating: 4,
                comment: 'Good facilities but waiting time was long.'
            }
        });
        console.log('✅ Hospital Review created:', hospReview.rating);

        // 5. Verify Relations
        const doctorWithReviews = await prisma.doctorMaster.findUnique({
            where: { id: doctor.id },
            include: { reviews: true }
        });
        console.log(`🔍 Doctor Reviews: ${doctorWithReviews.reviews.length} (Last: ${doctorWithReviews.reviews[0].comment})`);

        const hospitalWithReviews = await prisma.hospital.findUnique({
            where: { id: hospital.id },
            include: { reviews: true }
        });
        console.log(`🔍 Hospital Reviews: ${hospitalWithReviews.reviews.length} (Last: ${hospitalWithReviews.reviews[0].comment})`);

    } catch (e) {
        console.error('❌ Schema Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
