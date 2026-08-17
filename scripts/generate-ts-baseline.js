const fs = require('fs');
const text = fs.readFileSync('reports/ts-baseline.txt', 'utf8');
const lines = text.split('\n');
const errors = lines.filter((l) => l.includes('error TS')).length;
fs.writeFileSync('reports/ts-baseline.json', JSON.stringify({ total_errors: errors }, null, 2));
console.log('Wrote reports/ts-baseline.json');
