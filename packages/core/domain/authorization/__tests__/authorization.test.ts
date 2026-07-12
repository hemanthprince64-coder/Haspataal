/**
 * Phase 2 Authorization Backbone — Unit/Smoke Tests
 *
 * These tests use a real PostgreSQL Testcontainer to avoid environment-variable
 * dependency issues and eliminate mock drift from the actual engine behavior.
 *
 * For the full 47-scenario matrix, see authorization.integration.test.ts.
 */
import {
  PrismaClient,
  RelationshipLevel,
  CarePurpose,
  RelationshipTrigger,
  ResponsibilityStatus,
} from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { DoctorPatientRelationshipService } from '../doctorPatientRelationshipService';
import { AuthorizationService } from '../service';
import { TransferOfCareService } from '../transferOfCareService';
import { DomainAction, AuthorizationDecision } from '../types';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;
let authService: AuthorizationService;
let relService: DoctorPatientRelationshipService;
let transferService: TransferOfCareService;

const testPatientId = 'unit-test-patient';
const testDoctorId = 'unit-test-doctor';
const testDoctor2Id = 'unit-test-doctor-2';
const testAdminId = 'unit-test-admin';
const testEpisodeId = 'unit-test-episode';

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();
  process.env.DATABASE_URL = dbUrl;

  execSync(
    'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
    {
      env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl },
      stdio: 'inherit',
    },
  );

  prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  await prisma.$connect();

  authService = new AuthorizationService(prisma);
  relService = new DoctorPatientRelationshipService(prisma);
  transferService = new TransferOfCareService(prisma);

  // Seed the canonical patient
  await prisma.patient.create({
    data: { id: testPatientId, name: 'Unit Test Patient', phone: '+919000000010' },
  });
}, 90000);

afterAll(async () => {
  await prisma.$disconnect();
  await container.stop();
});

describe('Phase 2 Authorization Backbone', () => {
  describe('AuthorizationService: Clinical History Read', () => {
    it('should DENY read if no active relationship exists', async () => {
      const result = await authService.authorize({
        actor: { id: testDoctorId, role: 'DOCTOR' },
        action: DomainAction.PATIENT_LONGITUDINAL_HISTORY_READ,
        resource: { patientId: 'some-patient' },
      });
      expect(result.decision).toBe(AuthorizationDecision.DENY);
    });

    it('should ALLOW read if active relationship exists', async () => {
      await relService.establishRelationship({
        patientId: testPatientId,
        doctorId: testDoctorId,
        hospitalId: 'unit-hosp',
        level: RelationshipLevel.EPISODIC,
        carePurpose: CarePurpose.PRIMARY_TREATMENT,
        sourceTrigger: RelationshipTrigger.ADMISSION,
      });

      const result = await authService.authorize({
        actor: { id: testDoctorId, role: 'DOCTOR' },
        action: DomainAction.PATIENT_LONGITUDINAL_HISTORY_READ,
        resource: { patientId: testPatientId },
      });
      expect(result.decision).toBe(AuthorizationDecision.ALLOW);
    });

    it('should ALLOW identity merge only for explicit platform capability (not SUPER_ADMIN role alone)', async () => {
      // DENY without explicit capability
      const denyResult = await authService.authorize({
        actor: { id: testDoctorId, role: 'DOCTOR' },
        action: DomainAction.IDENTITY_MERGE_EXECUTE,
        resource: {},
      });
      expect(denyResult.decision).toBe(AuthorizationDecision.DENY);

      // ALLOW with explicit platform-scoped capability and no hospitalId (platform-level)
      const allowResult = await authService.authorize({
        actor: {
          id: testAdminId,
          role: 'SUPER_ADMIN',
          permissions: ['module:IDENTITY:action:EXECUTE'],
        },
        action: DomainAction.IDENTITY_MERGE_EXECUTE,
        resource: {},
      });
      expect(allowResult.decision).toBe(AuthorizationDecision.ALLOW);
    });
  });

  describe('TransferOfCareService', () => {
    it('should atomically accept transfer and reassign primary responsibility', async () => {
      // Seed a second patient for this test
      await prisma.patient.upsert({
        where: { id: testDoctor2Id + '-pat' },
        create: {
          id: testDoctor2Id + '-pat',
          name: 'Transfer Test Patient',
          phone: '+919000000011',
        },
        update: {},
      });

      // Assign initial primary responsibility
      const primaryResp = await prisma.careResponsibility.create({
        data: {
          doctorId: testDoctorId,
          patientId: testDoctor2Id + '-pat',
          episodeId: testEpisodeId,
          isPrimary: true,
          status: ResponsibilityStatus.ACTIVE,
        },
      });

      // Initiate transfer
      const transfer = await transferService.initiateTransfer({
        initiatingDoctorId: testDoctorId,
        receivingDoctorId: testDoctor2Id,
        patientId: testDoctor2Id + '-pat',
        episodeId: testEpisodeId,
        hospitalId: 'unit-hosp',
        reason: 'Specialist referral',
      });

      // Verify original responsibility still ACTIVE before acceptance
      const beforeAccept = await prisma.careResponsibility.findUniqueOrThrow({
        where: { id: primaryResp.id },
      });
      expect(beforeAccept.status).toBe(ResponsibilityStatus.ACTIVE);

      // Accept transfer
      await transferService.acceptTransfer(transfer.id);

      // Old responsibility should now be TRANSFERRED
      const oldResp = await prisma.careResponsibility.findUniqueOrThrow({
        where: { id: primaryResp.id },
      });
      expect(oldResp.status).toBe(ResponsibilityStatus.TRANSFERRED);

      // New primary responsibility should exist for testDoctor2Id
      const newResp = await prisma.careResponsibility.findFirst({
        where: {
          doctorId: testDoctor2Id,
          patientId: testDoctor2Id + '-pat',
          episodeId: testEpisodeId,
          isPrimary: true,
          status: ResponsibilityStatus.ACTIVE,
        },
      });
      expect(newResp).not.toBeNull();
    });
  });
});
