const fs = require('fs');

const baselinePath = 'packages/db/prisma/migrations/0000_baseline/migration.sql';
const rawSql = fs.readFileSync(baselinePath, 'utf8');
const lines = rawSql.split('\n');

console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.startsWith('-- ================================================================') || 
      line.startsWith('-- 1.') || line.startsWith('-- 2.') || line.startsWith('-- 3.') || line.startsWith('-- 4.') ||
      line.startsWith('-- 5.') || line.startsWith('-- 6.') || line.startsWith('-- 7.') || line.startsWith('-- 8.') ||
      line.startsWith('-- 9.') || line.startsWith('-- 10.') || line.startsWith('-- 11.') || line.startsWith('-- 12.') ||
      line.startsWith('-- Phase') || line.startsWith('-- PHASE') ||
      line.includes('.SQL') || line.includes('.sql')) {
    console.log(`L${idx+1}: ${line}`);
  }
});
