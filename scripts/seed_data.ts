import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const hospitalId = "2c1f11e9-4084-4206-9131-655ded89f98a"; // Apollo

  console.log("Seeding data for Apollo...");

  // 1. Seed Beds
  await prisma.bed.deleteMany({ where: { hospitalId } });
  
  const beds = [
    { bedNumber: "GW-101", type: "GENERAL", status: "AVAILABLE" },
    { bedNumber: "GW-102", type: "GENERAL", status: "OCCUPIED" },
    { bedNumber: "ICU-201", type: "ICU", status: "AVAILABLE" },
    { bedNumber: "ICU-202", type: "ICU", status: "OCCUPIED" },
    { bedNumber: "PVT-301", type: "PRIVATE", status: "AVAILABLE" },
  ];

  for (const b of beds) {
    await prisma.bed.create({
      data: {
        hospitalId,
        bedNumber: b.bedNumber,
        type: b.type as any,
        status: b.status as any,
      }
    });
  }

  // 2. Seed Pharmacy Stock
  await prisma.drugStock.deleteMany({ where: { hospitalId } });
  const drugs = [
    { name: "Paracetamol 500mg", stock: 500, minLevel: 100, category: "Analgesic", expiryDate: new Date("2026-12-31") },
    { name: "Amoxicillin 250mg", stock: 50, minLevel: 100, category: "Antibiotic", expiryDate: new Date("2025-06-30") },
    { name: "Insulin Glargine", stock: 20, minLevel: 10, category: "Antidiabetic", expiryDate: new Date("2025-01-15") },
  ];

  for (const d of drugs) {
    await prisma.drugStock.create({
      data: { ...d, hospitalId }
    });
  }

  // 3. Seed Lab Orders (Need a patient)
  await prisma.labOrder.deleteMany({ where: { hospitalId } });
  const patient = await prisma.patient.findFirst();
  if (patient) {
    await prisma.labOrder.createMany({
      data: [
        { hospitalId, patientId: patient.id, testName: "Complete Blood Count", status: "COMPLETED", result: "Normal" },
        { hospitalId, patientId: patient.id, testName: "HbA1c", status: "PENDING" },
        { hospitalId, patientId: patient.id, testName: "Liver Function Test", status: "IN_PROGRESS" },
      ]
    });
  }

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
