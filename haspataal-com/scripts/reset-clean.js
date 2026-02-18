require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Cleaning database tables...');

        // Delete dependent tables first
        await prisma.doctorHospitalAffiliation.deleteMany({});
        await prisma.doctorRole.deleteMany({});
        await prisma.doctorRegistration.deleteMany({}); // Optional, but good for clean slate
        await prisma.doctorMaster.deleteMany({});

        // Hospital tables logic might be tricky if schema mismatch.
        // Try to delete via raw SQL if model mismatch
        await prisma.$executeRawUnsafe(`DELETE FROM doctor_hospital_affiliations;`);
        // await prisma.$executeRawUnsafe(`DELETE FROM hospitals;`); // Old table
        // await prisma.$executeRawUnsafe(`DELETE FROM hospitals_master;`); // New table

        console.log('✅ Database cleaned.');
    } catch (e) {
        console.error('Error cleaning DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
