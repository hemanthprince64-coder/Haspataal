const fs = require('fs');
const errors = JSON.parse(fs.readFileSync('other_errors.json', 'utf8'));
const patientStmts = JSON.parse(fs.readFileSync('patient_dependent_stmts.json', 'utf8'));

console.log('--- PATIENT DEPENDENT STATEMENTS (' + patientStmts.length + ') ---');
patientStmts.forEach((p, i) => {
  console.log(`[${i+1}] (line index ${p.index}) Error: ${p.error.trim().split('\n')[0]}`);
  console.log('    SQL:', p.stmt.replace(/\s+/g, ' ').slice(0, 100));
});

console.log('\n--- OTHER ERRORS (' + errors.length + ') ---');
errors.forEach((e, i) => {
  console.log(`[${i+1}] (stmt index ${e.index}) Error: ${e.error.trim().split('\n')[0]}`);
  console.log('    SQL:', e.stmt.replace(/\s+/g, ' ').slice(0, 100));
});
