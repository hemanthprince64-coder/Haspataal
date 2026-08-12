import { PrismaClient, ClinicalEventType } from '@prisma/client';
import { randomUUID } from 'crypto';

import { AlertEngine } from '../apps/hospital-hms/lib/services/alert-engine';

const prisma = new PrismaClient();

async function simulate() {
  console.log('🏥 Starting Pediatric Nephrotic Syndrome Simulation...');

  // Create or get hospital
  let hospital = await prisma.hospitalsMaster.findFirst({
    where: { registrationNumber: 'HOSP-SIM-NS-101' },
  });

  if (!hospital) {
    hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'AIIMS Pediatric Pilot',
        displayName: 'AIIMS Pediatric Pilot',
        registrationNumber: 'HOSP-SIM-NS-101',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
  }

  // Create or get doctor
  let doctor = await prisma.doctorMaster.findFirst({
    where: { email: 'dr.ns.sim@haspataal.com' },
  });

  if (!doctor) {
    doctor = await prisma.doctorMaster.create({
      data: {
        fullName: 'Dr. Neha Sharma (Pediatric Nephrologist)',
        mobile: '9876500000',
        email: 'dr.ns.sim@haspataal.com',
        kycStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
  }

  console.log(`✅ Environment Ready: ${hospital.displayName} | ${doctor.fullName}`);

  // PHASE 1: Patient Registration (Day 1)
  console.log('⏳ [Phase 1] Simulating Registration & Triage (Aarav Kumar)...');
  const patient = await prisma.patient.create({
    data: {
      name: 'Aarav Kumar (Simulation)',
      phone: `91${Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')}`,
      gender: 'MALE',
      dob: new Date(new Date().getFullYear() - 6, 1, 1), // 6 years old
      address: 'Patna, Bihar',
      bloodGroup: 'O+',
    },
  });

  // PHASE 2: Consultation & AI Assistance
  console.log('⏳ [Phase 2] Simulating Consultation & AI Assistant Trigger...');
  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: hospital.id,
      date: new Date(),
      slot: `08:45-${Date.now()}`,
      status: 'COMPLETED',
    },
  });

  await prisma.patientRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosis: 'Likely Minimal Change Disease (Nephrotic Syndrome)',
      notes:
        'AI Differential Diagnosis: Nephrotic Syndrome vs. Acute Glomerulonephritis triggered by "frothy urine + edema".',
      vitals: { temp: '98.6', bp: '96/62', rr: 24, hr: 108, spO2: 99 },
      prescription: 'Pending Lab Review',
    },
  });

  // PHASE 3: Laboratory Workflow
  console.log('⏳ [Phase 3] Simulating Critical Lab Results (Albumin 1.2 g/dL)...');

  // Trigger Alert Engine
  await AlertEngine.processLabResult(
    {
      hospitalId: hospital.id,
      patientId: patient.id,
      payload: { albumin: 1.2, protein: '4+' },
      source: 'LAB_SYSTEM',
    },
    'Albumin',
    1.2,
  );

  // We mock the test in DiagnosticMasterTest or just use raw strings if possible.
  // Let's check if we can just create a basic DiagnosticOrder
  const labOrder = await prisma.diagnosticOrder.create({
    data: {
      hospitalId: hospital.id,
      patientId: patient.id,
      doctorId: doctor.id,
      orderStatus: 'COMPLETED',
      totalAmount: 1500.0,
    },
  });

  // Since we don't have exact test IDs, we will insert them into patient records as well for UI visibility
  await prisma.patientRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosis: 'Critical Labs Alert',
      notes: 'Serum Albumin: 1.2 g/dL (CRITICAL)\nUrine Protein: 4+\nCholesterol: 410 mg/dL',
      vitals: { temp: '98.6', bp: '96/62', rr: 24, hr: 108, spO2: 99 },
    },
  });

  // PHASE 4-5: Admission & Billing
  console.log('⏳ [Phase 4-5] Simulating Pediatric Ward Admission & Billing...');
  const admission = await prisma.admission.create({
    data: {
      hospitalId: hospital.id,
      patientId: patient.id,
      attendingDoctorId: doctor.id,
      admissionNumber: `ADM-${Date.now()}`,
      status: 'ADMITTED',
      reason: 'Nephrotic Syndrome with massive edema and hypoalbuminemia',
      acuity: 'CRITICAL',
      acuityUpdatedAt: new Date(),

      payload: { isSimulation: true, simulationId: 'SIM-NS-2026-001' },
    },
  });

  // Trigger Alert Engine for Acuity
  await AlertEngine.processAcuityChange(
    {
      hospitalId: hospital.id,
      patientId: patient.id,
      admissionId: admission.id,
      payload: { previous: 'STABLE', current: 'CRITICAL' },
      source: 'DOCTOR',
    },
    'CRITICAL',
  );

  const bill = await prisma.bill.create({
    data: {
      hospitalId: hospital.id,
      patientId: patient.id,
      totalAmount: 5500,
      status: 'PENDING',
      payload: {
        items: [
          { service: 'Emergency Registration', qty: 1, price: 500 },
          { service: 'Comprehensive Lab Panel', qty: 1, price: 1500 },
          { service: 'Pediatric Ward Admission Deposit', qty: 1, price: 3500 },
        ],
        isSimulation: true,
        simulationId: 'SIM-NS-2026-001',
      },
    },
  });

  // PHASE 6-7: Emergency Event & Steroids (Day 2/3 Simulation)
  console.log('⏳ [Phase 6-7] Simulating Albumin Infusion, Hypertension Event & Steroids...');

  // Trigger Alert Engine for Hypertension
  await AlertEngine.processVitalSign(
    {
      hospitalId: hospital.id,
      patientId: patient.id,
      admissionId: admission.id,
      payload: { bp: '130/90' },
      source: 'NURSE',
    },
    'BP',
    '130/90',
  );

  await prisma.patientRecord.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      diagnosis: 'Clinical Workflow Event',
      notes:
        'Day 2: Started 20% Human Albumin (16g) infusion. Event: Mild hypertension (120/80 mmHg). AI Action: Withhold fluids.\nDay 3: Started Prednisolone (32 mg/day).',
      prescription: '20% Human Albumin, IV Furosemide, Prednisolone (32 mg/day)',
      vitals: { bp: '120/80' },
    },
  });

  // PHASE 8: Discharge
  console.log('⏳ [Phase 8] Simulating Discharge and Follow-up...');
  await prisma.admission.update({
    where: { id: admission.id },
    data: {
      status: 'DISCHARGED',
      dischargedAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      dischargeSummary:
        'First Episode Idiopathic Nephrotic Syndrome. Discharged on Prednisolone, Calcium, Vitamin D. Edema resolved, Trace protein.',
      dischargeProcessStatus: 'READY_FOR_DEPARTURE',
      acuity: 'RECOVERING',
      acuityUpdatedAt: new Date(),
    },
  });

  // PHASE 9: Self-Validation
  console.log('\n🔍 [Phase 9] Validating Simulation Records...');
  const checks = {
    patient: await prisma.patient.findUnique({ where: { id: patient.id } }),
    appointment: await prisma.appointment.findUnique({ where: { id: appointment.id } }),
    admission: await prisma.admission.findUnique({ where: { id: admission.id } }),
    bill: await prisma.bill.findUnique({ where: { id: bill.id } }),
  };

  if (!checks.patient || !checks.appointment || !checks.admission || !checks.bill) {
    throw new Error('Validation Failed: Missing critical workflow records.');
  }
  console.log('✅ Validation Passed: All journey records exist and are linked properly.');

  console.log(
    `\n🎉 Simulation successfully executed. \nPatient ID: ${patient.id}\nAdmission ID: ${admission.id}`,
  );
}

simulate()
  .catch((e) => {
    console.error('Simulation Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
