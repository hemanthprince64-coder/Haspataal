const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING DATABASE AUDIT ---');
    
    // 1. Audit Doctor KYC vs Account Status
    const suspiciousDoctors = await prisma.doctorMaster.findMany({
        where: {
            kycStatus: 'PENDING',
            accountStatus: 'ACTIVE'
        }
    });
    console.log(`[Audit] Doctors with PENDING KYC but ACTIVE account: ${suspiciousDoctors.length}`);
    suspiciousDoctors.forEach(d => console.log(` - ${d.fullName} (${d.email})`));

    // 2. Audit Orphaned Appointments
    const appointments = await prisma.appointment.findMany();
    const patients = await prisma.patient.findMany({ select: { id: true } });
    const doctors = await prisma.doctorMaster.findMany({ select: { id: true } });
    
    const patientIds = new Set(patients.map(p => p.id));
    const doctorIds = new Set(doctors.map(d => d.id));

    const orphaned = appointments.filter(a => !patientIds.has(a.patientId) || !doctorIds.has(a.doctorId));
    console.log(`[Audit] Orphaned appointments found: ${orphaned.length}`);

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
