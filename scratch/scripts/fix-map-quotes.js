const fs = require('fs');
let content = fs.readFileSync('packages/db/prisma/schema.prisma', 'utf8');

const lines = content.split('\n');
let phase5b6Start = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('PHASE 5B.6')) {
    phase5b6Start = i;
    break;
  }
}
console.log('Phase 5B.6 starts at line:', phase5b6Start + 1);

for (let i = phase5b6Start; i < lines.length; i++) {
  // Fix @map(word) -> @map("word")  -- only when value doesn't start with quote
  lines[i] = lines[i].replace(/@map\(([^")\s][^)]*)\)/g, '@map("$1")');
  // Fix @@map(word) -> @@map("word")
  lines[i] = lines[i].replace(/@@map\(([^")\s][^)]*)\)/g, '@@map("$1")');
  // Fix @default("DRAFT") quotes that may have got broken -- leave them
}

content = lines.join('\n');
fs.writeFileSync('packages/db/prisma/schema.prisma', content);
console.log('Fixed @map quotes in Phase 5B.6 section');
