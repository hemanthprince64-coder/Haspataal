require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = ['care_journeys', 'medication_plans', 'follow_up_plans', 'care_red_flags', 'recovery_steps', 'engagement_logs', 'care_check_ins', 'nudge_schedules'];
    
    for (const table of tables) {
      const columns = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
      console.log(`--- ${table} columns ---`);
      console.table(columns);
    }
  } catch (e) {
    console.error("Error fetching columns:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
