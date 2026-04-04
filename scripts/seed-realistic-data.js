/**
 * SEED REALISTIC TEST DATA v2
 * With retry logic for Supabase pooler connection drops
 */
import { PrismaClient } from '@prisma/client';

const SPECIALITIES = [
    'General Physician', 'Cardiology', 'Orthopedics', 'Dermatology',
    'Pediatrics', 'Gynecology', 'ENT', 'Ophthalmology',
    'Neurology', 'Psychiatry', 'Urology', 'Gastroenterology',
    'Pulmonology', 'Nephrology', 'Oncology'
];

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];

const HOSPITAL_NAMES = [
    'Apollo Health Center', 'Max Super Speciality', 'Fortis Medical', 'Medanta The Medicity',
    'AIIMS Extended Care', 'Narayana Health Hub', 'Manipal Hospitals', 'Columbia Asia',
    'Kokilaben Dhirubhai', 'Lilavati Hospital', 'Jaslok Hospital', 'Hinduja Healthcare',
    'Rainbow Children', 'KIMS Hospital', 'Care Hospitals', 'Yashoda Hospitals',
    'Shalby Multispeciality', 'Global Hospitals', 'Aster DM Health', 'Sakra World Hospital'
];

const FIRST_NAMES = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Meera', 'Arun', 'Kavita', 'Deepak', 'Nisha', 'Rahul', 'Anjali', 'Suresh', 'Pooja', 'Manish'];
const LAST_NAMES = ['Sharma', 'Patel', 'Gupta', 'Singh', 'Kumar', 'Reddy', 'Joshi', 'Verma', 'Mehta', 'Nair', 'Iyer', 'Rao', 'Das', 'Bhat', 'Kapoor'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomPhone() { return `9${Math.floor(100000000 + Math.random() * 899999999)}`; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function withRetry(fn, label, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i < retries - 1 && e.message.includes("Can't reach database")) {
                console.log(`  ⏳ Retry ${i + 1}/${retries} for ${label} (connection drop)...`);
                await sleep(2000 * (i + 1));
            } else {
                throw e;
            }
        }
    }
}

async function seed() {
    // Fresh client each time to avoid stale connections
    let prisma = new PrismaClient();

    console.log('\n🌱 SEEDING REALISTIC TEST DATA (v2 with retries)\n');
    console.log('═══════════════════════════════════════');

    let totalHospitals = 0, totalDoctors = 0, totalSlots = 0, totalPatients = 0;

    // Check existing hospitals to skip already-seeded ones
    const existing = await withRetry(() => prisma.hospitalsMaster.findMany({
        where: { registrationNumber: { startsWith: 'REG-SEED-' } },
        select: { legalName: true }
    }), 'check existing');
    const existingNames = new Set(existing.map(h => h.legalName));

    for (let i = 0; i < HOSPITAL_NAMES.length; i++) {
        const hospitalName = HOSPITAL_NAMES[i];
        const city = CITIES[i % CITIES.length];

        if (existingNames.has(hospitalName)) {
            console.log(`⏭️  Hospital ${i + 1}/20: ${hospitalName} — already exists, skipping`);
            totalHospitals++;
            continue;
        }

        try {
            // Reconnect prisma to avoid stale pooler connections
            await prisma.$disconnect();
            prisma = new PrismaClient();

            const adminPhone = randomPhone();

            const hospital = await withRetry(() => prisma.hospitalsMaster.create({
                data: {
                    legalName: hospitalName,
                    registrationNumber: `REG-SEED-${i + 1}-${Date.now()}`,
                    city,
                    contactNumber: adminPhone,
                    verificationStatus: 'verified',
                    accountStatus: 'active',
                    password: `hospital${i + 1}`,
                    type: 'HOSPITAL'
                }
            }), `hospital ${hospitalName}`);

            await withRetry(() => prisma.hospitalAdmin.create({
                data: {
                    hospitalId: hospital.id,
                    fullName: `Admin ${hospitalName}`,
                    mobile: adminPhone,
                    email: `admin${i + 1}_${Date.now()}@haspataal.com`,
                    isPrimary: true,
                    verificationStatus: 'verified'
                }
            }), `admin for ${hospitalName}`);

            totalHospitals++;

            // Create 8 doctors per hospital (reduced from 15 for speed)
            const specialities = [...SPECIALITIES].sort(() => Math.random() - 0.5);
            for (let d = 0; d < 8; d++) {
                const firstName = randomPick(FIRST_NAMES);
                const lastName = randomPick(LAST_NAMES);
                const spec = specialities[d % specialities.length];

                try {
                    const doctor = await withRetry(() => prisma.doctorMaster.create({
                        data: {
                            fullName: `Dr. ${firstName} ${lastName}`,
                            mobile: randomPhone(),
                            email: `dr.${firstName.toLowerCase()}.${Date.now()}${d}${i}@haspataal.com`,
                            password: `doctor${d + 1}`,
                            kycStatus: 'VERIFIED',
                            accountStatus: 'ACTIVE',
                            affiliations: {
                                create: {
                                    hospitalId: hospital.id,
                                    role: 'DOCTOR',
                                    department: spec,
                                    isCurrent: true,
                                    schedule: d < 5 ? 'Mon-Fri 9AM-5PM' : 'Mon-Sat 10AM-6PM',
                                    verificationStatus: 'VERIFIED'
                                }
                            }
                        }
                    }), `doctor ${d + 1} for ${hospitalName}`);

                    totalDoctors++;

                    // Create 3 slots per day (reduced for speed)
                    for (const day of DAYS) {
                        const daySlots = [...SLOTS].sort(() => Math.random() - 0.5).slice(0, 3);
                        for (const time of daySlots) {
                            try {
                                await prisma.slot.create({ data: { doctorId: doctor.id, day, time } });
                                totalSlots++;
                            } catch { /* skip dupes */ }
                        }
                    }
                } catch { /* skip dupes */ }
            }

            console.log(`✅ Hospital ${i + 1}/20: ${hospitalName} (${city})`);
        } catch (e) {
            console.log(`⚠️  Hospital ${i + 1}/20: ${hospitalName} — ${e.message.substring(0, 60)}`);
        }
    }

    // Seed 20 test patients
    console.log('\n--- Seeding Test Patients ---');
    for (let p = 0; p < 20; p++) {
        try {
            await withRetry(() => prisma.patient.create({
                data: {
                    name: `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`,
                    phone: randomPhone(),
                    city: randomPick(CITIES),
                    password: `patient${p + 1}`,
                    age: 20 + Math.floor(Math.random() * 50),
                    gender: Math.random() > 0.5 ? 'Male' : 'Female'
                }
            }), `patient ${p + 1}`);
            totalPatients++;
        } catch { /* skip dupes */ }
    }
    console.log(`✅ ${totalPatients} patients created`);

    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('        SEED SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log(`  Hospitals: ${totalHospitals}`);
    console.log(`  Doctors:   ${totalDoctors}`);
    console.log(`  Slots:     ${totalSlots}`);
    console.log(`  Patients:  ${totalPatients}`);
    console.log(`\n  SEED STATUS: ${totalHospitals >= 18 ? '✅ SUCCESS' : '⚠️ PARTIAL'}`);
    console.log('═══════════════════════════════════════\n');

    await prisma.$disconnect();
}

seed().catch(e => {
    console.error('Fatal seed error:', e);
    process.exit(1);
});
