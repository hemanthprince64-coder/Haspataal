const fs = require('fs');

const testFile = 'packages/core/domain/bloodbank/__tests__/phase5b5-bloodbank.integration.test.ts';
let content = fs.readFileSync(testFile, 'utf8');

content = content.replace(
  'items: order.items,',
  "items: order.items.map((i: any) => ({ ...i, code: 'PACKED_RBC', volume: 300 })),",
);
content = content.replace(
  'items: order.items,',
  "items: order.items.map((i: any) => ({ ...i, code: 'PACKED_RBC', volume: 300 })),",
);

fs.writeFileSync(testFile, content);
console.log('Fixed test file items payload');
