const fs = require('fs');
let content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

// Add referralExecutions and careTransfers to Patient model
// Find the consents relation line and append after it
const consentLine = '  consents                 Consent[]';
if (content.includes(consentLine)) {
  content = content
    .split(consentLine)
    .join(
      consentLine +
        '\n  referralExecutions       ReferralExecution[]\n  careTransfers            CareTransfer[]',
    );
  console.log('Added Patient referral relations');
} else {
  console.log('Pattern not found, trying alternative...');
  // Try without the exact spacing
  const idx = content.indexOf('Consent[]');
  if (idx > -1) {
    const lineEnd = content.indexOf('\n', idx);
    content =
      content.substring(0, lineEnd) +
      '\n  referralExecutions       ReferralExecution[]\n  careTransfers            CareTransfer[]' +
      content.substring(lineEnd);
    console.log('Added via index');
  }
}

fs.writeFileSync('packages/db/prisma/schema.prisma', content);
console.log('Done');
