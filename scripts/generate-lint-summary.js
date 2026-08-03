const fs = require('fs');
const tsData = JSON.parse(fs.readFileSync('reports/ts-baseline.json', 'utf8'));
const lintData = JSON.parse(fs.readFileSync('reports/lint-baseline.json', 'utf8'));
let errors = 0;
let warnings = 0;
for (const file of lintData) {
  errors += file.errorCount;
  warnings += file.warningCount;
}
const summary = `# Lint and TS Baseline\n\n- TS Errors: ${tsData.total_errors}\n- ESLint Errors: ${errors}\n- ESLint Warnings: ${warnings}\n`;
fs.writeFileSync('reports/lint-summary.md', summary);
console.log('Wrote reports/lint-summary.md');
