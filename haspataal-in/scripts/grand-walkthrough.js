const prisma = require('../lib/prisma').default;

// Colors for console output
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

function log(step, message) {
    console.log(`${colors.cyan}[Step ${step}]${colors.reset} ${message}`);
}

function success(message) {
    console.log(`${colors.green}  ✅ ${message}${colors.reset}`);
}

function error(message) {
    console.log(`${colors.red}  ❌ ${message}${colors.reset}`);
}

async function main() {
    console.log(`${colors.yellow}🚀 Starting Haspataal Grand Walkthrough (System Integration Test)${colors.reset}\n`);

    try {
        // --- PRE-REQUISITES ---
        log(1, "Setting up Actors (Patient, Hospital, Admin, Doctor)...");

        // 1. Ensure Hospital Exists
        let hospital = await prisma.hospital.findFirst({ where: { registrationNumber: 'HOSP-GW-001' } });
        if (!hospital) {
            hospital = await prisma.hospital.create({
                data: {
                    legalName: 'Grand Walkthrough Hospital',
                    displayName: 'GW Hospital',
                    addressLine1: '1 Integration Way',
                    city: 'Cyber City',
                    pincode: '999999',
                    state: 'Virtual State',
                    contactNumber: '9988776655',
                    officialEmail: 'gw@hospital.com',
                    registrationNumber: 'HOSP-GW-001'
                }
            });
            success("Hospital Created/Found");
        }

        // 2. Ensure Admin Exists
        let admin = await prisma.hospitalAdmin.findFirst({ where: { mobile: '9988776655' } });
        if (!admin) {
            admin = await prisma.hospitalAdmin.create({
                data: {
                    mobile: '9988776655',
                    fullName: 'GW Admin',
                    email: 'admin@gw.com',
                    hospitalId: hospital.id,
                    isPrimary: true
                }
            });
            success("Admin Created/Found");
        }

        // 3. Ensure Doctor Exists (and associate if needed, though mostly loosely coupled in prototype)
        let doctor = await prisma.doctorMaster.findFirst({ where: { mobile: '8877665544' } });
        if (!doctor) {
            doctor = await prisma.doctorMaster.create({
                data: {
                    mobile: '8877665544',
                    fullName: 'Dr. Integration',
                    email: 'dr@gw.com'
                }
            });
            success("Doctor Created/Found");
        }

        // 4. Ensure Patient Exists (This would typically be in haspataal.com DB, but shared schema here)
        // Schema uses 'Patient' model, not 'User'. Fields are 'name', 'phone'.
        let patient = await prisma.patient.findFirst({ where: { phone: '7766554433' } });
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    phone: '7766554433',
                    name: 'Priya Patient',
                    password: 'hashed_pw_placeholder'
                }
            });
            success("Patient Created/Found");
        }

        // 5. Ensure a Diagnostic Test exists in the hospital
        let test = await prisma.diagnosticMasterTest.findFirst({ where: { testCode: 'GW-TEST-01' } });
        if (!test) {
            // Need a category
            const category = await prisma.diagnosticCategory.upsert({
                where: { name: 'Integration Tests' },
                update: {},
                create: { name: 'Integration Tests' }
            });

            test = await prisma.diagnosticMasterTest.create({
                data: {
                    testName: 'System Integrity Check',
                    testCode: 'GW-TEST-01',
                    categoryId: category.id,
                    turnaroundTimeHours: 24,
                    sampleType: 'Blood'
                }
            });
        }

        // Price it
        await prisma.hospitalDiagnosticPricing.upsert({
            where: {
                hospitalId_testId: { hospitalId: hospital.id, testId: test.id }
            },
            update: { price: 500, isAvailable: true },
            create: { hospitalId: hospital.id, testId: test.id, price: 500, isAvailable: true }
        });
        success("Test Catalog configured");


        // --- STEP 2: PATIENT JOURNEY ---
        log(2, "Patient Action: Booking a Diagnostic Order...");

        const order = await prisma.diagnosticOrder.create({
            data: {
                hospitalId: hospital.id,
                patientId: patient.id,
                doctorId: doctor.id, // Prescribed by
                orderStatus: 'ordered',
                totalAmount: 500,
                // orderDate: new Date(), // Using createdAt default
                items: {
                    create: {
                        testId: test.id,
                        priceAtOrder: 500,
                        status: 'pending'
                    }
                }
            },
            include: { items: true }
        });

        if (order) success(`Order #${order.id.slice(0, 8)} Created successfully.`);
        else throw new Error("Failed to create order");


        // --- STEP 3: ADMIN JOURNEY ---
        log(3, "Admin Action: verifying Order Visibility...");

        const adminViewOrder = await prisma.diagnosticOrder.findFirst({
            where: {
                id: order.id,
                hospitalId: hospital.id // Admin scope check
            }
        });

        if (adminViewOrder) success("Admin can see the new order.");
        else throw new Error("Admin cannot see the order!");


        // --- STEP 4: DOCTOR JOURNEY ---
        log(4, "Doctor Action: Entering Results & Finalizing...");

        const orderItemId = order.items[0].id;

        // 4a. Enter Result
        const result = await prisma.diagnosticResult.create({
            data: {
                orderItemId: orderItemId,
                resultValue: '100% Passed',
                resultFlag: 'normal',
                verifiedBy: doctor.id, // The logged in doctor
                verifiedAt: new Date(),
                structuredData: { notes: 'Automated Integration Test' }
            }
        });
        success(`Result entered: ${result.resultValue}`);

        // 4b. Update Item Status
        await prisma.diagnosticOrderItem.update({
            where: { id: orderItemId },
            data: { status: 'completed' }
        });

        // 4c. Finalize Order
        const finalizedOrder = await prisma.diagnosticOrder.update({
            where: { id: order.id },
            data: { orderStatus: 'completed' }
        });

        if (finalizedOrder.orderStatus === 'completed') success("Order Finalized by Doctor.");
        else throw new Error("Order status failed to update to completed");


        // --- STEP 5: CLOSING THE LOOP ---
        log(5, "Patient Action: Verifying Result Availability...");

        const patientViewOrder = await prisma.diagnosticOrder.findUnique({
            where: { id: order.id },
            include: {
                items: {
                    include: { results: true }
                }
            }
        });

        const patientResult = patientViewOrder.items[0].results[0];

        if (patientResult && patientResult.resultValue === '100% Passed') {
            success("Patient can see the finalized result!");
        } else {
            throw new Error("Patient cannot see result!");
        }

        console.log(`\n${colors.green}🎉 GRAND WALKTHROUGH SUCCESSFUL! The Haspataal Ecosystem is operational.${colors.reset}\n`);

    } catch (e) {
        console.error(`\n${colors.red}💥 WALKTHROUGH FAILED:${colors.reset}`, e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
