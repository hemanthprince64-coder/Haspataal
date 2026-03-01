const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    console.log("Testing pooler connection (DATABASE_URL)...");
    try {
        const prisma = new PrismaClient({
            datasources: { db: { url: process.env.DATABASE_URL } }
        });
        await prisma.$connect();
        console.log("Pooler connection successful!");
        await prisma.$disconnect();
    } catch (e) {
        console.error("Pooler connection failed:", e.message);
    }

    console.log("\nTesting direct connection (DIRECT_URL)...");
    try {
        const prisma = new PrismaClient({
            datasources: { db: { url: process.env.DIRECT_URL } }
        });
        await prisma.$connect();
        console.log("Direct connection successful!");
        await prisma.$disconnect();
    } catch (e) {
        console.error("Direct connection failed:", e.message);
    }
}

main();
