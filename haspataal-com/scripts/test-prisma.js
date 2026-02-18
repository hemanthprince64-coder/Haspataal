require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error']
});

async function main() {
    try {
        const hospitals = await prisma.hospital.findMany({ take: 1 });
        console.log('Successfully connected to DB. Found ' + hospitals.length + ' hospitals.');
    } catch (e) {
        console.error('Error connecting to DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
