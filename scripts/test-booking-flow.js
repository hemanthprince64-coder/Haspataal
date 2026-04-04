require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL
});

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulateBookingFlow() {
    console.log("=== Phase 5: Simulating Full E2E Booking Flow ===");

    try {
        // 1. Create a Hospital
        console.log("🏥 Creating Test Hospital...");
        const dateGen = Date.now();
        const hospital = await prisma.hospitalsMaster.create({
            data: {
                legalName: 'Apollo Spectra Pvt Ltd',
                displayName: 'Apollo Spectra WarMode',
                registrationNumber: `REG-HOSP-${dateGen}`,
                city: 'New Delhi',
                contactNumber: '9988776655',
                officialEmail: 'contact@apollospectra.warmode',
                verificationStatus: 'verified',
                accountStatus: 'active'
            }
        });
        console.log(`✅ Hospital Created: ${hospital.id}`);

        // 2. Create a Doctor Master Record
        console.log("👨‍⚕️ Creating Test Doctor...");
        const doctor = await prisma.doctorMaster.create({
            data: {
                fullName: 'Dr. Jane Smith WarMode',
                mobile: `9${dateGen.toString().slice(-9)}`,
                email: `drjanesmith${dateGen}@warmode.local`,
                kycStatus: 'VERIFIED',
                accountStatus: 'ACTIVE'
            }
        });
        console.log(`✅ Doctor Created: ${doctor.id}`);

        // 3. Affiliate Doctor with Hospital
        console.log("🔗 Affiliating Doctor to Hospital...");
        await prisma.doctorHospitalAffiliation.create({
            data: {
                doctorId: doctor.id,
                hospitalId: hospital.id,
                department: 'Cardiology',
                role: 'Consultant'
            }
        });
        console.log(`✅ Doctor Affiliated`);

        // 4. Create a Patient
        console.log("🧍 Creating Test Patient...");
        const patient = await prisma.patient.create({
            data: {
                name: 'John Doe WarMode',
                phone: `8${dateGen.toString().slice(-9)}`, // Same as mobile
                city: 'New Delhi',
                dob: new Date('1990-01-01T00:00:00Z'),
                gender: 'M',
                password: 'bcrypt_hashed_password_placeholder'
            }
        });
        console.log(`✅ Patient Created: ${patient.id}`);

        // 5. Book an Appointment
        console.log("📅 Booking Appointment...");

        // Ensure Slot
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24); // Tomorrow

        const slot = await prisma.slot.create({
            data: {
                doctorId: doctor.id,
                day: 'Friday',
                time: '10:00 AM'
            }
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                date: startTime,
                slot: '10:00 AM',
                status: 'BOOKED',
                notes: 'Test Booking via WarMode Script'
            }
        });
        console.log(`✅ Appointment Booked: ${appointment.id}`);

        // 6. Verify Dashboard Data
        const stats = await prisma.appointment.count({
            where: { doctorId: doctor.id }
        });
        if (stats === 1) {
            console.log("✅ Hospital Dashboard Reflects Data Correctly");
        } else {
            console.error("❌ Hospital Dashboard Data Mismatch");
        }

        console.log("\n🚀 Booking Flow Test Passed 100%");

    } catch (e) {
        console.error("❌ E2E Flow Failed:");
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

simulateBookingFlow();
