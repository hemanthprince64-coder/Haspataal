const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Usage: node scripts/simulate-journey.js [visitId] [daysToAdvance]
 */
async function simulateTimeTravel() {
    const visitId = process.argv[2];
    const days = parseInt(process.argv[3]) || 1;

    if (!visitId) {
        console.error('Usage: node scripts/simulate-journey.js [visitId] [daysToAdvance]');
        process.exit(1);
    }

    try {
        const journey = await prisma.careJourney.findUnique({
            where: { visitId }
        });

        if (!journey) {
            console.error(`CareJourney with visitId ${visitId} not found.`);
            process.exit(1);
        }

        const newCreatedAt = new Date(journey.createdAt);
        newCreatedAt.setDate(newCreatedAt.getDate() - days);

        console.log(`Advancing journey ${journey.id} by ${days} days...`);
        console.log(`Original CreatedAt: ${journey.createdAt.toISOString()}`);
        console.log(`Target CreatedAt: ${newCreatedAt.toISOString()}`);

        await prisma.$transaction([
            // 1. Move the journey start date back
            prisma.careJourney.update({
                where: { id: journey.id },
                data: { createdAt: newCreatedAt }
            }),
            // 2. Adjust all scheduled nudges to be due
            prisma.nudgeSchedule.updateMany({
                where: { careJourneyId: journey.id },
                data: {
                    scheduledAt: {
                        set: new Date(new Date().getTime() - 60000) // set to 1 minute ago
                    }
                }
            })
        ]);

        console.log('Successfully simulated time travel. Run nudge processor to fire nudges.');
    } catch (error) {
        console.error('Simulation failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

simulateTimeTravel();
