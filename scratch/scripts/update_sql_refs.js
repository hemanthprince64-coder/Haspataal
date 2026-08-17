const fs = require('fs');
const path = require('path');

const replacements = [
  {
    file: 'scripts/migrate/generate-migration.ts',
    target: "path.join(__dirname, '../baseline.sql')",
    replacement: "path.join(__dirname, '../../infra/sql/baseline.sql')",
  },
  {
    file: 'scripts/migrate/generate-phase4-sql.ts',
    target: "path.join(__dirname, '../baseline.sql')",
    replacement: "path.join(__dirname, '../../infra/sql/baseline.sql')",
  },
  {
    file: 'scripts/benchmark/test-migrations.ts',
    target: "path.join(__dirname, '../baseline.sql')",
    replacement: "path.join(__dirname, '../../infra/sql/baseline.sql')",
  },
  {
    file: 'scripts/debug/verify-migrations.ts',
    target: "path.join(__dirname, '..', 'baseline.sql')",
    replacement: "path.join(__dirname, '../../infra/sql/baseline.sql')",
  },
  {
    file: 'scratch/scripts/test-index-proof.ts',
    target: "path.join(__dirname, 'baseline.sql')",
    replacement: "path.join(__dirname, '../../infra/sql/baseline.sql')",
  },
  {
    file: 'scripts/debug/platform-health-check.js',
    target: "['./supabase_rls_audit_day11.sql', './enable_rls_health_modules.sql']",
    replacement:
      "['../../infra/sql/supabase_rls_audit_day11.sql', '../../infra/sql/enable_rls_health_modules.sql']",
  },
  {
    file: 'docs/security/rls-policies.md',
    target: '[`enable_rls_health_modules.sql`](../../enable_rls_health_modules.sql)',
    replacement: '[`enable_rls_health_modules.sql`](../../infra/sql/enable_rls_health_modules.sql)',
  },
  {
    file: 'docs/security/rls-policies.md',
    target: '[`supabase_rls_audit_day11.sql`](../../supabase_rls_audit_day11.sql)',
    replacement: '[`supabase_rls_audit_day11.sql`](../../infra/sql/supabase_rls_audit_day11.sql)',
  },
  {
    file: 'docs/adr/ADR-002-postgresql-index-strategy.md',
    target: '[optimize_indexes.sql](../../optimize_indexes.sql)',
    replacement: '[optimize_indexes.sql](../../infra/sql/optimize_indexes.sql)',
  },
  {
    file: 'docs/adr/ADR-001-supabase-rls-data-isolation.md',
    target: '[enable_rls_health_modules.sql](../../enable_rls_health_modules.sql)',
    replacement: '[enable_rls_health_modules.sql](../../infra/sql/enable_rls_health_modules.sql)',
  },
  {
    file: 'docs/adr/ADR-001-supabase-rls-data-isolation.md',
    target: '[supabase_rls_audit_day11.sql](../../supabase_rls_audit_day11.sql)',
    replacement: '[supabase_rls_audit_day11.sql](../../infra/sql/supabase_rls_audit_day11.sql)',
  },
];

const root = process.cwd();

for (const rep of replacements) {
  const p = path.join(root, rep.file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    const newContent = content.replace(rep.target, rep.replacement);
    if (content !== newContent) {
      fs.writeFileSync(p, newContent);
      console.log(`Updated ${rep.file}`);
    } else {
      console.log(`Skipped ${rep.file} (no match)`);
    }
  } else {
    console.log(`Skipped ${rep.file} (not found)`);
  }
}
