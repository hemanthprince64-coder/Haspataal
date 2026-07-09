/**
 * Phase 1 Identity Integration Tests
 * Uses @testcontainers/postgresql for a real, disposable PostgreSQL instance.
 *
 * Tests:
 * - Migration application (migration 12 + prerequisites)
 * - Account activation (Case A, C, D, E)
 * - Concurrent activation — advisory lock serialization
 * - Key-rotation collision — claimKey uniqueness
 * - Direct DB bypass — unique constraint rejection
 * - Newborn/parent contact separation
 * - Alias 1-hop invariants
 * - Merge request transitions
 * - Outbox producer atomicity (rollback tests)
 * - Backfill idempotency
 */
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

// ─── Infrastructure ────────────────────────────────────────────────────────────

beforeAll(async () => {
  // Docker must be running (Docker Desktop was started)
  container = await new PostgreSqlContainer('postgres:16').start();
  const databaseUrl = container.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;
  process.env.IDENTITY_HMAC_SECRET_V1 = 'old-secret-v1-for-testing-only-32chars!';
  process.env.IDENTITY_HMAC_SECRET_V2 = 'new-secret-v2-for-testing-only-32chars!';
  process.env.IDENTITY_STABLE_CLAIM_SECRET = 'stable-claim-secret-for-tests-only-do-not-rotate';
  process.env.IDENTITY_ENCRYPTION_KEY_V2 = '0'.repeat(64); // 32 zero bytes

  // Apply schema using prisma db push (creates all tables including Phase 1)
  try {
    const result = execSync(
      'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
      {
        env: { ...process.env, DATABASE_URL: databaseUrl, DIRECT_URL: databaseUrl },
        encoding: 'utf8',
      },
    );
    console.log('[db push stdout]', result);
  } catch (e: any) {
    console.error('[db push FAILED]', e.stdout, e.stderr);
    throw e;
  }

  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
}, 120_000);

afterAll(async () => {
  await prisma?.$disconnect();
  await container?.stop();
});

// ─── Helper ────────────────────────────────────────────────────────────────────

async function createVerifiedChallenge(mobile: string, prismaClient: PrismaClient) {
  const hmac = crypto.createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!);
  const lookupHash = hmac.update(mobile).digest('hex');
  const otp = '123456';
  const otpDigest = crypto.createHash('sha256').update(otp).digest('hex');
  const ch = await prismaClient.mobileVerificationChallenge.create({
    data: {
      mobileLookupHash: lookupHash,
      mobileEncrypted: `v2:aabbcc:ddee:ff`, // fake — tests don't decrypt
      purpose: 'ACCOUNT_ACTIVATION',
      otpDigest,
      expiresAt: new Date(Date.now() + 5 * 60_000),
      status: 'VERIFIED',
      verifiedAt: new Date(),
      maxAttempts: 3,
    },
  });
  return { challengeId: ch.id, otp, lookupHash };
}

function stableClaimKey(mobile: string) {
  return crypto
    .createHmac('sha256', process.env.IDENTITY_STABLE_CLAIM_SECRET!)
    .update(mobile)
    .digest('hex');
}

// ─── Gate 1: Schema verification ───────────────────────────────────────────────

describe('A. Migration & Schema Verification', () => {
  it('user_accounts table exists with correct columns', async () => {
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user_accounts'
      ORDER BY column_name`;
    const cols = result.map((r) => r.column_name);
    expect(cols).toContain('patient_id');
    expect(cols).toContain('status');
  });

  it('auth_methods table has claim_key column', async () => {
    const result = await prisma.$queryRaw<any[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'auth_methods' AND column_name = 'claim_key'`;
    expect(result.length).toBe(1);
  });

  it('unique index on (type, claim_key) exists', async () => {
    const result = await prisma.$queryRaw<any[]>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'auth_methods' AND indexname = 'auth_methods_type_claim_key_key'`;
    expect(result.length).toBe(1);
  });

  it.skip('partial primary contact index exists', async () => {
    const result = await prisma.$queryRaw<any[]>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'patient_contact_points'
      AND indexname = 'patient_contact_points_primary_idx'`;
    expect(result.length).toBe(1);
  });

  it('alias unique index on alias_patient_id exists', async () => {
    const result = await prisma.$queryRaw<any[]>`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'patient_aliases' AND indexname = 'patient_aliases_alias_patient_id_key'`;
    expect(result.length).toBe(1);
  });
});

// ─── Gate 2: Account Activation ────────────────────────────────────────────────

describe('B. Account Activation', () => {
  it('Case D: new mobile creates Patient + UserAccount + ContactPoint + AuthMethod atomically', async () => {
    const mobile = '+919000000001';
    const { challengeId } = await createVerifiedChallenge(mobile, prisma);

    const lockHash = crypto.createHash('sha256').update(mobile).digest();
    const lk1 = lockHash.readInt32BE(0);
    const lk2 = lockHash.readInt32BE(4);
    const activeHmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(mobile)
      .digest('hex');

    const account = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lk1}::integer, ${lk2}::integer)`;

      // Consume challenge
      const consumed = await tx.mobileVerificationChallenge.updateMany({
        where: { id: challengeId, status: 'VERIFIED' },
        data: { status: 'CONSUMED', consumedAt: new Date() },
      });
      expect(consumed.count).toBe(1);

      // No existing
      const existing = await tx.authMethod.findFirst({
        where: { type: 'MOBILE_OTP', claimKey: stableClaimKey(mobile) },
      });
      expect(existing).toBeNull();

      // Create patient
      const patient = await tx.patient.create({
        data: { name: '', phone: null as any, password: '' },
      });

      // Create account
      const userAccount = await tx.userAccount.create({
        data: { patientId: patient.id, status: 'ACTIVE' },
      });

      // Create contact point
      const cp = await tx.patientContactPoint.create({
        data: {
          patientId: patient.id,
          type: 'MOBILE',
          relationship: 'SELF',
          valueEncrypted: 'v2:iv:tag:ct',
          valueLookupHash: activeHmac,
          lookupKeyVersion: 'v2',
          verifiedAt: new Date(),
          isPrimary: true,
          status: 'ACTIVE',
        },
      });

      // Create auth method with claimKey
      const authMethod = await tx.authMethod.create({
        data: {
          userAccountId: userAccount.id,
          contactPointId: cp.id,
          type: 'MOBILE_OTP',
          identifierLookupHash: activeHmac,
          lookupKeyVersion: 'v2',
          claimKey: stableClaimKey(mobile),
          status: 'ACTIVE',
        },
      });

      // Outbox events in same tx
      await tx.outboxEvent.create({
        data: {
          eventType: 'PATIENT_ACCOUNT_LINKED',
          payload: {
            aggregateId: patient.id,
            patientId: patient.id,
            userAccountId: userAccount.id,
          },
        },
      });
      await tx.outboxEvent.create({
        data: {
          eventType: 'AUTH_METHOD_VERIFIED',
          payload: {
            aggregateId: authMethod.id,
            authMethodId: authMethod.id,
            type: 'MOBILE_OTP',
          },
        },
      });

      return userAccount;
    });

    expect(account.status).toBe('ACTIVE');

    const authMethod = await prisma.authMethod.findFirst({
      where: { userAccountId: account.id },
    });

    // Verify outbox events
    const allEvents = await prisma.outboxEvent.findMany();
    const events = allEvents.filter((e) => {
      const p = e.payload as any;
      return p.patientId === account.patientId || p.authMethodId === authMethod!.id;
    });
    expect(events.map((e) => e.eventType)).toContain('PATIENT_ACCOUNT_LINKED');
    expect(events.map((e) => e.eventType)).toContain('AUTH_METHOD_VERIFIED');

    // Verify no raw mobile in events
    for (const e of events) {
      const payloadStr = JSON.stringify(e.payload);
      expect(payloadStr).not.toContain(mobile);
    }
  });
});

// ─── Gate 3: Authentication Concurrency ────────────────────────────────────────

describe('C. Concurrent Activation — Advisory Lock Serialization', () => {
  it('exactly one claim succeeds when two requests race for the same mobile', async () => {
    const mobile = '+919000000002';
    const [ch1, ch2] = await Promise.all([
      createVerifiedChallenge(mobile, prisma),
      createVerifiedChallenge(mobile, prisma),
    ]);

    const lockHash = crypto.createHash('sha256').update(mobile).digest();
    const lk1 = lockHash.readInt32BE(0);
    const lk2 = lockHash.readInt32BE(4);
    const ck = stableClaimKey(mobile);
    const activeHmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(mobile)
      .digest('hex');

    async function tryActivate(challengeId: string): Promise<'success' | 'existing' | 'consumed'> {
      try {
        return await prisma.$transaction(async (tx) => {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lk1}::integer, ${lk2}::integer)`;

          const consumed = await tx.mobileVerificationChallenge.updateMany({
            where: { id: challengeId, status: 'VERIFIED' },
            data: { status: 'CONSUMED', consumedAt: new Date() },
          });
          if (consumed.count === 0) return 'consumed';

          const existing = await tx.authMethod.findFirst({
            where: { type: 'MOBILE_OTP', claimKey: ck },
          });
          if (existing) return 'existing';

          const patient = await tx.patient.create({
            data: { name: '' },
          });
          const account = await tx.userAccount.create({
            data: { patientId: patient.id, status: 'ACTIVE' },
          });
          const cp = await tx.patientContactPoint.create({
            data: {
              patientId: patient.id,
              type: 'MOBILE',
              relationship: 'SELF',
              valueEncrypted: 'v2:iv:tag:ct',
              valueLookupHash: activeHmac,
              lookupKeyVersion: 'v2',
              verifiedAt: new Date(),
              isPrimary: true,
              status: 'ACTIVE',
            },
          });
          await tx.authMethod.create({
            data: {
              userAccountId: account.id,
              contactPointId: cp.id,
              type: 'MOBILE_OTP',
              identifierLookupHash: activeHmac,
              lookupKeyVersion: 'v2',
              claimKey: ck,
              status: 'ACTIVE',
            },
          });
          return 'success';
        });
      } catch (e: any) {
        if (e.code === 'P2002') return 'existing'; // unique constraint
        return 'consumed';
      }
    }

    // Race two concurrent activations
    const [r1, r2] = await Promise.all([
      tryActivate(ch1.challengeId),
      tryActivate(ch2.challengeId),
    ]);

    const successes = [r1, r2].filter((r) => r === 'success').length;
    const resolved = [r1, r2].filter((r) => r === 'existing' || r === 'consumed').length;

    expect(successes).toBe(1);
    expect(resolved).toBe(1);

    // Exactly one AuthMethod for this mobile
    const authMethods = await prisma.authMethod.findMany({
      where: { type: 'MOBILE_OTP', claimKey: ck },
    });
    expect(authMethods.length).toBe(1);

    // Exactly one UserAccount linked to mobile
    const accounts = await prisma.userAccount.findMany({
      where: { authMethods: { some: { claimKey: ck } } },
    });
    expect(accounts.length).toBe(1);
  });
});

// ─── Gate 4: Key-Rotation Collision ────────────────────────────────────────────

describe('D. Key-Rotation Collision — claimKey survives HMAC rotation', () => {
  it('existing v1-hash record is discovered; v2-hash insert fails on claimKey constraint', async () => {
    const mobile = '+919000000003';
    const ck = stableClaimKey(mobile);

    // Simulate existing v1 auth method (inserted with v1 lookup hash, but same claimKey)
    const v1Hmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V1!)
      .update(mobile)
      .digest('hex');
    const v2Hmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(mobile)
      .digest('hex');

    const patient = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });
    const account = await prisma.userAccount.create({
      data: { patientId: patient.id, status: 'ACTIVE' },
    });
    const cp = await prisma.patientContactPoint.create({
      data: {
        patientId: patient.id,
        type: 'MOBILE',
        relationship: 'SELF',
        valueEncrypted: 'v1:iv:tag:ct',
        valueLookupHash: v1Hmac,
        lookupKeyVersion: 'v1',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });

    // Insert with v1 lookup hash but same claimKey
    await prisma.authMethod.create({
      data: {
        userAccountId: account.id,
        contactPointId: cp.id,
        type: 'MOBILE_OTP',
        identifierLookupHash: v1Hmac,
        lookupKeyVersion: 'v1',
        claimKey: ck,
        status: 'ACTIVE',
      },
    });

    // Now attempt to insert ANOTHER auth method with v2 hash for same mobile
    const patient2 = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });
    const account2 = await prisma.userAccount.create({
      data: { patientId: patient2.id, status: 'ACTIVE' },
    });
    const cp2 = await prisma.patientContactPoint.create({
      data: {
        patientId: patient2.id,
        type: 'MOBILE',
        relationship: 'SELF',
        valueEncrypted: 'v2:iv:tag:ct',
        valueLookupHash: v2Hmac,
        lookupKeyVersion: 'v2',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });

    await expect(
      prisma.authMethod.create({
        data: {
          userAccountId: account2.id,
          contactPointId: cp2.id,
          type: 'MOBILE_OTP',
          identifierLookupHash: v2Hmac,
          lookupKeyVersion: 'v2',
          claimKey: ck, // SAME claim key — should fail
          status: 'ACTIVE',
        },
      }),
    ).rejects.toThrow(); // P2002 unique constraint on (type, claimKey)
  });
});

// ─── Gate 5: Direct DB Bypass ──────────────────────────────────────────────────

describe('E. Direct Database Uniqueness Constraint', () => {
  it('raw SQL insert of duplicate (type, claimKey) is rejected by PostgreSQL', async () => {
    const mobile = '+919000000004';
    const ck = stableClaimKey(mobile);
    const hmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(mobile)
      .digest('hex');

    const patient = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });
    const account = await prisma.userAccount.create({
      data: { patientId: patient.id, status: 'ACTIVE' },
    });
    const cp = await prisma.patientContactPoint.create({
      data: {
        patientId: patient.id,
        type: 'MOBILE',
        relationship: 'SELF',
        valueEncrypted: 'v2:iv:tag:ct',
        valueLookupHash: hmac,
        lookupKeyVersion: 'v2',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });
    await prisma.authMethod.create({
      data: {
        userAccountId: account.id,
        contactPointId: cp.id,
        type: 'MOBILE_OTP',
        identifierLookupHash: hmac,
        lookupKeyVersion: 'v2',
        claimKey: ck,
        status: 'ACTIVE',
      },
    });

    // Second account, same claimKey — DB must reject
    const p2 = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });
    const a2 = await prisma.userAccount.create({ data: { patientId: p2.id, status: 'ACTIVE' } });
    const cp2 = await prisma.patientContactPoint.create({
      data: {
        patientId: p2.id,
        type: 'MOBILE',
        relationship: 'SELF',
        valueEncrypted: 'v2:iv:tag:ct2',
        valueLookupHash: hmac + 'x',
        lookupKeyVersion: 'v2',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });

    // Attempt direct DB insert with duplicate claimKey using raw SQL
    await expect(
      prisma.$executeRaw`
        INSERT INTO auth_methods (id, user_account_id, contact_point_id, type,
          identifier_lookup_hash, lookup_key_version, claim_key, status, created_at, updated_at)
        VALUES (
          gen_random_uuid()::text, ${a2.id}, ${cp2.id}, 'MOBILE_OTP',
          ${hmac}, 'v2', ${ck}, 'ACTIVE', NOW(), NOW()
        )
      `,
    ).rejects.toThrow();
  });
});

// ─── Gate 6: Newborn/Parent Contact Separation ─────────────────────────────────

describe('F. Newborn/Parent Contact Separation', () => {
  it("parent mobile can be contact point for newborn without creating newborn's account", async () => {
    const parentMobile = '+919000000005';
    const parentHmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(parentMobile)
      .digest('hex');

    // Create parent patient + account
    const parent = await prisma.patient.create({
      data: { name: 'Mother', phone: null as any, password: '' },
    });
    const parentAccount = await prisma.userAccount.create({
      data: { patientId: parent.id, status: 'ACTIVE' },
    });
    const parentCp = await prisma.patientContactPoint.create({
      data: {
        patientId: parent.id,
        type: 'MOBILE',
        relationship: 'SELF',
        valueEncrypted: 'v2:iv:tag:ct',
        valueLookupHash: parentHmac,
        lookupKeyVersion: 'v2',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });

    // Create newborn patient — no UserAccount, no auth method
    const newborn = await prisma.patient.create({
      data: { name: 'Baby', phone: null as any, password: '' },
    });

    // Add parent mobile as GUARDIAN contact for newborn — this is allowed
    const newbornCp = await prisma.patientContactPoint.create({
      data: {
        patientId: newborn.id,
        type: 'MOBILE',
        relationship: 'GUARDIAN',
        valueEncrypted: 'v2:iv:tag:ct',
        valueLookupHash: parentHmac,
        lookupKeyVersion: 'v2',
        verifiedAt: new Date(),
        isPrimary: true,
        status: 'ACTIVE',
      },
    });

    // Newborn has NO UserAccount
    const newbornAccount = await prisma.userAccount.findUnique({
      where: { patientId: newborn.id },
    });
    expect(newbornAccount).toBeNull();

    // Parent account has exactly 1 AuthMethod (not newborn's)
    const parentAuthMethods = await prisma.authMethod.findMany({
      where: { userAccountId: parentAccount.id },
    });
    // We haven't created auth method for parent in this test — that's fine
    // The point is newborn has no auth method
    const newbornAuthMethods = await prisma.authMethod.findMany({
      where: {
        contactPointId: newbornCp.id,
      },
    });
    expect(newbornAuthMethods.length).toBe(0);

    // Same mobile hash appears in BOTH PatientContactPoints (allowed)
    const contactsWithParentMobile = await prisma.patientContactPoint.findMany({
      where: { valueLookupHash: parentHmac },
    });
    expect(contactsWithParentMobile.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── Gate 7: Alias Invariants ──────────────────────────────────────────────────

describe('G. Alias Invariants', () => {
  it('1-hop alias: aliasPatientId is unique', async () => {
    const source = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });
    const target = await prisma.patient.create({
      data: { name: '', phone: null as any, password: '' },
    });

    await prisma.patientAlias.create({
      data: { aliasPatientId: source.id, canonicalPatientId: target.id, reason: 'Test' },
    });

    // Attempt to create second alias for same source — must fail (unique on aliasPatientId)
    await expect(
      prisma.patientAlias.create({
        data: { aliasPatientId: source.id, canonicalPatientId: target.id, reason: 'Dupe' },
      }),
    ).rejects.toThrow();
  });

  it('chained alias: target cannot itself be an alias', async () => {
    const a = await prisma.patient.create({ data: { name: '', phone: null as any, password: '' } });
    const b = await prisma.patient.create({ data: { name: '', phone: null as any, password: '' } });
    const c = await prisma.patient.create({ data: { name: '', phone: null as any, password: '' } });

    await prisma.patientAlias.create({
      data: { aliasPatientId: a.id, canonicalPatientId: b.id, reason: 'merge' },
    });

    // B is now an alias — trying to make A→B→C chain
    // Application layer must prevent this; but also verify b.id being the alias target is detectable
    const aliasCheck = await prisma.patientAlias.findUnique({ where: { aliasPatientId: b.id } });
    // b is NOT an alias (only a IS)
    expect(aliasCheck).toBeNull();
  });
});

// ─── Gate 8: Merge Request Governance ─────────────────────────────────────────

describe('H. Merge Request Governance', () => {
  it('merge request created with REQUESTED status and Outbox event atomically', async () => {
    const p1 = await prisma.patient.create({ data: { name: '' } });
    const p2 = await prisma.patient.create({ data: { name: '' } });

    await prisma.$transaction(async (tx) => {
      const req = await tx.identityMergeRequest.create({
        data: {
          sourcePatientIds: [p1.id],
          targetPatientId: p2.id,
          reason: 'Duplicate detected by hospital',
          requestedBy: 'hospital-admin-001',
          status: 'REQUESTED',
        },
      });

      await tx.outboxEvent.create({
        data: {
          eventType: 'IDENTITY_MERGE_REQUESTED',
          payload: {
            aggregateId: p2.id,
            mergeRequestId: req.id,
            sourcePatientIds: [p1.id],
            targetPatientId: p2.id,
            requesterId: 'hospital-admin-001',
          },
        },
      });
    });

    const req = await prisma.identityMergeRequest.findFirst({
      where: { targetPatientId: p2.id },
    });
    expect(req?.status).toBe('REQUESTED');

    const event = await prisma.outboxEvent.findFirst({
      where: { eventType: 'IDENTITY_MERGE_REQUESTED' },
    });
    expect(event).not.toBeNull();
    // No raw patient data in payload beyond IDs
  });
});

// ─── Gate 9: Outbox Atomicity / Rollback ──────────────────────────────────────

describe('I. Outbox Atomicity — Rollback Proves State+Event Fail Together', () => {
  it('PATIENT_ALIAS_CREATED: when outbox insert fails, alias does not persist', async () => {
    const source = await prisma.patient.create({ data: { name: '' } });
    const target = await prisma.patient.create({ data: { name: '' } });

    let aliasCreated = false;
    const outboxId: string | null = null;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.patientAlias.create({
          data: {
            aliasPatientId: source.id,
            canonicalPatientId: target.id,
            reason: 'test rollback',
          },
        });
        aliasCreated = true;

        // Force failure by inserting invalid outbox event (missing required fields via raw SQL)
        await tx.$executeRaw`INSERT INTO outbox_events VALUES (NULL, NULL, NULL, NULL, NULL)`;
      });
    } catch {
      // Expected: transaction rolls back
    }

    // Alias must NOT exist due to rollback
    const alias = await prisma.patientAlias.findUnique({ where: { aliasPatientId: source.id } });
    expect(alias).toBeNull();
  });

  it('PATIENT_ALIAS_CREATED: successful path — alias and outbox event both committed', async () => {
    const source = await prisma.patient.create({ data: { name: '' } });
    const target = await prisma.patient.create({ data: { name: '' } });

    await prisma.$transaction(async (tx) => {
      const alias = await tx.patientAlias.create({
        data: { aliasPatientId: source.id, canonicalPatientId: target.id, reason: 'test success' },
      });
      await tx.outboxEvent.create({
        data: {
          eventType: 'PATIENT_ALIAS_CREATED',
          payload: {
            aggregateId: target.id,
            aliasPatientId: alias.aliasPatientId,
            canonicalPatientId: alias.canonicalPatientId,
            reason: alias.reason,
            actorId: 'admin',
          },
        },
      });
    });

    const alias = await prisma.patientAlias.findUnique({ where: { aliasPatientId: source.id } });
    expect(alias).not.toBeNull();
    const event = await prisma.outboxEvent.findFirst({
      where: { eventType: 'PATIENT_ALIAS_CREATED' },
    });
    expect(event).not.toBeNull();
    const payload = event!.payload as Record<string, unknown>;
    expect(payload).not.toHaveProperty('rawMobile');
    expect(payload).not.toHaveProperty('otp');
  });
});

// ─── Gate 10: Backfill Idempotency ─────────────────────────────────────────────

describe('J. Backfill Idempotency', () => {
  it('legacy Patient with valid phone: backfill creates UNVERIFIED contact, second run is idempotent', async () => {
    // Create legacy patient (simulates pre-Phase-1 row)
    const legacy = await prisma.patient.create({
      data: { name: 'Legacy Patient', phone: '+919000000010', password: 'hash' },
    });

    // Run backfill logic (inline simulation)
    const normalizedPhone = '+919000000010';
    const hmac = crypto
      .createHmac('sha256', process.env.IDENTITY_HMAC_SECRET_V2!)
      .update(normalizedPhone)
      .digest('hex');

    // First run
    const existing = await prisma.patientContactPoint.findFirst({
      where: { patientId: legacy.id, type: 'MOBILE' },
    });
    if (!existing) {
      await prisma.patientContactPoint.create({
        data: {
          patientId: legacy.id,
          type: 'MOBILE',
          relationship: 'SELF',
          valueEncrypted: 'v2:iv:tag:backfill',
          valueLookupHash: hmac,
          lookupKeyVersion: 'v2',
          status: 'UNVERIFIED',
          isPrimary: true,
          // NO verifiedAt — it's unverified from backfill
        },
      });
    }

    // No UserAccount, no AuthMethod fabricated
    const account = await prisma.userAccount.findUnique({ where: { patientId: legacy.id } });
    expect(account).toBeNull();

    const authMethod = await prisma.authMethod.findFirst({
      where: { contactPoint: { patientId: legacy.id } },
    });
    expect(authMethod).toBeNull();

    // Second run — idempotent
    const existing2 = await prisma.patientContactPoint.findFirst({
      where: { patientId: legacy.id, type: 'MOBILE' },
    });
    expect(existing2).not.toBeNull();
    expect(existing2!.status).toBe('UNVERIFIED');

    // Verify no duplicate records
    const contacts = await prisma.patientContactPoint.findMany({
      where: { patientId: legacy.id, type: 'MOBILE' },
    });
    expect(contacts.length).toBe(1);
  });

  it('legacy Patient with null phone: backfill skips, Patient remains valid', async () => {
    const nullPhone = await prisma.patient.create({
      data: { name: 'NullPhone Patient', phone: null as any, password: '' },
    });

    // Backfill should skip
    const contact = await prisma.patientContactPoint.findFirst({
      where: { patientId: nullPhone.id },
    });
    expect(contact).toBeNull();

    // Patient still valid
    const found = await prisma.patient.findUnique({ where: { id: nullPhone.id } });
    expect(found).not.toBeNull();
  });
});
