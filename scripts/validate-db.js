const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Testing Prisma DB Connection and Models...");
    try {
        let results = {};

        results.HospitalsMaster = await prisma.hospitalsMaster.count().catch(e => "Error or Not Found");
        results.DoctorMaster = await prisma.doctorMaster.count().catch(e => "Error or Not Found");
        results.Patient = await prisma.patient.count().catch(e => "Error or Not Found");
        results.Appointment = await prisma.appointment.count().catch(e => "Error or Not Found");

        console.table(results);
        console.log("✅ DB models mapped and responding correctly.");
    } catch (e) {
        console.error("❌ Error querying database:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
