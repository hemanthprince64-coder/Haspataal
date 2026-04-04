/**
 * BACKEND HEALTH CHECK SCRIPT
 * Tests: DB connection, Prisma client, service layer, auth flow
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const results = [];
function log(test, status, detail = '') {
    const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
    results.push({ test, status, detail });
    console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
}

async function run() {
    console.log('\n═══════════════════════════════════════');
    console.log('      BACKEND HEALTH CHECK');
    console.log('═══════════════════════════════════════\n');

    // 1. Database Connection
    try {
        await prisma.$queryRaw`SELECT 1 as ok`;
        log('Database Connection', 'PASS', 'PostgreSQL reachable');
    } catch (e) {
        log('Database Connection', 'FAIL', e.message);
    }

    // 2. Prisma Client Health
    try {
        const tables = await prisma.$queryRaw`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name`;
        log('Prisma Client Health', 'PASS', `${tables.length} tables found`);
    } catch (e) {
        log('Prisma Client Health', 'FAIL', e.message);
    }

    // 3. Core Table Counts
    const tableChecks = [
        { name: 'hospitals_master (Hospital)', fn: () => prisma.hospitalsMaster.count() },
        { name: 'doctors_master (DoctorMaster)', fn: () => prisma.doctorMaster.count() },
        { name: 'patients (Patient)', fn: () => prisma.patient.count() },
        { name: 'visits (Visit)', fn: () => prisma.visit.count() },
        { name: 'appointments (Appointment)', fn: () => prisma.appointment.count() },
        { name: 'hospital_admins (HospitalAdmin)', fn: () => prisma.hospitalAdmin.count() },
        { name: 'agents (Agent)', fn: () => prisma.agent.count() },
    ];

    for (const tc of tableChecks) {
        try {
            const count = await tc.fn();
            log(`Table: ${tc.name}`, 'PASS', `${count} records`);
        } catch (e) {
            log(`Table: ${tc.name}`, 'FAIL', e.message);
        }
    }

    // 4. Hospital Registration Flow
    console.log('\n--- Hospital Registration Flow ---');
    let testHospitalId;
    try {
        const hospital = await prisma.$transaction(async (tx) => {
            const h = await tx.hospitalsMaster.create({
                data: {
                    legalName: 'Health Check Test Hospital',
                    registrationNumber: `HCK-${Date.now()}`,
                    city: 'Test City',
                    contactNumber: `9${Date.now().toString().slice(-9)}`,
                    verificationStatus: 'pending',
                    accountStatus: 'inactive',
                    password: 'test123',
                    type: 'HOSPITAL'
                }
            });
            await tx.hospitalAdmin.create({
                data: {
                    hospitalId: h.id,
                    fullName: 'Health Check Admin',
                    mobile: h.contactNumber,
                    email: `hc_${Date.now()}@test.com`,
                    isPrimary: true,
                    verificationStatus: 'pending'
                }
            });
            return h;
        });
        testHospitalId = hospital.id;
        log('Hospital Register', 'PASS', `Created ID: ${hospital.id}`);
    } catch (e) {
        log('Hospital Register', 'FAIL', e.message);
    }

    // 5. Hospital Approval Flow
    if (testHospitalId) {
        try {
            await prisma.hospitalsMaster.update({
                where: { id: testHospitalId },
                data: { verificationStatus: 'verified', accountStatus: 'active' }
            });
            log('Hospital Approve', 'PASS');
        } catch (e) {
            log('Hospital Approve', 'FAIL', e.message);
        }

        // 6. Hospital Login
        try {
            const h = await prisma.hospitalsMaster.findUnique({ where: { id: testHospitalId } });
            if (h && h.password === 'test123') {
                log('Hospital Login (password check)', 'PASS');
            } else {
                log('Hospital Login (password check)', 'FAIL', 'Password mismatch');
            }
        } catch (e) {
            log('Hospital Login (password check)', 'FAIL', e.message);
        }
    }

    // 7. Doctor Registration Flow
    console.log('\n--- Doctor Registration Flow ---');
    let testDoctorId;
    try {
        const doctor = await prisma.doctorMaster.create({
            data: {
                fullName: 'Dr. Health Check',
                mobile: `8${Date.now().toString().slice(-9)}`,
                email: `dr_hc_${Date.now()}@test.com`,
                password: 'doc123',
                kycStatus: 'PENDING',
                accountStatus: 'INACTIVE'
            }
        });
        testDoctorId = doctor.id;
        log('Doctor Register', 'PASS', `Created ID: ${doctor.id}`);
    } catch (e) {
        log('Doctor Register', 'FAIL', e.message);
    }

    // 8. Doctor Affiliation
    if (testHospitalId && testDoctorId) {
        try {
            await prisma.doctorHospitalAffiliation.create({
                data: {
                    hospitalId: testHospitalId,
                    doctorId: testDoctorId,
                    role: 'DOCTOR',
                    isCurrent: true,
                    schedule: 'Mon-Fri 9AM-5PM',
                    verificationStatus: 'PENDING'
                }
            });
            log('Doctor Affiliation', 'PASS');
        } catch (e) {
            log('Doctor Affiliation', 'FAIL', e.message);
        }
    }

    // 9. Agent Registration Flow
    console.log('\n--- Agent Registration Flow ---');
    try {
        const agent = await prisma.agent.create({
            data: {
                fullName: 'Agent Health Check',
                mobile: `7${Date.now().toString().slice(-9)}`,
                email: `agent_hc_${Date.now()}@test.com`,
                password: 'agent123',
                area: 'Test Area',
                city: 'Test City',
                kycStatus: 'PENDING',
                accountStatus: 'INACTIVE',
                commissionRate: 5.0
            }
        });
        log('Agent Register', 'PASS', `Created ID: ${agent.id}`);
    } catch (e) {
        log('Agent Register', 'FAIL', e.message);
    }

    // 10. Patient Flow
    console.log('\n--- Patient Flow ---');
    try {
        const patient = await prisma.patient.upsert({
            where: { phone: `6${Date.now().toString().slice(-9)}` },
            update: {},
            create: {
                name: 'Patient Health Check',
                phone: `6${Date.now().toString().slice(-9)}`,
                city: 'Test City',
                password: 'test123'
            }
        });
        log('Patient Upsert', 'PASS', `ID: ${patient.id}`);
    } catch (e) {
        log('Patient Upsert', 'FAIL', e.message);
    }

    // 11. Appointment Flow
    if (testDoctorId) {
        console.log('\n--- Appointment Flow ---');
        try {
            // Create a patient for the appointment
            const apptPatient = await prisma.patient.create({
                data: {
                    name: 'Appt Health Check Patient',
                    phone: `5${Date.now().toString().slice(-9)}`,
                    city: 'Test City',
                    password: 'test123'
                }
            });
            const appt = await prisma.appointment.create({
                data: {
                    patientId: apptPatient.id,
                    doctorId: testDoctorId,
                    date: new Date(),
                    slot: `SLOT_HC_${Date.now()}`,
                    status: 'BOOKED'
                }
            });
            log('Appointment Create', 'PASS', `ID: ${appt.id}`);

            // Cleanup appointment data
            await prisma.appointment.delete({ where: { id: appt.id } });
            await prisma.patient.delete({ where: { id: apptPatient.id } });
        } catch (e) {
            log('Appointment Create', 'FAIL', e.message);
        }
    }

    // Cleanup
    console.log('\n--- Cleanup ---');
    try {
        if (testHospitalId) {
            await prisma.doctorHospitalAffiliation.deleteMany({ where: { hospitalId: testHospitalId } });
            await prisma.hospitalAdmin.deleteMany({ where: { hospitalId: testHospitalId } });
            await prisma.hospitalsMaster.delete({ where: { id: testHospitalId } });
        }
        if (testDoctorId) {
            await prisma.doctorMaster.delete({ where: { id: testDoctorId } });
        }
        await prisma.agent.deleteMany({ where: { fullName: 'Agent Health Check' } });
        await prisma.patient.deleteMany({ where: { name: 'Patient Health Check' } });
        log('Cleanup', 'PASS', 'Test data removed');
    } catch (e) {
        log('Cleanup', 'WARN', e.message);
    }

    // Summary
    console.log('\n═══════════════════════════════════════');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warned = results.filter(r => r.status === 'WARN').length;
    console.log(`RESULTS: ${passed} PASS | ${failed} FAIL | ${warned} WARN`);
    console.log(`BACKEND STATUS: ${failed === 0 ? '✅ HEALTHY' : '❌ ISSUES DETECTED'}`);
    console.log('═══════════════════════════════════════\n');

    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
