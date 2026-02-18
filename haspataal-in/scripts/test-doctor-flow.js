const prisma = require('../lib/prisma').default;

// Mock form data class since we are in node
class FormData {
    constructor() { this.data = {}; }
    append(key, value) { this.data[key] = value; }
    get(key) { return this.data[key]; }
}

async function main() {
    console.log('Starting Doctor Flow Verification...');

    try {
        // 1. Setup: Ensure we have a pending order
        // We'll fetch the most recent pending order
        const order = await prisma.diagnosticOrder.findFirst({
            where: { orderStatus: { not: 'completed' } },
            include: { items: true }
        });

        if (!order) {
            console.log('⚠️ No pending orders found to test. Please create one via Patient App first.');
            return;
        }

        console.log(`✅ Found Order: ${order.id} (Status: ${order.orderStatus})`);
        const item = order.items[0];
        if (!item) {
            console.log('❌ Order has no items.');
            return;
        }

        // 2. Test: Update Result
        console.log(`Testing Result Update for Item: ${item.id}`);
        // Can't easily import server actions in standalone script due to 'use server' and next headers.
        // We will call Prisma directly to simulate what the action does, 
        // OR we try to import the logic. 
        // Importing 'app/actions/doctor.js' might fail due to 'use server' directive in Node environment without Next.js build.
        // So we will SIMULATE the logic here to verify valid database operations.

        // Simulate updateDiagnosticResult
        const resultValue = "15.5";
        const resultFlag = "high";
        const notes = "Verified via Script";
        // Fetch a real doctor for verification
        const doctor = await prisma.doctorMaster.findFirst();
        if (!doctor) {
            console.log('❌ No doctors found. Cannot verify result.');
            return;
        }
        const doctorId = doctor.id;
        console.log(`Using Verifier (Doctor): ${doctor.fullName} (${doctorId})`);

        const result = await prisma.diagnosticResult.create({
            data: {
                orderItemId: item.id,
                resultValue,
                resultFlag,
                verifiedBy: doctorId,
                verifiedAt: new Date(),
                structuredData: { notes }
            }
        });

        console.log(`✅ Result Created: ${result.id} -> Value: ${result.resultValue}`);

        // Update Item Status
        await prisma.diagnosticOrderItem.update({
            where: { id: item.id },
            data: { status: 'completed' }
        });
        console.log('✅ Item marked completed.');

        // 3. Test: Finalize Order
        console.log('Testing Finalize Order...');
        const updatedOrder = await prisma.diagnosticOrder.update({
            where: { id: order.id },
            data: { orderStatus: 'completed' }
        });
        console.log(`✅ Order Finalized. Status: ${updatedOrder.orderStatus}`);

    } catch (e) {
        console.error('❌ Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
