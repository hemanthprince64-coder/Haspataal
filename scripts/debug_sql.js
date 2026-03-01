const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const sql = fs.readFileSync('scripts/supabase_security_hardening.sql', 'utf8');
    // split naively by sections (DO blocks and CREATE statements)
    const statements = sql.split(/;\s*$/m).filter(s => s.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
        const s = statements[i].trim();
        if (!s) continue;
        try {
            console.log(`\nExecuting block ${i + 1}:\n` + s.substring(0, 100) + '...');
            if (s.toLowerCase().startsWith('do $$')) {
                // Prisma queryRawUnsafe executes correctly for DO blocks
                await prisma.$executeRawUnsafe(s);
            } else {
                await prisma.$executeRawUnsafe(s);
            }
            console.log('✅ Success');
        } catch (e) {
            console.error('❌ Failed!');
            console.error(e.message);
            process.exit(1);
        }
    }
}

main().finally(() => prisma.$disconnect());
