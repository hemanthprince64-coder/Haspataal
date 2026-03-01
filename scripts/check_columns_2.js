const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const res = await prisma.$queryRawUnsafe(`SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('payments', 'hospital_admins', 'hospital_departments', 'doctor_professional_history', 'hospital_billing_profile')`);
    const tables = {};
    for (const r of res) {
        if (!tables[r.table_name]) tables[r.table_name] = [];
        tables[r.table_name].push(r.column_name);
    }
    console.log(JSON.stringify(tables, null, 2));
}
main().finally(() => prisma.$disconnect());
