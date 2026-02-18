require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting Diagnostic Services Verification...');

    try {
        // 0. Clean Diagnostics
        await prisma.diagnosticResult.deleteMany({});
        await prisma.diagnosticOrderItem.deleteMany({});
        await prisma.diagnosticOrder.deleteMany({});
        await prisma.hospitalDiagnosticPricing.deleteMany({});
        await prisma.diagnosticMasterTest.deleteMany({});
        await prisma.diagnosticCategory.deleteMany({});

        // 1. Create Global Master Data
        const pathology = await prisma.diagnosticCategory.create({
            data: { name: 'Pathology' }
        });
        console.log('✅ Category created:', pathology.name);

        const cbc = await prisma.diagnosticMasterTest.create({
            data: {
                categoryId: pathology.id,
                testName: 'Complete Blood Count (CBC)',
                testCode: 'PATH-001',
                sampleType: 'Blood',
                method: 'Automated Cell Counter',
                turnaroundTimeHours: 24,
                normalRangeText: 'Varies by age/gender'
            }
        });
        console.log('✅ Test created:', cbc.testName);

        // 2. Setup Hospital Pricing (Need a Hospital)
        // Find existing or create one
        let hospital = await prisma.hospital.findFirst({ where: { verificationStatus: 'pending' } }); // From previous test
        if (!hospital) {
            hospital = await prisma.hospital.create({
                data: {
                    legalName: 'Diag Test Hospital',
                    registrationNumber: `DIAG-${Date.now()}`,
                    status: 'APPROVED',
                    verificationStatus: 'verified'
                }
            });
        }
        console.log('ℹ️ Using Hospital:', hospital.legalName);

        const pricing = await prisma.hospitalDiagnosticPricing.create({
            data: {
                hospitalId: hospital.id,
                testId: cbc.id,
                price: 500.00,
                tatOverrideHours: 12 // Faster analysis
            }
        });
        console.log('✅ Pricing set:', pricing.price);

        // 3. Create Order
        // Need Patient and Doctor
        let patient = await prisma.patient.findFirst();
        if (!patient) {
            patient = await prisma.patient.create({
                data: { name: 'Test Patient', phone: '9999999999', password: 'pass', role: 'PATIENT' }
            });
        }

        let doctor = await prisma.doctorMaster.findFirst();
        if (!doctor) {
            doctor = await prisma.doctorMaster.create({
                data: { fullName: 'Dr. Diag', mobile: '+919999988888', email: 'diag@test.com' }
            });
        }

        const order = await prisma.diagnosticOrder.create({
            data: {
                hospitalId: hospital.id,
                patientId: patient.id,
                doctorId: doctor.id,
                orderStatus: 'ordered',
                totalAmount: 500.00,
                items: {
                    create: {
                        testId: cbc.id,
                        priceAtOrder: 500.00,
                        status: 'pending'
                    }
                }
            },
            include: { items: true }
        });
        console.log('✅ Order created:', order.id);

        // 4. Enter Result
        const item = order.items[0];
        const result = await prisma.diagnosticResult.create({
            data: {
                orderItemId: item.id,
                resultValue: 'Hemoglobin: 14.5 g/dL',
                resultFlag: 'normal',
                verifiedBy: doctor.id,
                verifiedAt: new Date()
            }
        });
        console.log('✅ Result entered:', result.resultValue);

        // 5. Verify Fetch
        const fullOrder = await prisma.diagnosticOrder.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: {
                        results: true,
                        test: true
                    }
                }
            }
        });

        console.log('🔍 Verified Diagnostic Order:');
        console.log(`- Status: ${fullOrder.orderStatus}`);
        console.log(`- Test: ${fullOrder.items[0].test.testName}`);
        console.log(`- Price: ${fullOrder.items[0].priceAtOrder}`);
        console.log(`- Result: ${fullOrder.items[0].results[0].resultValue}`);

    } catch (e) {
        console.error('❌ Diagnostic Verification Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
