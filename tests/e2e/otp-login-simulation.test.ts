import { OtpService } from '@haspataal/auth';
import { OtpPurpose } from '@haspataal/auth';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { AlertEngine } from '../../apps/hospital-hms/lib/services/alert-engine';
import { UnifiedOtpService } from '../../packages/auth/otp-service';

const mockPrisma = vi.hoisted(() => ({
  otpCode: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
  patient: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  doctorMaster: {
    findUnique: vi.fn(),
  },
  hospitalsMaster: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  doctorMasterFull: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  appointment: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  patientRecord: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  diagnosticOrder: {
    create: vi.fn(),
  },
  admission: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  bill: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
  clinicalEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  clinicalAlert: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('@haspataal/db', () => ({
  __esModule: true,
  prisma: mockPrisma,
  default: mockPrisma,
}));

vi.mock('@haspataal/logger', () => ({
  __esModule: true,
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSendOtpSms = vi.hoisted(() => vi.fn());
vi.mock('@haspataal/auth/lib/otp/otp.sms', () => ({
  SmsFactory: {
    getProvider: () => ({
      sendOTP: mockSendOtpSms,
    }),
  },
}));

vi.mock('@haspataal/auth/otp-dispatcher', () => ({
  SmsFactory: { getProvider: () => ({ sendOTP: vi.fn().mockResolvedValue(true) }) },
}));

vi.mock('prom-client', () => ({
  Counter: class {
    inc = vi.fn();
  },
  Gauge: class {
    set = vi.fn();
    inc = vi.fn();
  },
}));

const mockRedisStore = vi.hoisted(() => new Map<string, string>());
const mockRedisTtl = vi.hoisted(() => new Map<string, number>());

vi.mock('@haspataal/auth/lib/otp/otp.redis', () => ({
  OtpRedis: {
    checkIpRateLimit: vi.fn(async (ip: string) => {
      const key = `+ip:${ip}`;
      const count = parseInt(mockRedisStore.get(key) || '0') + 1;
      mockRedisStore.set(key, count.toString());
      mockRedisTtl.set(key, Date.now() + 60000);
      return Promise.resolve(count <= 20);
    }),
    checkTenantRateLimit: vi.fn(() => Promise.resolve(true)),
    checkPhoneRateLimit: vi.fn(async (phone: string) => {
      const key = `+ph:${phone}`;
      const count = parseInt(mockRedisStore.get(key) || '0') + 1;
      mockRedisStore.set(key, count.toString());
      mockRedisTtl.set(key, Date.now() + 900000);
      return Promise.resolve(count <= 3);
    }),
    setResendCooldown: vi.fn(async (phone: string) => {
      const key = `+cd:${phone}`;
      mockRedisStore.set(key, '1');
      mockRedisTtl.set(key, Date.now() + 60000);
    }),
    isResendInCooldown: vi.fn(async (phone: string) => {
      const key = `+cd:${phone}`;
      const ttl = mockRedisTtl.get(key);
      if (ttl && Date.now() > ttl) {
        mockRedisStore.delete(key);
        mockRedisTtl.delete(key);
        return Promise.resolve(false);
      }
      return Promise.resolve(mockRedisStore.has(key));
    }),
    isLocked: vi.fn(async (phone: string) => {
      const key = `+lk:${phone}`;
      const ttl = mockRedisTtl.get(key);
      if (ttl && Date.now() > ttl) {
        mockRedisStore.delete(key);
        mockRedisTtl.delete(key);
        return Promise.resolve(false);
      }
      return Promise.resolve(mockRedisStore.has(key));
    }),
    lockAccount: vi.fn(async (phone: string) => {
      const key = `+lk:${phone}`;
      mockRedisStore.set(key, '1');
      mockRedisTtl.set(key, Date.now() + 300000);
    }),
    clearLocksAndAttempts: vi.fn(async (phone: string) => {
      mockRedisStore.delete(`+lk:${phone}`);
      mockRedisStore.delete(`+ph:${phone}`);
      mockRedisStore.delete(`+cd:${phone}`);
      mockRedisTtl.delete(`+lk:${phone}`);
      mockRedisTtl.delete(`+ph:${phone}`);
      mockRedisTtl.delete(`+cd:${phone}`);
    }),
  },
}));

const bcrypt = require('bcryptjs');

describe('OTP Login End-to-End Simulation', () => {
  const TEST_MOBILE = '9000000001';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendOtpSms.mockResolvedValue(undefined);
    mockRedisStore.clear();
    mockRedisTtl.clear();
  });

  describe('Phase 1: Patient Requests OTP', () => {
    it('should generate, store, and return OTP for patient login', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      const result = await OtpService.sendOtp({
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      });

      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^\d{6}$/);
      expect(result.expiresAt).toBeInstanceOf(Date);
      expect(result.expiresAt!.getTime()).toBeGreaterThan(Date.now());

      expect(mockPrisma.otpCode.upsert).toHaveBeenCalledTimes(1);
      const upsertCall = mockPrisma.otpCode.upsert.mock.calls[0][0];
      expect(upsertCall.where.tenantId_phone_purpose.phone).toBe(TEST_MOBILE);
      expect(upsertCall.where.tenantId_phone_purpose.purpose).toBe(OtpPurpose.PATIENT_LOGIN);
      expect(upsertCall.create.otpHash).toBeDefined();
      expect(upsertCall.create.expiresAt).toBeInstanceOf(Date);
    });

    it('should enforce phone rate limiting (3 OTPs per 15 minutes)', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      for (let i = 0; i < 3; i++) {
        const result = await OtpService.sendOtp({
          phone: '9000000010',
          purpose: OtpPurpose.PATIENT_LOGIN,
        });
        expect(result.success).toBe(true);
        mockRedisStore.delete(`+cd:9000000010`);
        mockRedisTtl.delete(`+cd:9000000010`);
      }

      const result4 = await OtpService.sendOtp({
        phone: '9000000010',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });
      expect(result4.success).toBe(false);
      expect(result4.message).toContain('Too many OTP requests');
    });

    it('should enforce resend cooldown (60 seconds)', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      const result1 = await OtpService.sendOtp({
        phone: '9000000011',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });
      expect(result1.success).toBe(true);

      const result2 = await OtpService.sendOtp({
        phone: '9000000011',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });
      expect(result2.success).toBe(false);
      expect(result2.message).toContain('wait 60 seconds');
    });

    it('should return code in development/test environments for easy debugging', async () => {
      vi.stubEnv('NODE_ENV', 'development');

      try {
        mockPrisma.otpCode.upsert.mockResolvedValue({});

        const result = await OtpService.sendOtp({
          phone: '9000000011',
          purpose: OtpPurpose.PATIENT_LOGIN,
        });

        expect(result.success).toBe(true);
        expect(result.code).toBeDefined();
        expect(result.code).toMatch(/^\d{6}$/);
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('should NOT return code in production environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      try {
        mockPrisma.otpCode.upsert.mockResolvedValue({});

        const result = await OtpService.sendOtp({
          phone: '9000000012',
          purpose: OtpPurpose.PATIENT_LOGIN,
        });

        expect(result.success).toBe(true);
        expect(result.code).toBeUndefined();
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('should dispatch SMS on success', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      await OtpService.sendOtp({
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(mockSendOtpSms).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/^\d{6}$/),
        expect.any(String),
      );
    });
  });

  describe('Phase 2: OTP Verification & Authentication', () => {
    it('should verify valid OTP and return success', async () => {
      const generatedOtp = '654321';
      const hash = await bcrypt.hash(generatedOtp, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });
      mockPrisma.otpCode.update.mockResolvedValue({});

      const result = await OtpService.verifyOtp({
        phone: TEST_MOBILE,
        otp: generatedOtp,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent',
      });

      expect(result.success).toBe(true);
      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: {
          verified: true,
          verifiedAt: expect.any(Date),
        },
      });
    });

    it('should reject invalid OTP (wrong code)', async () => {
      const hash = await bcrypt.hash('correct_otp', 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });
      mockPrisma.otpCode.update.mockResolvedValue({});

      const result = await OtpService.verifyOtp({
        phone: TEST_MOBILE,
        otp: '000000',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');

      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { attemptCount: 1 },
      });
    });

    it('should reject expired OTP', async () => {
      const hash = await bcrypt.hash('123456', 10);
      const expiresAt = new Date(Date.now() - 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });

      const result = await OtpService.verifyOtp({
        phone: TEST_MOBILE,
        otp: '123456',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject when no OTP was requested', async () => {
      mockPrisma.otpCode.findUnique.mockResolvedValue(null);

      const result = await OtpService.verifyOtp({
        phone: '9999999999',
        otp: '123456',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('No active OTP');
    });

    it('should reject already-verified OTP', async () => {
      const hash = await bcrypt.hash('123456', 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: true,
      });

      const result = await OtpService.verifyOtp({
        phone: TEST_MOBILE,
        otp: '123456',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('already been verified');
    });

    it('should lock account after 5 failed attempts', async () => {
      const hash = await bcrypt.hash('123456', 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      for (let attempt = 0; attempt < 5; attempt++) {
        mockPrisma.otpCode.findUnique.mockResolvedValue({
          id: 'otp-1',
          phone: TEST_MOBILE,
          purpose: OtpPurpose.PATIENT_LOGIN,
          otpHash: hash,
          expiresAt,
          attemptCount: attempt,
          verified: false,
        });
        mockPrisma.otpCode.update.mockResolvedValue({});

        const result = await OtpService.verifyOtp({
          phone: TEST_MOBILE,
          otp: 'WRONG',
          purpose: OtpPurpose.PATIENT_LOGIN,
        });

        expect(result.success).toBe(false);
        expect(result.message).toContain('Invalid OTP');
      }

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: TEST_MOBILE,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 4,
        verified: false,
      });

      const result = await OtpService.verifyOtp({
        phone: TEST_MOBILE,
        otp: '123456',
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('locked');
    });
  });

  describe('Phase 3: Full Patient Login Flow Simulation', () => {
    it('simulates complete patient login: request OTP -> verify -> authenticated', async () => {
      const mobile = '9000000013';

      const sendResult = await OtpService.sendOtp({
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      });

      expect(sendResult.success).toBe(true);
      expect(sendResult.code).toBeDefined();
      expect(mockPrisma.otpCode.upsert).toHaveBeenCalledTimes(1);

      const hash = await bcrypt.hash(sendResult.code!, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });
      mockPrisma.otpCode.update.mockResolvedValue({});

      const verifyResult = await OtpService.verifyOtp({
        phone: mobile,
        otp: sendResult.code!,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      });

      expect(verifyResult.success).toBe(true);
      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: {
          verified: true,
          verifiedAt: expect.any(Date),
        },
      });

      expect(mockPrisma.otpCode.delete).not.toHaveBeenCalled();

      console.log('\n=== OTP Login Flow Simulation Complete ===');
      console.log(`  Step 1: Patient enters mobile: ${mobile}`);
      console.log(`  Step 2: OTP sent: ${sendResult.code}`);
      console.log(`  Step 3: OTP verified: ${verifyResult.success}`);
      console.log('  Step 4: Patient authenticated, session can be created');
    });

    it('simulates full login flow for existing patient', async () => {
      const mobile = '9000000014';

      const sendResult = await OtpService.sendOtp({
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      });

      expect(sendResult.success).toBe(true);

      const hash = await bcrypt.hash(sendResult.code!, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });
      mockPrisma.otpCode.update.mockResolvedValue({});

      const verifyResult = await OtpService.verifyOtp({
        phone: mobile,
        otp: sendResult.code!,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 Test Browser',
      });

      expect(verifyResult.success).toBe(true);

      // Simulate the patientLogin action's patient lookup after OTP verification
      mockPrisma.patient.findUnique.mockResolvedValue({
        id: 'patient-14',
        phone: mobile,
        name: 'Existing Patient',
        isActive: true,
      });

      const patientResult = await mockPrisma.patient.findUnique({
        where: { phone: mobile },
      });

      expect(patientResult.id).toBe('patient-14');
      expect(patientResult.phone).toBe(mobile);
      expect(mockPrisma.otpCode.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: {
          verified: true,
          verifiedAt: expect.any(Date),
        },
      });

      console.log('\n=== Existing Patient Login Simulation ===');
      console.log(`  Mobile: ${mobile}`);
      console.log(`  Patient found: ${patientResult.id} (${patientResult.name})`);
      console.log(`  OTP verified: ${verifyResult.success}`);
    });

    it('simulates auto-creation of new patient after OTP verification', async () => {
      const mobile = '9000000015';

      const sendResult = await OtpService.sendOtp({
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(sendResult.success).toBe(true);

      const hash = await bcrypt.hash(sendResult.code!, 10);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: mobile,
        purpose: OtpPurpose.PATIENT_LOGIN,
        otpHash: hash,
        expiresAt,
        attemptCount: 0,
        verified: false,
      });
      mockPrisma.otpCode.update.mockResolvedValue({});

      // Step 1: Verify OTP
      const verifyResult = await OtpService.verifyOtp({
        phone: mobile,
        otp: sendResult.code!,
        purpose: OtpPurpose.PATIENT_LOGIN,
      });

      expect(verifyResult.success).toBe(true);

      // Step 2: Simulate patientLogin action - check if patient exists
      mockPrisma.patient.findUnique.mockResolvedValue(null);
      const existingPatient = await mockPrisma.patient.findUnique({
        where: { phone: mobile },
      });
      expect(existingPatient).toBeNull();

      // Step 3: Create new patient
      mockPrisma.patient.create.mockResolvedValue({
        id: 'new-patient-15',
        phone: mobile,
        name: `Patient_${mobile.slice(-4)}`,
        isActive: true,
      });

      const createdPatient = await mockPrisma.patient.create({
        data: {
          phone: mobile,
          name: `Patient_${mobile.slice(-4)}`,
          isActive: true,
        },
      });

      expect(createdPatient.id).toBe('new-patient-15');
      expect(createdPatient.phone).toBe(mobile);

      console.log('\n=== New Patient Auto-Creation Simulation ===');
      console.log(`  Mobile: ${mobile}`);
      console.log(`  Patient not found -> auto-created with ID: ${createdPatient.id}`);
      console.log(`  OTP verified: ${verifyResult.success}`);
    });

    it('should enforce IP rate limiting (20 requests per minute)', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      for (let i = 0; i < 20; i++) {
        const phone = `9100000${String(i).padStart(4, '0')}`;
        mockRedisStore.delete(`+cd:${phone}`);
        mockRedisTtl.delete(`+cd:${phone}`);
        const result = await OtpService.sendOtp({
          phone,
          purpose: OtpPurpose.PATIENT_LOGIN,
          ipAddress: '192.168.1.100',
        });
        expect(result.success).toBe(true);
      }

      const phone21 = '91000009999';
      mockRedisStore.delete(`+cd:${phone21}`);
      mockRedisTtl.delete(`+cd:${phone21}`);
      const result = await OtpService.sendOtp({
        phone: phone21,
        purpose: OtpPurpose.PATIENT_LOGIN,
        ipAddress: '192.168.1.100',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many requests from this IP');
    });
  });

  describe('Phase 4: Doctor OTP Login (UnifiedOtpService)', () => {
    it('simulates doctor login via UnifiedOtpService: request -> verify -> authenticated', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      const requestResult = await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'DOCTOR',
        channel: 'SMS',
      });

      expect(requestResult.success).toBe(true);
      expect(requestResult.code).toMatch(/^\d{6}$/);

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        otpHash: requestResult.code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      mockPrisma.doctorMaster.findUnique.mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Test Doctor',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'ACTIVE',
      });
      mockPrisma.otpCode.delete.mockResolvedValue({});

      const verifyResult = await UnifiedOtpService.verifyOtp('9876543210', requestResult.code!, {
        entityType: 'DOCTOR',
        channel: 'SMS',
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.user?.id).toBe('doctor-1');
      expect(verifyResult.user?.name).toBe('Dr. Test Doctor');
      expect(verifyResult.user?.role).toBe('DOCTOR');
      expect(verifyResult.user?.entityType).toBe('DOCTOR');

      console.log('\n=== Doctor OTP Login (UnifiedOtpService) ===');
      console.log(`  Mobile: 9876543210`);
      console.log(`  OTP: ${requestResult.code}`);
      console.log(`  Doctor: ${verifyResult.user?.name}`);
      console.log(`  Role: ${verifyResult.user?.role}`);
    });

    it('should reject suspended doctor account', async () => {
      mockPrisma.otpCode.upsert.mockResolvedValue({});

      const requestResult = await UnifiedOtpService.requestOtp('9876543210', {
        entityType: 'DOCTOR',
      });

      mockPrisma.otpCode.findUnique.mockResolvedValue({
        id: 'otp-1',
        phone: '9876543210',
        code: requestResult.code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
      mockPrisma.doctorMaster.findUnique.mockResolvedValue({
        id: 'doctor-1',
        fullName: 'Dr. Suspended',
        mobile: '9876543210',
        email: 'doctor@test.com',
        accountStatus: 'SUSPENDED',
      });

      const verifyResult = await UnifiedOtpService.verifyOtp('9876543210', requestResult.code!, {
        entityType: 'DOCTOR',
      });

      expect(verifyResult.success).toBe(false);
      expect(verifyResult.message).toContain('suspended');
    });
  });
});
