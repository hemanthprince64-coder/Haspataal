const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const tableNames = [
        'agents', 'diagnostic_master_tests', 'diagnostic_order_items', 'diagnostic_orders',
        'diagnostic_panel_tests', 'diagnostic_panels', 'diagnostic_results', 'doctor_flags',
        'doctor_hospital_affiliations', 'doctor_identity_docs', 'doctor_registration', 'doctor_roles',
        'doctors_master', 'hospital_panel_pricing', 'hospital_roles', 'hospital_verification_logs',
        'lab_quality_controls', 'patient_records', 'reviews', 'slots', 'staff'
    ];
    const res = await prisma.$queryRawUnsafe(`SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('${tableNames.join("','")}')`);
    const tables = {};
    for (const r of res) {
        if (!tables[r.table_name]) tables[r.table_name] = [];
        tables[r.table_name].push(r.column_name);
    }
    console.log(JSON.stringify(tables, null, 2));
}
main().finally(() => prisma.$disconnect());
