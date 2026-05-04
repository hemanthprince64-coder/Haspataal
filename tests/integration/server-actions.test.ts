import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { registerDoctor, approveDoctorAffiliationAction, agentLogin } from '../../app/actions';
import * as auth from '../../lib/auth/requireRole';
import { UserRole } from '../../types';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

beforeAll(async () => {
  // Increase timeout for downloading postgres image
  vi.setConfig({ hookTimeout: 60000, testTimeout: 30000 });

  container = await new PostgreSqlContainer("postgres:15").start();
  const databaseUrl = container.getConnectionUri();
  
  // Set env var for prisma
  process.env.DATABASE_URL = databaseUrl;
  
  // Run migrations against the test container
  execSync('npx prisma db push --skip-generate', { env: process.env });

  prisma = new PrismaClient();
});

afterAll(async () => {
  if (prisma) await prisma.$disconnect();
  if (container) await container.stop();
});

describe('Server Actions Integration', () => {
  let createdHospitalId: string;
  let createdDoctorId: string;

  beforeAll(async () => {
    // Seed basic data required for testing
    const hospital = await prisma.hospitalsMaster.create({
      data: {
        legalName: 'Test Hospital',
        city: 'Mumbai',
        contactNumber: '9999999999',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE',
        registrationNumber: 'REG-1234'
      }
    });
    // Set password manually since it's @ignore
    await prisma.$executeRaw`UPDATE hospitals_master SET password = 'hashedpassword' WHERE id = ${hospital.id}`;
    
    createdHospitalId = hospital.id;

    // Mock requireRole to simulate logged in hospital admin
    vi.spyOn(auth, 'requireRole').mockResolvedValue({
      id: 'admin-123',
      name: 'Admin',
      hospitalId: createdHospitalId,
      role: UserRole.HOSPITAL_ADMIN,
    });
  });

  describe('registerDoctor', () => {
    it('should create a doctor, link to hospital as PENDING', async () => {
      const formData = new FormData();
      formData.append('fullName', 'Dr. Integration Test');
      formData.append('mobile', '8888888888');
      formData.append('email', 'dr.test@integration.com');
      formData.append('password', 'securepassword');
      formData.append('registrationNumber', 'REG-INT-1');
      formData.append('councilName', 'Medical Council Test');

      const result = await registerDoctor(null, formData);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Registration submitted');

      // Assert database state
      const doctor = await prisma.doctorMaster.findUnique({
        where: { email: 'dr.test@integration.com' },
        include: { affiliations: true }
      });

      expect(doctor).not.toBeNull();
      expect(doctor?.fullName).toBe('Dr. Integration Test');
      
      // Assert affiliation is PENDING
      expect(doctor?.affiliations).toHaveLength(1);
      expect(doctor?.affiliations[0].verificationStatus).toBe('PENDING');
      
      createdDoctorId = doctor!.id;
    });
  });

  describe('approveDoctorAffiliationAction', () => {
    it('should transition PENDING to APPROVED', async () => {
      const formData = new FormData();
      formData.append('doctorId', createdDoctorId);

      const result = await approveDoctorAffiliationAction(null, formData);

      expect(result.success).toBe(true);
      
      // Assert database state
      const affiliation = await prisma.doctorHospitalAffiliation.findFirst({
        where: { doctorId: createdDoctorId, hospitalId: createdHospitalId }
      });

      expect(affiliation).not.toBeNull();
      expect(affiliation?.verificationStatus).toBe('APPROVED');
    });
  });

  describe('agentLogin', () => {
    beforeAll(async () => {
      // Seed agent
      await prisma.agent.create({
        data: {
          fullName: 'Test Agent',
          mobile: '7777777777',
          email: 'agent@test.com',
          password: 'hashedpassword123', // In real test, use bcrypt hash
        }
      });
    });

    it('should return failure for invalid credentials', async () => {
      const formData = new FormData();
      formData.append('mobile', '7777777777');
      formData.append('password', 'wrongpassword');

      const result = await agentLogin(null, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    // We avoid testing valid password matching directly here because agentLogin 
    // requires bcrypt which relies on mocked data. But we assert the unhappy path 
    // works correctly hitting the database.
  });
});
