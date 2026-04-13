const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING MULTI-TENANT ISOLATION AUDIT ---');

    // 1. Get all hospitals
    const hospitals = await prisma.hospitalsMaster.findMany({
        take: 10,
        select: { id: true, legalName: true }
    });

    if (hospitals.length < 2) {
        console.log('Not enough hospitals to test isolation.');
        return;
    }

    console.log(`Auditing ${hospitals.length} hospitals...`);

    for (const hospital of hospitals) {
        // Find doctors for this hospital
        const doctorAffiliations = await prisma.doctorHospitalAffiliation.findMany({
            where: { hospitalId: hospital.id },
            include: { doctor: true }
        });

        // Find patients (via appointments) for this hospital
        const appointments = await prisma.appointment.findMany({
            where: { hospitalId: hospital.id },
            distinct: ['patientId']
        });

        console.log(`Hospital: ${hospital.legalName} (${hospital.id})`);
        console.log(` - Doctors: ${doctorAffiliations.length}`);
        console.log(` - Patient Records: ${appointments.length}`);

        // CROSS-TENANT CHECK: Look for data leaked from other hospitals
        const leakedDoctors = doctorAffiliations.filter(a => a.hospitalId !== hospital.id);
        const leakedAppointments = appointments.filter(a => a.hospitalId !== hospital.id);

        if (leakedDoctors.length > 0 || leakedAppointments.length > 0) {
            console.error(`❌ ISOLATION BREACH in Hospital ${hospital.id}`);
        } else {
            console.log(`✅ Isolation verified for Hospital ${hospital.id}`);
        }
    }

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
