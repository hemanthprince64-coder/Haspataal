const fs = require('fs');
const { execSync } = require('child_process');

function resetTestDb() {
  execSync('docker exec haspataal-postgres psql -U postgres -c "DROP DATABASE IF EXISTS test_db;"');
  execSync('docker exec haspataal-postgres psql -U postgres -c "CREATE DATABASE test_db;"');
}

// Function to split SQL into statements properly
function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let stringChar = '';
  let inDollarQuote = false;
  let dollarTag = '';
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';

    // Handle comments
    if (!inString && !inDollarQuote) {
      if (!inLineComment && !inBlockComment) {
        if (char === '-' && nextChar === '-') {
          inLineComment = true;
          current += char;
          continue;
        }
        if (char === '/' && nextChar === '*') {
          inBlockComment = true;
          current += char;
          continue;
        }
      } else if (inLineComment) {
        if (char === '\n') {
          inLineComment = false;
        }
        current += char;
        continue;
      } else if (inBlockComment) {
        if (char === '*' && nextChar === '/') {
          inBlockComment = false;
          current += char + nextChar;
          i++;
          continue;
        }
        current += char;
        continue;
      }
    }

    // Handle string quotes
    if (!inLineComment && !inBlockComment && !inDollarQuote) {
      if ((char === "'" || char === '"') && !inString) {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      } else if (inString && char === stringChar) {
        // Check for escaped quote ''
        if (char === "'" && nextChar === "'") {
          current += "''";
          i++;
          continue;
        }
        inString = false;
        current += char;
        continue;
      }
    }

    // Handle dollar quotes (e.g. $$ or $tag$)
    if (!inLineComment && !inBlockComment && !inString) {
      if (char === '$') {
        if (!inDollarQuote) {
          const match = sql.slice(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
          if (match) {
            inDollarQuote = true;
            dollarTag = match[1];
            current += dollarTag;
            i += dollarTag.length - 1;
            continue;
          }
        } else {
          if (sql.slice(i).startsWith(dollarTag)) {
            inDollarQuote = false;
            current += dollarTag;
            i += dollarTag.length - 1;
            dollarTag = '';
            continue;
          }
        }
      }
    }

    if (char === ';' && !inString && !inDollarQuote && !inLineComment && !inBlockComment) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed + ';');
      }
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    statements.push(current.trim());
  }
  return statements;
}

const baselinePath = 'packages/db/prisma/migrations/0000_baseline/migration.sql';
const rawSql = fs.readFileSync(baselinePath, 'utf8');
const stmts = splitStatements(rawSql);
console.log('Total parsed statements in 0000_baseline:', stmts.length);

resetTestDb();

const validBaselineStmts = [];
const patientDependentStmts = [];
const otherErrors = [];

for (let i = 0; i < stmts.length; i++) {
  const stmt = stmts[i];
  fs.writeFileSync('temp_stmt.sql', stmt);
  execSync('docker cp temp_stmt.sql haspataal-postgres:/tmp/temp_stmt.sql');
  try {
    execSync('docker exec haspataal-postgres psql -U postgres -d test_db -v ON_ERROR_STOP=1 -f /tmp/temp_stmt.sql', { stdio: 'pipe' });
    validBaselineStmts.push(stmt);
  } catch (err) {
    const errMsg = err.stderr ? err.stderr.toString() : err.message;
    if (errMsg.includes('relation "patients" does not exist') || errMsg.includes('table "patients" does not exist') || /patients/i.test(errMsg)) {
      patientDependentStmts.push({ index: i, stmt, error: errMsg });
    } else {
      otherErrors.push({ index: i, stmt, error: errMsg });
    }
  }
}

if (fs.existsSync('temp_stmt.sql')) fs.unlinkSync('temp_stmt.sql');

console.log('Valid Baseline Statements:', validBaselineStmts.length);
console.log('Patient-Dependent Statements:', patientDependentStmts.length);
console.log('Other Error Statements:', otherErrors.length);

if (otherErrors.length > 0) {
  console.log('\n--- OTHER ERRORS ---');
  otherErrors.forEach((e, idx) => {
    console.log(`[${idx+1}] Stmt idx ${e.index}:`);
    console.log('SQL:', e.stmt.slice(0, 150) + '...');
    console.log('ERROR:', e.error.trim());
    console.log('---------------------');
  });
}

fs.writeFileSync('patient_dependent_stmts.json', JSON.stringify(patientDependentStmts, null, 2));
fs.writeFileSync('other_errors.json', JSON.stringify(otherErrors, null, 2));
