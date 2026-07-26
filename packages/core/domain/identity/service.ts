import {
  PrismaClient,
  Patient,
  UserAccount,
  AuthMethod,
  PatientContactPoint,
  MobileVerificationChallenge,
  IdentityMergeRequest,
} from '@prisma/client';
import * as crypto from 'crypto';
import Redis from 'ioredis';

import { IdentityCryptography } from './cryptography';
import { IdentityEvents } from './events';
import { MobileNormalization } from './normalization';

const prisma = new PrismaClient();

// Use existing redis config from env
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
});
redis.on('error', () => {
  /* ignore build-time connection errors */
});

export class IdentityService {
  private static readonly RATE_LIMIT_PREFIX = 'rate_limit:identity:otp:';
  private static readonly MAX_OTP_PER_WINDOW = 3;
  private static readonly OTP_WINDOW_SECONDS = 900; // 15 mins

  /**
   * Rate limits OTP issuance by IP and Mobile Hash.
   */
  private static async checkRateLimit(ipAddress: string, lookupHash: string): Promise<void> {
    const key = `${this.RATE_LIMIT_PREFIX}${ipAddress}:${lookupHash}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, this.OTP_WINDOW_SECONDS);
    }
    if (current > this.MAX_OTP_PER_WINDOW) {
      throw new Error('ERR_RATE_LIMIT');
    }
  }

  /**
   * Strict 1-hop alias resolution. Chains and cycles are rejected.
   */
  public static async resolvePatientId(inputPatientId: string): Promise<string> {
    const aliasRecord = await prisma.patientAlias.findUnique({
      where: { aliasPatientId: inputPatientId },
    });

    if (!aliasRecord) {
      return inputPatientId; // Canonical
    }

    if (aliasRecord.canonicalPatientId === inputPatientId) {
      throw new Error(`Self-referencing alias detected for ${inputPatientId}`);
    }

    // Ensure the target is not itself an alias (1-hop enforcement)
    const targetAlias = await prisma.patientAlias.findUnique({
      where: { aliasPatientId: aliasRecord.canonicalPatientId },
    });

    if (targetAlias) {
      throw new Error(`Chained alias detected for ${inputPatientId}. Target is also an alias.`);
    }

    return aliasRecord.canonicalPatientId;
  }

  /**
   * Safely creates an alias ensuring 1-hop invariant.
   */
  public static async createAlias(
    sourcePatientId: string,
    targetPatientId: string,
    reason: string,
    actorId: string,
  ): Promise<void> {
    if (sourcePatientId === targetPatientId) {
      throw new Error('Cannot alias a patient to themselves.');
    }

    await prisma.$transaction(async (tx) => {
      const targetIsAlias = await tx.patientAlias.findUnique({
        where: { aliasPatientId: targetPatientId },
      });
      if (targetIsAlias) {
        throw new Error('Target patient is an alias. Chained aliases are forbidden.');
      }

      const existingSourceAlias = await tx.patientAlias.findUnique({
        where: { aliasPatientId: sourcePatientId },
      });
      if (existingSourceAlias) {
        throw new Error('Source is already an alias.');
      }

      const alias = await tx.patientAlias.create({
        data: {
          aliasPatientId: sourcePatientId,
          canonicalPatientId: targetPatientId,
          reason,
          mergedBy: actorId,
        },
      });

      // Outbox Event
      await tx.outboxEvent.create({
        data: IdentityEvents.aliasCreated({
          aliasPatientId: alias.aliasPatientId,
          canonicalPatientId: alias.canonicalPatientId,
          reason: alias.reason || '',
          actorId,
        }),
      });
    });
  }

  /**
   * Request an identity merge
   */
  public static async requestMerge(
    sourcePatientIds: string[],
    targetPatientId: string,
    reason: string,
    requesterId: string,
    organizationId?: string,
  ): Promise<IdentityMergeRequest> {
    return prisma.$transaction(async (tx) => {
      const request = await tx.identityMergeRequest.create({
        data: {
          sourcePatientIds,
          targetPatientId,
          reason,
          requestedBy: requesterId,
          requesterOrganizationId: organizationId,
          status: 'REQUESTED',
        },
      });

      await tx.outboxEvent.create({
        data: IdentityEvents.mergeRequested({
          mergeRequestId: request.id,
          sourcePatientIds: request.sourcePatientIds,
          targetPatientId: request.targetPatientId,
          requesterId: request.requestedBy,
        }),
      });

      return request;
    });
  }

  /**
   * Issues a Mobile Verification Challenge (OTP).
   */
  public static async issueMobileVerificationChallenge(
    rawMobile: string,
    purpose: string,
    ipAddress: string,
  ): Promise<{ challengeId: string; plaintextOtp: string }> {
    const normalizedMobile = MobileNormalization.normalize(rawMobile);
    const { hash: lookupHash } = IdentityCryptography.generateLookupHash(normalizedMobile);

    await this.checkRateLimit(ipAddress, lookupHash);

    const { encrypted: encryptedMobile } = IdentityCryptography.encryptValue(normalizedMobile);
    const plaintextOtp = IdentityCryptography.generateOTP();
    const otpDigest = crypto.createHash('sha256').update(plaintextOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const challenge = await prisma.mobileVerificationChallenge.create({
      data: {
        mobileLookupHash: lookupHash,
        mobileEncrypted: encryptedMobile,
        purpose,
        otpDigest,
        expiresAt,
        status: 'PENDING',
        maxAttempts: 3,
      },
    });

    return { challengeId: challenge.id, plaintextOtp };
  }

  /**
   * Verifies an OTP against a challenge.
   */
  public static async verifyMobileChallenge(
    challengeId: string,
    plaintextOtp: string,
  ): Promise<boolean> {
    return prisma.$transaction(async (tx) => {
      const challenge = await tx.mobileVerificationChallenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge) throw new Error('Challenge not found');
      if (challenge.status !== 'PENDING')
        throw new Error(`Challenge status is ${challenge.status}`);
      if (challenge.expiresAt < new Date()) {
        await tx.mobileVerificationChallenge.update({
          where: { id: challengeId },
          data: { status: 'EXPIRED' },
        });
        throw new Error('Challenge expired');
      }
      if (challenge.attemptCount >= challenge.maxAttempts) {
        await tx.mobileVerificationChallenge.update({
          where: { id: challengeId },
          data: { status: 'EXPIRED' },
        });
        throw new Error('Maximum attempts exceeded');
      }

      const inputDigest = crypto.createHash('sha256').update(plaintextOtp).digest('hex');

      if (challenge.otpDigest !== inputDigest) {
        await tx.mobileVerificationChallenge.update({
          where: { id: challengeId },
          data: { attemptCount: { increment: 1 } },
        });
        return false;
      }

      await tx.mobileVerificationChallenge.update({
        where: { id: challengeId },
        data: {
          status: 'VERIFIED',
          verifiedAt: new Date(),
          attemptCount: { increment: 1 },
        },
      });

      return true;
    });
  }

  /**
   * Activates/Resolves Account from a VERIFIED challenge.
   * Handles Cases A, C, D, E. Does NOT auto-merge.
   */
  public static async activateAccount(challengeId: string, rawMobile: string, patientId?: string) {
    const normalizedMobile = MobileNormalization.normalize(rawMobile);
    const supportedHashes = IdentityCryptography.generateAllSupportedHashes(normalizedMobile);
    const activeHash = supportedHashes[0];

    // Stable privacy-safe lock keys for the transaction
    const hashBuffer = crypto.createHash('sha256').update(normalizedMobile).digest();
    const lockKey1 = hashBuffer.readInt32BE(0);
    const lockKey2 = hashBuffer.readInt32BE(4);

    return prisma.$transaction(async (tx) => {
      // 0. Take transaction-level advisory lock on the mobile identity
      // This enforces serialization of concurrent registrations for the same mobile,
      // surviving key rotation because the lock keys are based on raw SHA-256 of the normalized number.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(${lockKey1}, ${lockKey2})`;
      // 1. Safe consumption lock
      const challenge = await tx.mobileVerificationChallenge.findUnique({
        where: { id: challengeId },
      });

      if (!challenge || challenge.status !== 'VERIFIED') {
        throw new Error('Challenge must be VERIFIED');
      }

      const consumed = await tx.mobileVerificationChallenge.updateMany({
        where: { id: challengeId, status: 'VERIFIED' },
        data: { status: 'CONSUMED', consumedAt: new Date() },
      });

      if (consumed.count === 0) {
        throw new Error('Challenge already consumed concurrently');
      }

      // 2. Search for existing AuthMethod across all key versions
      const existingAuthMethod = await tx.authMethod.findFirst({
        where: {
          type: 'MOBILE_OTP',
          identifierLookupHash: { in: supportedHashes.map((h) => h.hash) },
        },
        include: { userAccount: true },
      });

      let targetUserAccount: UserAccount;

      if (existingAuthMethod) {
        if (patientId && existingAuthMethod.userAccount.patientId !== patientId) {
          // Case C: Mobile bound to someone else
          throw new Error('IDENTITY_RECONCILIATION_REQUIRED');
        }

        // Case A/B: Exists
        targetUserAccount = existingAuthMethod.userAccount;

        // Rehash if using old key
        if (IdentityCryptography.requiresRehash(existingAuthMethod.lookupKeyVersion)) {
          await tx.authMethod.update({
            where: { id: existingAuthMethod.id },
            data: {
              identifierLookupHash: activeHash.hash,
              lookupKeyVersion: activeHash.version,
            },
          });
        }
      } else {
        // Create new AuthMethod & possibly UserAccount/Patient (Case D & E)
        let actualPatientId = patientId;

        if (!actualPatientId) {
          const newPatient = await tx.patient.create({
            data: {
              name: '', // Will be set during patient profile completion
              // phone is now optional (migration 12: DROP NOT NULL)
              // password is now optional (migration 12: DROP NOT NULL)
            },
          });
          actualPatientId = newPatient.id;
        } else {
          const existingAcc = await tx.userAccount.findUnique({
            where: { patientId: actualPatientId },
          });
          if (existingAcc) {
            targetUserAccount = existingAcc;
          }
        }

        if (!targetUserAccount!) {
          targetUserAccount = await tx.userAccount.create({
            data: { patientId: actualPatientId, status: 'ACTIVE' },
          });
        }

        const contactPoint = await tx.patientContactPoint.create({
          data: {
            patientId: actualPatientId,
            type: 'MOBILE',
            relationship: 'SELF', // Strict Newborn Guard
            valueEncrypted: challenge.mobileEncrypted,
            valueLookupHash: activeHash.hash,
            lookupKeyVersion: activeHash.version,
            verifiedAt: challenge.verifiedAt,
            isPrimary: true,
            status: 'ACTIVE',
          },
        });

        const authMethod = await tx.authMethod.create({
          data: {
            userAccountId: targetUserAccount.id,
            contactPointId: contactPoint.id,
            type: 'MOBILE_OTP',
            identifierLookupHash: activeHash.hash,
            lookupKeyVersion: activeHash.version,
            claimKey: IdentityCryptography.generateStableClaimKey(normalizedMobile),
            status: 'ACTIVE',
          },
        });

        await tx.outboxEvent.create({
          data: IdentityEvents.accountLinked({
            patientId: actualPatientId,
            userAccountId: targetUserAccount.id,
          }),
        });

        await tx.outboxEvent.create({
          data: IdentityEvents.authMethodVerified({
            patientId: actualPatientId,
            authMethodId: authMethod.id,
            authType: authMethod.type,
          }),
        });
      }

      return targetUserAccount;
    });
  }
}
