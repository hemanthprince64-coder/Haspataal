import { PrismaClient } from '@prisma/client';

import { IdentityCryptography } from '../packages/core/domain/identity/cryptography';
import { IdentityService } from '../packages/core/domain/identity/service';

const prisma = new PrismaClient();

async function runConcurrencyTest() {
  console.log('Running Authentication Concurrency & Key Rotation Test...');

  // Setup: Ensure we have active and previous keys
  process.env.IDENTITY_HMAC_SECRET_V1 = 'old_secret_12345';
  process.env.IDENTITY_HMAC_SECRET_V2 = 'new_secret_67890';
  process.env.IDENTITY_ENCRYPTION_KEY_V1 =
    '1234567890123456789012345678901234567890123456789012345678901234';
  process.env.IDENTITY_ENCRYPTION_KEY_V2 =
    '0987654321098765432109876543210987654321098765432109876543210987';

  const rawMobile = '+919999999999';

  // Issue 2 challenges concurrently
  const p1 = IdentityService.issueMobileVerificationChallenge(
    rawMobile,
    'ACCOUNT_ACTIVATION',
    '127.0.0.1',
  );
  // Fake different IP to avoid rate limit for testing
  const p2 = IdentityService.issueMobileVerificationChallenge(
    rawMobile,
    'ACCOUNT_ACTIVATION',
    '127.0.0.2',
  );

  const [c1, c2] = await Promise.all([p1, p2]);

  // Verify both
  await IdentityService.verifyMobileChallenge(c1.challengeId, c1.plaintextOtp);
  await IdentityService.verifyMobileChallenge(c2.challengeId, c2.plaintextOtp);

  console.log('Challenges verified. Attempting concurrent activation...');

  // Concurrently attempt to activate both
  const start = Date.now();
  const activationPromises = [
    IdentityService.activateAccount(c1.challengeId, rawMobile).catch((e) => e.message),
    IdentityService.activateAccount(c2.challengeId, rawMobile).catch((e) => e.message),
  ];

  const results = await Promise.all(activationPromises);
  const end = Date.now();

  console.log(`Concurrent execution time: ${end - start}ms`);
  console.log('Results:', results);

  // Check how many AuthMethods were created
  const authMethods = await prisma.authMethod.findMany();
  console.log(`AuthMethods created: ${authMethods.length}`);

  // Test Key Rotation Bypass attempt
  console.log('Attempting to bypass with v1 key logic...');

  // We simulate a race condition where a server is still running with V1 as active
  const v1Hash = IdentityCryptography.generateAllSupportedHashes(rawMobile).find(
    (h) => h.version === 'v1',
  )!;

  try {
    // Direct db insert mimicking a server that doesn't use advisory locks or uses different keys
    await prisma.authMethod.create({
      data: {
        userAccountId: authMethods[0].userAccountId,
        contactPointId: authMethods[0].contactPointId,
        type: 'MOBILE_OTP',
        identifierLookupHash: v1Hash.hash,
        lookupKeyVersion: 'v1',
        status: 'ACTIVE',
      },
    });
    console.log('V1 insert succeeded (THIS SHOULD NOT HAPPEN IF PREVENTED BY LOGIC)');
  } catch (e: any) {
    console.log('V1 insert failed as expected (Unique Constraint or Logic):', e.message);
  }

  await prisma.$disconnect();
}

if (require.main === module) {
  runConcurrencyTest().catch(console.error);
}
