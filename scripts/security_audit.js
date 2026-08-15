const { execSync } = require('child_process');

console.log('=== 1. TRACKED .ENV FILES ===');
const trackedEnv = execSync('git ls-files "*.env*"').toString().trim();
console.log(trackedEnv ? trackedEnv : 'NO .env files tracked in git (SAFE)');

console.log('\n=== 2. HARDCODED PRIVATE KEYS / PRODUCTION SECRETS ===');
try {
  const secrets = execSync('git grep -inE "(sk_live|BEGIN RSA PRIVATE KEY|BEGIN PRIVATE KEY|AKIA[0-9A-Z]{16})" -- ":!node_modules" ":!*.lock"').toString().trim();
  console.log(secrets ? secrets : 'NO exposed private keys found');
} catch (e) {
  console.log('NO exposed private keys found (SAFE)');
}

console.log('\n=== 3. SENSITIVE CREDENTIAL LOGGING AUDIT ===');
try {
  const phiLogs = execSync('git grep -inE "(console\\.log.*password|console\\.log.*token|logger\\..*password)" -- ":!node_modules" ":!tests" ":!*.test.ts" ":!*.spec.ts"').toString().trim();
  console.log(phiLogs ? phiLogs : 'NO credential logging found');
} catch (e) {
  console.log('NO credential logging found (SAFE)');
}

console.log('\n=== 4. MOCK CREDENTIALS / FAKE PROVIDERS IN PRODUCTION APPS ===');
try {
  const mocks = execSync('git grep -inE "(MOCK_PAYMENT_SECRET|TEST_SECRET_KEY|dummy_token)" -- apps/ services/ packages/core/').toString().trim();
  console.log(mocks ? mocks : 'NO production mock keys found in active app code');
} catch (e) {
  console.log('NO production mock keys found (SAFE)');
}
