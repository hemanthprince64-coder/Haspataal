import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debug() {
    try {
        const h = await prisma.hospitalsMaster.create({
            data: {
                legalName: 'Debug Test Hospital',
                registrationNumber: `DBG-${Date.now()}`,
                city: 'Delhi',
                contactNumber: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
                verificationStatus: 'verified',
                accountStatus: 'active',
                password: 'test',
                type: 'HOSPITAL'
            }
        });
        console.log('Hospital OK:', h.id);
        await prisma.hospitalsMaster.delete({ where: { id: h.id } });
    } catch (e) {
        console.log('Hospital ERR:', e.message);
    }

    try {
        const p = await prisma.patient.create({
            data: {
                name: 'Debug Patient',
                phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
                city: 'Delhi',
                password: 'test123'
            }
        });
        console.log('Patient OK:', p.id);
        await prisma.patient.delete({ where: { id: p.id } });
    } catch (e) {
        console.log('Patient ERR:', e.message);
    }

    await prisma.$disconnect();
}

debug();
