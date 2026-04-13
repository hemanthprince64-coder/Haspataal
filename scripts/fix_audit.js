const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- FIXING DATABASE INCONSISTENCIES ---');
    
    // Deactivate doctors with PENDING KYC but ACTIVE account
    const result = await prisma.doctorMaster.updateMany({
        where: {
            kycStatus: 'PENDING',
            accountStatus: 'ACTIVE'
        },
        data: {
            accountStatus: 'SUSPENDED'
        }
    });

    console.log(`[Success] Deactivated ${result.count} doctors due to incomplete KYC.`);

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
