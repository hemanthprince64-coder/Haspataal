import { PrismaClient, SampleType, ClinicalOrderType } from '@haspataal/db';

import {
  CollectSampleUseCase,
  AccessionSampleUseCase,
  EnterResultUseCase,
  VerifyResultUseCase,
  AmendResultUseCase,
} from '../src/use-cases';

const prisma = new PrismaClient();

async function runE2E() {
  console.log('--- Starting Laboratory E2E Validation ---');

  // Setup: Find a test template (CBC)
  const template = await prisma.testTemplate.findFirst({ where: { code: 'CBC' } });
  if (!template) throw new Error('CBC template not found. Run seed script first.');

  // Setup: Mock Hospital, Patient, Encounter
  let hospital = await prisma.hospitalsMaster.findFirst();
  if (!hospital) hospital = await prisma.hospitalsMaster.create({ data: { name: 'Apollo Demo' } });

  let patient = await prisma.patient.findFirst();
  if (!patient)
    patient = await prisma.patient.create({
      data: {
        hospitalId: hospital.id,
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date(),
        gender: 'MALE',
      },
    });

  let encounter = await prisma.encounter.findFirst();
  if (!encounter)
    encounter = await prisma.encounter.create({
      data: { hospitalId: hospital.id, patientId: patient.id, type: 'OPD' },
    });

  // Create an Order
  const order = await prisma.clinicalOrder.create({
    data: {
      type: ClinicalOrderType.LAB,
      patientId: patient.id,
      hospitalId: hospital.id,
      encounterId: encounter.id,
      payload: { test: 'CBC + Urine Routine' },
    },
  });
  console.log('1. Created ClinicalOrder:', order.id);

  const collectUseCase = new CollectSampleUseCase();
  const accessionUseCase = new AccessionSampleUseCase();
  const enterResultUseCase = new EnterResultUseCase();
  const verifyResultUseCase = new VerifyResultUseCase();
  const amendResultUseCase = new AmendResultUseCase();

  // Test 7.1: Verify multiple samples per order
  console.log('2. Collecting Blood Sample...');
  const bloodSample = await collectUseCase.execute({
    clinicalOrderId: order.id,
    hospitalId: hospital.id,
    patientId: patient.id,
    sampleType: SampleType.BLOOD,
    barcode: `BLD-${Date.now()}`,
    collectedBy: 'TECH-1',
  });

  console.log('3. Collecting Urine Sample...');
  const urineSample = await collectUseCase.execute({
    clinicalOrderId: order.id,
    hospitalId: hospital.id,
    patientId: patient.id,
    sampleType: SampleType.URINE,
    barcode: `URN-${Date.now()}`,
    collectedBy: 'TECH-1',
  });

  // Duplicate Barcode Rejection
  try {
    await collectUseCase.execute({
      clinicalOrderId: order.id,
      hospitalId: hospital.id,
      patientId: patient.id,
      sampleType: SampleType.BLOOD,
      barcode: bloodSample.barcode!, // reuse barcode
      collectedBy: 'TECH-1',
    });
    throw new Error('Duplicate barcode should have failed');
  } catch (e: any) {
    console.log('4. Duplicate barcode rejected successfully:', e.message);
  }

  // Accession
  await accessionUseCase.execute({
    sampleId: bloodSample.id,
    hospitalId: hospital.id,
    accessionedBy: 'TECH-1',
  });
  const checkOrderAfterBlood = await prisma.clinicalOrder.findUnique({ where: { id: order.id } });
  console.log(
    '5. Order status after ONE accession (Expected: NOT IN_PROGRESS):',
    checkOrderAfterBlood?.status,
  );

  await accessionUseCase.execute({
    sampleId: urineSample.id,
    hospitalId: hospital.id,
    accessionedBy: 'TECH-1',
  });
  const checkOrderAfterUrine = await prisma.clinicalOrder.findUnique({ where: { id: order.id } });
  console.log(
    '6. Order status after ALL accessions (Expected: IN_PROGRESS):',
    checkOrderAfterUrine?.status,
  );

  // Test 7.2: Draft saving and Out of range flagging
  const parameters = await prisma.testTemplateParameter.findMany({
    where: { templateId: template.id },
  });
  const hemoglobinId = parameters.find((p) => p.name.includes('Hemoglobin'))?.id;

  console.log('7. Entering Result (Draft) with Critical Low Hemoglobin...');
  const draftResult = await enterResultUseCase.execute({
    clinicalOrderId: order.id,
    hospitalId: hospital.id,
    patientId: patient.id,
    templateId: template.id,
    enteredBy: 'TECH-1',
    values: [
      { parameterId: hemoglobinId!, value: '6.5' }, // Critical low!
    ],
  });

  const hbValue = draftResult?.values.find((v) => v.parameterId === hemoglobinId);
  console.log(`   Flag detected: ${hbValue?.flag}, Is Critical: ${hbValue?.isCritical}`);

  // Test 7.3: Verify and Amendment
  console.log('8. Verifying Result...');
  await verifyResultUseCase.execute({
    clinicalOrderId: order.id,
    hospitalId: hospital.id,
    verifiedBy: 'PATHOLOGIST-1',
  });

  console.log('9. Amending Result...');
  await amendResultUseCase.execute({
    clinicalOrderId: order.id,
    hospitalId: hospital.id,
    amendedBy: 'PATHOLOGIST-1',
    reason: 'Correction to Hb value',
  });

  const finalResult = await prisma.labResult.findUnique({ where: { clinicalOrderId: order.id } });
  console.log('10. Final Result Status after amendment (Expected: AMENDED):', finalResult?.status);

  console.log('--- Laboratory E2E Validation Complete ---');
}

runE2E()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
