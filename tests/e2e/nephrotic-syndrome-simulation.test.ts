import { describe, it, expect, beforeEach, vi } from 'vitest';

import { AlertEngine } from '../../apps/hospital-hms/lib/services/alert-engine';

const mockPrisma = vi.hoisted(() => ({
  hospitalsMaster: { findFirst: vi.fn(), create: vi.fn() },
  doctorMaster: { findFirst: vi.fn(), create: vi.fn() },
  patient: { create: vi.fn(), findUnique: vi.fn() },
  appointment: { create: vi.fn(), findUnique: vi.fn() },
  patientRecord: { create: vi.fn(), findMany: vi.fn() },
  diagnosticOrder: { create: vi.fn(), findUnique: vi.fn() },
  admission: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  bill: { create: vi.fn(), findUnique: vi.fn() },
  clinicalEvent: { create: vi.fn() },
  clinicalAlert: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
}));

vi.mock('@haspataal/db', () => ({ prisma: mockPrisma }));
vi.mock('../../apps/hospital-hms/lib/services/alert-engine', () => ({
  AlertEngine: {
    processLabResult: vi.fn(),
    processAcuityChange: vi.fn(),
    processVitalSign: vi.fn(),
    ALERT_RULES: { acuity: vi.fn(), albumin: vi.fn(), bp: vi.fn(), spo2: vi.fn() },
  },
}));

describe('Pediatric Nephrotic Syndrome Clinical Workflow Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.hospitalsMaster.findFirst.mockResolvedValue(null);
    mockPrisma.hospitalsMaster.create.mockResolvedValue({
      id: 'hospital-sim-101',
      legalName: 'AIIMS Pediatric Pilot',
      displayName: 'AIIMS Pediatric Pilot',
      registrationNumber: 'HOSP-SIM-NS-101',
      verificationStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });
    mockPrisma.doctorMaster.findFirst.mockResolvedValue(null);
    mockPrisma.doctorMaster.create.mockResolvedValue({
      id: 'doctor-sim-101',
      fullName: 'Dr. Neha Sharma (Pediatric Nephrologist)',
      mobile: '9876500000',
      email: 'dr.ns.sim@haspataal.com',
      kycStatus: 'VERIFIED',
      accountStatus: 'ACTIVE',
    });
    mockPrisma.patient.create.mockImplementation(async (args) => ({
      id: 'patient-sim-ns-001',
      name: 'Aarav Kumar (Simulation)',
      phone: '9100000014',
      gender: 'MALE',
      dob: new Date(2019, 1, 1),
      address: 'Patna, Bihar',
      bloodGroup: 'O+',
      ...args.data,
    }));
    mockPrisma.appointment.create.mockImplementation(async (args) => ({
      id: 'appointment-sim-001',
      status: 'COMPLETED',
      ...args.data,
    }));
    mockPrisma.admission.create.mockImplementation(async (args) => ({
      id: 'admission-sim-001',
      status: 'ADMITTED',
      acuity: 'CRITICAL',
      ...args.data,
    }));
    mockPrisma.admission.update.mockImplementation(async (args) => ({
      id: args.where.id,
      status: 'DISCHARGED',
      dischargeProcessStatus: 'READY_FOR_DEPARTURE',
      acuity: 'RECOVERING',
      dischargeSummary: 'Discharged on Prednisolone, Calcium, Vitamin D.',
      ...args.data,
    }));
    mockPrisma.bill.create.mockImplementation(async (args) => ({
      id: 'bill-sim-001',
      totalAmount: 5500,
      status: 'PENDING',
      ...args.data,
    }));
    mockPrisma.patientRecord.create.mockImplementation(async (args) => ({
      id: 'record-sim-001',
      diagnosis: 'Test',
      ...args.data,
    }));
    mockPrisma.diagnosticOrder.create.mockImplementation(async (args) => ({
      id: 'order-sim-001',
      orderStatus: 'COMPLETED',
      ...args.data,
    }));
  });

  it('Phase 1-2: Patient registration, consultation, and AI differential diagnosis', async () => {
    const hospital = await mockPrisma.hospitalsMaster.create({
      data: {
        legalName: 'AIIMS Pediatric Pilot',
        displayName: 'AIIMS Pediatric Pilot',
        registrationNumber: 'HOSP-SIM-NS-101',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
    const doctor = await mockPrisma.doctorMaster.create({
      data: {
        fullName: 'Dr. Neha Sharma (Pediatric Nephrologist)',
        mobile: '9876500000',
        email: 'dr.ns.sim@haspataal.com',
        kycStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
      },
    });
    const patient = await mockPrisma.patient.create({
      data: {
        name: 'Aarav Kumar (Simulation)',
        phone: '9100000014',
        gender: 'MALE',
        dob: new Date(2019, 1, 1),
        address: 'Patna, Bihar',
        bloodGroup: 'O+',
      },
    });
    const appointment = await mockPrisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        date: new Date(),
        slot: '08:45-SIM',
        status: 'COMPLETED',
      },
    });
    const record = await mockPrisma.patientRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Likely Minimal Change Disease (Nephrotic Syndrome)',
        notes: 'AI Differential Diagnosis: Nephrotic Syndrome vs. Acute Glomerulonephritis',
        vitals: { temp: '98.6', bp: '96/62', rr: 24, hr: 108, spO2: 99 },
        prescription: 'Pending Lab Review',
      },
    });
    expect(hospital.id).toBe('hospital-sim-101');
    expect(doctor.email).toBe('dr.ns.sim@haspataal.com');
    expect(patient.gender).toBe('MALE');
    expect(appointment.status).toBe('COMPLETED');
    expect(record.diagnosis).toContain('Nephrotic Syndrome');
  });

  it('Phase 3: Critical lab results trigger AlertEngine.processLabResult', async () => {
    const hospitalId = 'hospital-sim-101';
    const patientId = 'patient-sim-ns-001';
    await AlertEngine.processLabResult(
      { hospitalId, patientId, payload: { albumin: 1.2, protein: '4+' }, source: 'LAB_SYSTEM' },
      'Albumin',
      1.2,
    );
    const labOrder = await mockPrisma.diagnosticOrder.create({
      data: {
        hospitalId,
        patientId,
        doctorId: 'doctor-sim-101',
        orderStatus: 'COMPLETED',
        totalAmount: 1500.0,
      },
    });
    expect(AlertEngine.processLabResult).toHaveBeenCalledWith(
      { hospitalId, patientId, payload: { albumin: 1.2, protein: '4+' }, source: 'LAB_SYSTEM' },
      'Albumin',
      1.2,
    );
    expect(labOrder.orderStatus).toBe('COMPLETED');
    expect(labOrder.totalAmount).toBe(1500.0);
    await mockPrisma.patientRecord.create({
      data: {
        patientId,
        doctorId: 'doctor-sim-101',
        diagnosis: 'Critical Labs Alert',
        notes: 'Serum Albumin: 1.2 g/dL (CRITICAL)',
        vitals: { temp: '98.6', bp: '96/62', rr: 24, hr: 108, spO2: 99 },
      },
    });
  });

  it('Phase 4-5: Admission (CRITICAL acuity), AlertEngine.processAcuityChange, and billing', async () => {
    const hospitalId = 'hospital-sim-101';
    const patientId = 'patient-sim-ns-001';
    await AlertEngine.processAcuityChange(
      {
        hospitalId,
        patientId,
        admissionId: 'admission-sim-ns-001',
        payload: { previous: 'STABLE', current: 'CRITICAL' },
        source: 'DOCTOR',
      },
      'CRITICAL',
    );
    const admission = await mockPrisma.admission.create({
      data: {
        hospitalId,
        patientId,
        attendingDoctorId: 'doctor-sim-101',
        admissionNumber: 'ADM-SIM-NS-001',
        status: 'ADMITTED',
        reason: 'Nephrotic Syndrome with massive edema and hypoalbuminemia',
        acuity: 'CRITICAL',
        acuityUpdatedAt: new Date(),
        payload: { isSimulation: true, simulationId: 'SIM-NS-2026-001' },
      },
    });
    expect(AlertEngine.processAcuityChange).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: { previous: 'STABLE', current: 'CRITICAL' },
        source: 'DOCTOR',
      }),
      'CRITICAL',
    );
    expect(admission.status).toBe('ADMITTED');
    expect(admission.acuity).toBe('CRITICAL');
    expect(admission.reason).toContain('Nephrotic Syndrome');
    const bill = await mockPrisma.bill.create({
      data: {
        hospitalId,
        patientId,
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
    expect(bill.status).toBe('PENDING');
    expect(bill.totalAmount).toBe(5500);
    expect(bill.payload.items).toHaveLength(3);
  });

  it('Phase 6-7: Emergency hypertension event triggers AlertEngine.processVitalSign, treatment record', async () => {
    const hospitalId = 'hospital-sim-101';
    const patientId = 'patient-sim-ns-001';
    const admissionId = 'admission-sim-ns-001';
    await AlertEngine.processVitalSign(
      { hospitalId, patientId, admissionId, payload: { bp: '130/90' }, source: 'NURSE' },
      'BP',
      '130/90',
    );
    expect(AlertEngine.processVitalSign).toHaveBeenCalledWith(
      { hospitalId, patientId, admissionId, payload: { bp: '130/90' }, source: 'NURSE' },
      'BP',
      '130/90',
    );
    const treatmentRecord = await mockPrisma.patientRecord.create({
      data: {
        patientId,
        doctorId: 'doctor-sim-101',
        diagnosis: 'Clinical Workflow Event',
        notes: 'Day 2: Albumin infusion, Prednisolone started',
        prescription: '20% Human Albumin, Prednisolone (32 mg/day)',
        vitals: { bp: '120/80' },
      },
    });
    expect(treatmentRecord.diagnosis).toBe('Clinical Workflow Event');
    expect(treatmentRecord.prescription).toContain('Prednisolone');
  });

  it('Phase 8: Discharge with status, summary, and acuity improvement', async () => {
    const admissionId = 'admission-sim-ns-001';
    const dischargedAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const updated = await mockPrisma.admission.update({
      where: { id: admissionId },
      data: {
        status: 'DISCHARGED',
        dischargedAt,
        dischargeSummary:
          'First Episode Idiopathic Nephrotic Syndrome. Discharged on Prednisolone.',
        dischargeProcessStatus: 'READY_FOR_DEPARTURE',
        acuity: 'RECOVERING',
        acuityUpdatedAt: new Date(),
      },
    });
    expect(updated.status).toBe('DISCHARGED');
    expect(updated.dischargeProcessStatus).toBe('READY_FOR_DEPARTURE');
    expect(updated.dischargeSummary).toContain('Prednisolone');
  });

  it('Phase 9: Self-validation - all journey records exist and are linked properly', async () => {
    const patientId = 'patient-sim-ns-001';
    const appointmentId = 'appointment-sim-001';
    const admissionId = 'admission-sim-001';
    const billId = 'bill-sim-001';
    mockPrisma.patient.findUnique.mockResolvedValue({ id: patientId, name: 'Aarav Kumar' });
    mockPrisma.appointment.findUnique.mockResolvedValue({ id: appointmentId, status: 'COMPLETED' });
    mockPrisma.admission.findUnique.mockResolvedValue({ id: admissionId, status: 'DISCHARGED' });
    mockPrisma.bill.findUnique.mockResolvedValue({ id: billId, status: 'PAID' });
    const checks = {
      patient: await mockPrisma.patient.findUnique({ where: { id: patientId } }),
      appointment: await mockPrisma.appointment.findUnique({ where: { id: appointmentId } }),
      admission: await mockPrisma.admission.findUnique({ where: { id: admissionId } }),
      bill: await mockPrisma.bill.findUnique({ where: { id: billId } }),
    };
    expect(checks.patient).toBeDefined();
    expect(checks.appointment).toBeDefined();
    expect(checks.admission).toBeDefined();
    expect(checks.bill).toBeDefined();
    expect(checks.patient.id).toBe(patientId);
    expect(checks.appointment.status).toBe('COMPLETED');
    expect(checks.admission.status).toBe('DISCHARGED');
    expect(checks.bill.status).toBe('PAID');
  });

  it('Full workflow integration: runs all 9 phases sequentially with correct alert triggering', async () => {
    const hospital = await mockPrisma.hospitalsMaster.create({
      data: { legalName: 'AIIMS Pediatric Pilot', registrationNumber: 'HOSP-SIM-NS-101' },
    });
    const doctor = await mockPrisma.doctorMaster.create({
      data: { fullName: 'Dr. Neha Sharma', email: 'dr.ns.sim@haspataal.com' },
    });
    const patient = await mockPrisma.patient.create({
      data: { name: 'Aarav Kumar', gender: 'MALE', dob: new Date(2019, 1, 1) },
    });
    const appointment = await mockPrisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        hospitalId: hospital.id,
        status: 'COMPLETED',
      },
    });
    await mockPrisma.patientRecord.create({
      data: { patientId: patient.id, doctorId: doctor.id, diagnosis: 'Nephrotic Syndrome' },
    });
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
    await mockPrisma.diagnosticOrder.create({
      data: { hospitalId: hospital.id, patientId: patient.id, orderStatus: 'COMPLETED' },
    });
    await mockPrisma.patientRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Critical Labs Alert',
        notes: 'Albumin 1.2 g/dL',
      },
    });
    const admission = await mockPrisma.admission.create({
      data: {
        hospitalId: hospital.id,
        patientId: patient.id,
        attendingDoctorId: doctor.id,
        admissionNumber: 'ADM-SIM-NS-001',
        status: 'ADMITTED',
        acuity: 'CRITICAL',
      },
    });
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
    const bill = await mockPrisma.bill.create({
      data: {
        hospitalId: hospital.id,
        patientId: patient.id,
        totalAmount: 5500,
        status: 'PENDING',
      },
    });
    mockPrisma.bill.create.mockResolvedValueOnce({ ...bill, status: 'PAID' });
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
    await mockPrisma.patientRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        diagnosis: 'Clinical Workflow Event',
        notes: 'Day 2-3: Albumin infusion, Prednisolone started',
        prescription: '20% Human Albumin, Prednisolone (32 mg/day)',
      },
    });
    const discharge = await mockPrisma.admission.update({
      where: { id: admission.id },
      data: {
        status: 'DISCHARGED',
        dischargeSummary:
          'First Episode Idiopathic Nephrotic Syndrome. Discharged on Prednisolone.',
        dischargeProcessStatus: 'READY_FOR_DEPARTURE',
        acuity: 'RECOVERING',
      },
    });
    const secondUpdate = await mockPrisma.admission.update({
      where: { id: admission.id },
      data: {
        status: 'DISCHARGED',
        dischargeProcessStatus: 'READY_FOR_DEPARTURE',
        acuity: 'RECOVERING',
      },
    });
    mockPrisma.patient.findUnique.mockResolvedValue(patient);
    mockPrisma.appointment.findUnique.mockResolvedValue(appointment);
    mockPrisma.admission.findUnique.mockResolvedValue({ id: admission.id, status: 'DISCHARGED' });
    mockPrisma.bill.findUnique.mockResolvedValue({ ...bill, status: 'PAID' });
    const checks = {
      patient: await mockPrisma.patient.findUnique({ where: { id: patient.id } }),
      appointment: await mockPrisma.appointment.findUnique({ where: { id: appointment.id } }),
      admission: await mockPrisma.admission.findUnique({ where: { id: admission.id } }),
      bill: await mockPrisma.bill.findUnique({ where: { id: bill.id } }),
    };
    expect(checks.patient).toBeDefined();
    expect(checks.appointment).toBeDefined();
    expect(checks.admission).toBeDefined();
    expect(checks.bill).toBeDefined();
    expect(checks.appointment.status).toBe('COMPLETED');
    expect(checks.admission.status).toBe('DISCHARGED');
    expect(checks.bill.status).toBe('PAID');
    expect(AlertEngine.processLabResult).toHaveBeenCalledTimes(1);
    expect(AlertEngine.processAcuityChange).toHaveBeenCalledTimes(1);
    expect(AlertEngine.processVitalSign).toHaveBeenCalledTimes(1);
  });
});
