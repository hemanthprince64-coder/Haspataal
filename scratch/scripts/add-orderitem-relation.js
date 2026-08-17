const fs = require('fs');
let content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

// Find bloodBankItem and add referralItem after it - search with varied spacing
const variants = [
  '  bloodBankItem       BloodBankExecutionItem?',
  '  bloodBankItem          BloodBankExecutionItem?',
];

let fixed = false;
for (const pattern of variants) {
  if (content.includes(pattern)) {
    content = content
      .split(pattern)
      .join(pattern + '\n  referralItem           ReferralExecutionItem?');
    fixed = true;
    console.log('Fixed with pattern:', pattern.trim());
    break;
  }
}

if (!fixed) {
  // Try to find it by searching for the model
  const orderItemIdx = content.indexOf('model OrderItem {');
  if (orderItemIdx > -1) {
    // Find the closing brace of OrderItem model
    let braceDepth = 0;
    let i = orderItemIdx;
    while (i < content.length) {
      if (content[i] === '{') braceDepth++;
      if (content[i] === '}') {
        braceDepth--;
        if (braceDepth === 0) {
          // Insert before closing brace
          content =
            content.substring(0, i) +
            '  referralItem           ReferralExecutionItem?\n' +
            content.substring(i);
          fixed = true;
          console.log('Fixed by inserting before closing brace of OrderItem');
          break;
        }
      }
      i++;
    }
  }
}

if (!fixed) {
  console.log('Could not find pattern to fix');
  // Print what's near bloodBankItem
  const idx = content.indexOf('BloodBankExecutionItem?');
  console.log(content.substring(Math.max(0, idx - 50), idx + 200));
}

fs.writeFileSync('packages/db/prisma/schema.prisma', content);
console.log('Done');
