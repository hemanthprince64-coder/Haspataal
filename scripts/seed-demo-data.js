require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL
});

const SPECIALTIES = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fixed UUID generator fallback or simple date trick to prevent unique conflicts
let globalCounter = Date.now();

async function seedData() {
    console.log("=== Phase 6: Seeding Demo Data ===");
    try {
        // 1. Create 20 Hospitals
        console.log("🏥 Seeding 20 Hospitals...");
        const hospitals = [];
        for (let i = 1; i <= 20; i++) {
            const h = await prisma.hospital.create({
                data: {
                    legalName: `Demo Hospital ${i} Pvt Ltd`,
                    displayName: `Haspataal Care ${i}`,
                    registrationNumber: `REG-DEMO-${globalCounter++}`,
                    city: randomElement(CITIES),
                    contactNumber: `98${globalCounter.toString().slice(-8)}`,
                    officialEmail: `info${globalCounter}@demohospital.com`,
                    verificationStatus: 'verified',
                    accountStatus: 'active'
                }
            });
            hospitals.push(h);
        }

        // 2. Create Doctors (5 specialties * 3 doctors = 15 per hospital = 300 total)
        console.log("👨‍⚕️ Seeding 300 Doctors and Affiliations...");
        const allDoctors = [];

        for (const hospital of hospitals) {
            for (const specialty of SPECIALTIES) {
                for (let j = 1; j <= 3; j++) {
                    const doc = await prisma.doctorMaster.create({
                        data: {
                            fullName: `Dr. ${specialty} Expert ${globalCounter++}`,
                            mobile: `99${globalCounter.toString().slice(-8)}`,
                            email: `doctor${globalCounter}@democlinic.com`,
                            kycStatus: 'VERIFIED',
                            accountStatus: 'ACTIVE'
                        }
                    });

                    await prisma.doctorHospitalAffiliation.create({
                        data: {
                            doctorId: doc.id,
                            hospitalId: hospital.id,
                            department: specialty,
                            role: 'Consultant'
                        }
                    });

                    // Create some slots for the doctor to allow appointments
                    const docSlots = [];
                    for (let x = 0; x < 2; x++) {
                        docSlots.push({
                            doctorId: doc.id,
                            day: randomElement(DAYS),
                            time: randomElement(TIMES)
                        });
                    }

                    // Prisma createMany is only available natively for simple models, so let's loop
                    for (const s of docSlots) {
                        // try to avoid unique constraint if we randomly generated duplicate day/time
                        try {
                            await prisma.slot.create({ data: s });
                        } catch (e) { }
                    }

                    allDoctors.push(doc);
                }
            }
        }

        // 3. Create 50 Patients
        console.log("🧍 Seeding 50 Patients...");
        const patients = [];
        for (let i = 1; i <= 50; i++) {
            const p = await prisma.patient.create({
                data: {
                    name: `Demo Patient ${i}`,
                    phone: `88${globalCounter.toString().slice(-8)}`,
                    city: randomElement(CITIES),
                    dob: new Date(`${randomNumber(1960, 2010)}-01-01T00:00:00Z`),
                    gender: randomElement(['M', 'F', 'O']),
                    password: 'hashed_password_demo'
                    // abhaId is optional, skipping to avoid unique logic
                }
            });
            patients.push(p);
            globalCounter++;
        }

        // 4. Create 100 Appointments
        console.log("📅 Seeding 100 Appointments...");
        for (let i = 1; i <= 100; i++) {
            const patient = randomElement(patients);
            const doctor = randomElement(allDoctors);

            // Generate a date in the next 30 days
            const date = new Date();
            date.setDate(date.getDate() + randomNumber(1, 30));

            try {
                await prisma.appointment.create({
                    data: {
                        patientId: patient.id,
                        doctorId: doctor.id,
                        date: date,
                        slot: randomElement(TIMES),
                        status: randomElement(['BOOKED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
                        notes: 'Demo seeded appointment'
                    }
                });
            } catch (e) {
                // Ignore unique constraint [doctorId, date, slot] hits and skip that iteration
            }
        }

        console.log("\n✅ Demo Data Seeding Complete!");

        // Output final counts
        const stats = {
            hospitals: await prisma.hospital.count(),
            doctors: await prisma.doctorMaster.count(),
            patients: await prisma.patient.count(),
            appointments: await prisma.appointment.count()
        };
        console.table(stats);

    } catch (e) {
        console.error("❌ Seeding Failed:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedData();
