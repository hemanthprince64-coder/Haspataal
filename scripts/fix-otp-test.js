const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/auth/__tests__/otp-service.test.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  /mockResolvedValue\(\{([\s\S]*?)\}\);/g,
  'mockResolvedValue({$1} as any);',
);
content = content.replace(/as any as any/g, 'as any');

fs.writeFileSync(filePath, content);
console.log('Fixed otp-service test file');
