require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creating missing Care Journey tables...");

    // RecoveryStep
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS recovery_steps (
        id TEXT PRIMARY KEY,
        care_journey_id TEXT NOT NULL REFERENCES care_journeys(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        expected_symptoms TEXT NOT NULL,
        markers TEXT NOT NULL,
        guidance TEXT NOT NULL
      );
    `);
    console.log("Table 'recovery_steps' created.");

    // EngagementLog
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS engagement_logs (
        id TEXT PRIMARY KEY,
        care_journey_id TEXT NOT NULL REFERENCES care_journeys(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Table 'engagement_logs' created.");

    // CareCheckIn
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS care_check_ins (
        id TEXT PRIMARY KEY,
        care_journey_id TEXT NOT NULL REFERENCES care_journeys(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        status TEXT NOT NULL,
        analysis TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );
    `);
    console.log("Table 'care_check_ins' created.");

    // NudgeSchedule
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS nudge_schedules (
        id TEXT PRIMARY KEY,
        care_journey_id TEXT NOT NULL REFERENCES care_journeys(id) ON DELETE CASCADE,
        scheduled_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        message_type TEXT NOT NULL,
        is_triggered BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("Table 'nudge_schedules' created.");

    console.log("All missing Care Journey tables created successfully.");
  } catch (e) {
    console.error("Error creating tables:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
