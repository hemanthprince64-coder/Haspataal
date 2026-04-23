require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("--- Existing tables in public schema ---");
    console.table(tables);
  } catch (e) {
    console.error("Error fetching tables:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
