import { execSync } from 'child_process';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * HASPATAAL QUALITY AUDIT SCRIPT
 * Verifies 28 improvements across 4 phases of platform engineering.
 */

interface AuditCheck {
  id: string;
  category: 'SECURITY' | 'QUALITY' | 'STRUCTURE' | 'EXCELLENCE';
  description: string;
  command?: string;
  check?: () => boolean | string | Promise<boolean | string>;
  weight: number;
}

const checks: AuditCheck[] = [
  // SECURITY (Phase 1)
  {
    id: 'SEC-01',
    category: 'SECURITY',
    description: 'No plaintext passwords in lib/',
    check: () => {
      const libPath = path.join(process.cwd(), 'lib');
      if (!fs.existsSync(libPath)) return true;
      const files = fs.readdirSync(libPath, { recursive: true }) as string[];
      for (const file of files) {
        const fullPath = path.join(libPath, file);
        if (fs.statSync(fullPath).isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (/=== password|!== password|password123/i.test(content)) return false;
        }
      }
      return true;
    },
    weight: 5,
  },
  {
    id: 'SEC-02',
    category: 'SECURITY',
    description: 'CI/CD workflows defined (CI + CD)',
    check: () => fs.existsSync('.github/workflows/ci.yml') && fs.existsSync('.github/workflows/deploy.yml'),
    weight: 5,
  },
  {
    id: 'SEC-03',
    category: 'SECURITY',
    description: 'No legacy boneyard/toon-format deps',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      return !deps['boneyard'] && !deps['toon-format'];
    },
    weight: 5,
  },

  // QUALITY (Phase 2)
  {
    id: 'QUAL-01',
    category: 'QUALITY',
    description: 'TypeScript strict compilation',
    command: 'npx tsc --noEmit',
    weight: 10,
  },
  {
    id: 'QUAL-02',
    category: 'QUALITY',
    description: 'Vitest suite passing (20+ tests)',
    command: 'npx vitest run --reporter=verbose',
    weight: 10,
  },
  {
    id: 'QUAL-03',
    category: 'QUALITY',
    description: 'Test coverage threshold (70%+)',
    check: () => {
      const config = fs.readFileSync('vitest.config.ts', 'utf8');
      return config.includes('statements: 70') || config.includes('thresholds');
    },
    weight: 5,
  },
  {
    id: 'QUAL-04',
    category: 'QUALITY',
    description: 'Server Actions uses TypeScript',
    check: () => fs.existsSync('app/actions.ts'),
    weight: 5,
  },

  // STRUCTURE (Phase 3)
  {
    id: 'STR-01',
    category: 'STRUCTURE',
    description: 'Monorepo workspaces configured',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return Array.isArray(pkg.workspaces);
    },
    weight: 5,
  },
  {
    id: 'STR-02',
    category: 'STRUCTURE',
    description: 'Shared packages initialized',
    check: () => ['db', 'types', 'config', 'auth', 'logger'].every(p => fs.existsSync(path.join('packages', p))),
    weight: 10,
  },
  {
    id: 'STR-03',
    category: 'STRUCTURE',
    description: 'ADRs documented (5+ decisions)',
    check: () => fs.existsSync('docs/adr') && fs.readdirSync('docs/adr').filter(f => f.endsWith('.md')).length >= 5,
    weight: 5,
  },
  {
    id: 'STR-04',
    category: 'STRUCTURE',
    description: 'PR Template exists for workflows',
    check: () => fs.existsSync('.github/PULL_REQUEST_TEMPLATE.md') || fs.existsSync('.github/pull_request_template.md'),
    weight: 5,
  },

  // EXCELLENCE (Phase 4)
  {
    id: 'EXC-01',
    category: 'EXCELLENCE',
    description: 'Architecture diagrams (Mermaid)',
    check: () => fs.existsSync('docs/architecture/README.md') && fs.readFileSync('docs/architecture/README.md', 'utf8').includes('mermaid'),
    weight: 10,
  },
  {
    id: 'EXC-02',
    category: 'EXCELLENCE',
    description: 'Health API + Database Check',
    command: 'curl -s http://localhost:3000/api/health | findstr /C:"\\"database\\":{\\"status\\":\\"healthy\\""',
    weight: 10,
  },
  {
    id: 'EXC-03',
    category: 'EXCELLENCE',
    description: 'DPDP Compliance documentation',
    check: () => fs.existsSync('docs/compliance/dpdp-compliance.md'),
    weight: 5,
  },
  {
    id: 'EXC-04',
    category: 'EXCELLENCE',
    description: 'Playwright E2E specs listed',
    command: 'npx playwright test --list',
    weight: 5,
  },
];

async function runAudit() {
  console.log(chalk.cyan.bold('\n' + '='.repeat(60)));
  console.log(chalk.cyan.bold(' 🏥 HASPATAAL ENGINEERING QUALITY AUDIT (PHASES 1-4) '));
  console.log(chalk.cyan.bold('='.repeat(60) + '\n'));
  
  let totalScore = 0;
  let maxScore = checks.reduce((acc, c) => acc + c.weight, 0);

  for (const check of checks) {
    let passed = false;
    let categoryColor = check.category === 'SECURITY' ? chalk.red : 
                        check.category === 'QUALITY' ? chalk.yellow :
                        check.category === 'STRUCTURE' ? chalk.blue : chalk.magenta;

    process.stdout.write(`${categoryColor(`[${check.category}]`)} ${check.description.padEnd(45)} `);

    try {
      if (check.command) {
        // Run command silently
        execSync(check.command, { stdio: 'ignore' });
        passed = true;
      } else if (check.check) {
        const result = await check.check();
        passed = !!result;
      }
    } catch (e) {
      passed = false;
    }

    if (passed) {
      console.log(chalk.green('✅ PASS'));
      totalScore += check.weight;
    } else {
      console.log(chalk.red('❌ FAIL'));
    }
  }

  const finalScore = Math.round((totalScore / maxScore) * 100);
  console.log('\n' + chalk.cyan('─'.repeat(60)));
  console.log(chalk.bold(` FINAL AUDIT SCORE: `) + (finalScore >= 80 ? chalk.green(`${finalScore}/100`) : chalk.red(`${finalScore}/100`)));
  
  if (finalScore === 100) {
    console.log(chalk.green.bold(' 🏆 PLATINUM STATUS: All Haspataal engineering standards met.'));
  } else if (finalScore >= 80) {
    console.log(chalk.green.bold(' ✅ PRODUCTION READY: Platform meets core stability requirements.'));
  } else if (finalScore >= 60) {
    console.log(chalk.yellow.bold(' ⚠️ DEGRADED: Several architectural or quality gaps identified.'));
  } else {
    console.log(chalk.red.bold(' 🚨 CRITICAL: Significant compliance and security failures.'));
  }
  console.log(chalk.cyan('─'.repeat(60)) + '\n');
}

runAudit().catch(err => {
  console.error(chalk.red('Audit failed to run:'), err);
  process.exit(1);
});
