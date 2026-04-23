require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding missing column 'status' to 'care_journeys'...");
    await prisma.$executeRawUnsafe(`
      ALTER TABLE care_journeys 
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE';
    `);
    console.log("Column 'status' added successfully.");
  } catch (e) {
    console.error("Error adding column:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
