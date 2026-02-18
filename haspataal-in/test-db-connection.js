const prisma = require('./lib/prisma').default;

async function main() {
    try {
        console.log('Testing Database Connection for haspataal-in...');

        // 1. Fetch Hospital
        const hospital = await prisma.hospital.findFirst();
        if (hospital) {
            console.log('✅ Hospital Access Success:', hospital.legalName);
        } else {
            console.log('⚠️ No hospitals found, but connection seems OK.');
        }

        // 2. Fetch Doctor
        const doctor = await prisma.doctorMaster.findFirst();
        if (doctor) {
            console.log('✅ Doctor Access Success:', doctor.fullName);
        } else {
            console.log('⚠️ No doctors found, but connection seems OK.');
        }

    } catch (e) {
        console.error('❌ Connection Failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
