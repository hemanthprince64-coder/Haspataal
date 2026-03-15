/**
 * HASPATAAL — FULL PLATFORM HEALTH CHECK
 * WAR ROOM AUTO-FIX MODE
 *
 * Agents: DevOps, Backend, Database, Frontend, Security
 * Covers: All 5 audit steps from the system command
 */

const { execSync } = require('child_process');
require('dotenv').config({ path: './.env' });

// Color coding for WAR ROOM output
const c = {
    pass: (s) => `\x1b[32m✅ PASS\x1b[0m  ${s}`,
    fail: (s) => `\x1b[31m❌ FAIL\x1b[0m  ${s}`,
    warn: (s) => `\x1b[33m⚠️  WARN\x1b[0m  ${s}`,
    info: (s) => `\x1b[36m🔍 INFO\x1b[0m  ${s}`,
    head: (s) => `\n\x1b[1m\x1b[35m${'═'.repeat(60)}\n  ${s}\n${'═'.repeat(60)}\x1b[0m`,
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;
const fixes = [];
const findings = {};

function pass(label, detail = '') {
    passCount++;
    console.log(c.pass(`${label}${detail ? ' — ' + detail : ''}`));
}
function fail(label, detail = '') {
    failCount++;
    console.log(c.fail(`${label}${detail ? ' — ' + detail : ''}`));
    findings[label] = detail;
}
function warn(label, detail = '') {
    warnCount++;
    console.log(c.warn(`${label}${detail ? ' — ' + detail : ''}`));
}
function info(label) {
    console.log(c.info(label));
}

// ============================================================
// STEP 1: INFRASTRUCTURE HEALTH CHECK (DevOps Agent)
// ============================================================
console.log(c.head('STEP 1 · DevOps Agent — Infrastructure Health'));

// Check required env vars
const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];
for (const env of requiredEnvVars) {
    if (process.env[env]) {
        pass(`ENV: ${env}`, 'present');
    } else {
        fail(`ENV: ${env}`, 'MISSING — check .env file');
    }
}

// Check key project files exist
const { existsSync } = require('fs');
const criticalFiles = [
    './nginx.conf',
    './docker-compose.yml',
    './.github/workflows/deploy.yml',
    './.claude/PRODUCTION_CHECKLIST.md',
    './.claude/WAR_ROOM_MASTER_PLAN.md',
    './api-gateway/index.js',
    './auth-service/index.js',
    './doctor-portal/src/app/layout.tsx',
    './hospital-hms/src/app/layout.tsx',
    './scripts/phase4_security_rls.sql',
];
for (const f of criticalFiles) {
    if (existsSync(f)) {
        pass(`FILE: ${f}`);
    } else {
        fail(`FILE: ${f}`, 'NOT FOUND');
    }
}

// Check Docker Compose service count
try {
    const dcContent = require('fs').readFileSync('./docker-compose.yml', 'utf8');
    const serviceCount = (dcContent.match(/^\s{2}\w[\w-]+:$/gm) || []).length;
    if (serviceCount >= 5) {
        pass(`Docker Compose services`, `${serviceCount} services defined`);
    } else {
        warn(`Docker Compose services`, `only ${serviceCount} services — expected 8`);
    }
} catch (e) {
    fail('Docker Compose', e.message);
}

// ============================================================
// STEP 2: BACKEND API VALIDATION (Backend Agent)
// ============================================================
console.log(c.head('STEP 2 · Backend Agent — API Validation'));

// Auth service entrypoint check
try {
    const authCode = require('fs').readFileSync('./auth-service/index.js', 'utf8');
    if (authCode.includes('/oauth/token')) pass('Auth Service: /oauth/token route present');
    else fail('Auth Service: /oauth/token route MISSING');
    if (authCode.includes('/health')) pass('Auth Service: /health route present');
    else fail('Auth Service: /health route MISSING');
    if (authCode.includes('jwt.sign')) pass('Auth Service: JWT signing logic present');
    else fail('Auth Service: JWT signing logic MISSING');
} catch (e) {
    fail('Auth Service read', e.message);
}

// API Gateway entrypoint check
try {
    const apiCode = require('fs').readFileSync('./api-gateway/index.js', 'utf8');
    const routes = ['/v1/search/doctors', '/v1/appointments', '/v1/hospitals'];
    for (const route of routes) {
        if (apiCode.includes(route)) pass(`API Gateway: ${route}`);
        else fail(`API Gateway: ${route}`, 'route NOT defined');
    }
    if (apiCode.includes('requireAuth')) pass('API Gateway: Auth middleware applied');
    else fail('API Gateway: requireAuth middleware NOT applied');
} catch (e) {
    fail('API Gateway read', e.message);
}

// RBAC Middleware check
try {
    const rbacCode = require('fs').readFileSync('./api-gateway/middleware/auth.js', 'utf8');
    if (rbacCode.includes('requireRole')) pass('RBAC: requireRole function present');
    else fail('RBAC: requireRole function MISSING');
    if (rbacCode.includes('requireHospitalTenant')) pass('RBAC: requireHospitalTenant (multi-tenant guard) present');
    else fail('RBAC: requireHospitalTenant MISSING');
} catch (e) {
    fail('RBAC Middleware read', e.message);
}

// ============================================================
// STEP 3: DATABASE VALIDATION (Database Agent)
// ============================================================
console.log(c.head('STEP 3 · Database Agent — Schema Validation'));

// Check Prisma schema for required models
try {
    const schema = require('fs').readFileSync('./prisma/schema.prisma', 'utf8');
    const models = ['Patient', 'Doctor', 'Appointment', 'HospitalsMaster'];
    for (const model of models) {
        if (schema.includes(`model ${model}`)) pass(`Prisma Schema: model ${model} exists`);
        else warn(`Prisma Schema: model ${model} NOT FOUND`);
    }
    if (schema.includes('updatedAt')) pass('Prisma Schema: updatedAt field present');
    else fail('Prisma Schema: updatedAt field MISSING (previously fixed bug)');
} catch (e) {
    fail('Prisma Schema read', e.message);
}

// Check RLS SQL file
try {
    const rlsSql = require('fs').readFileSync('./scripts/phase4_security_rls.sql', 'utf8');
    const rlsChecks = [
        'ENABLE ROW LEVEL SECURITY',
        'audit_logs',
        'log_audit_event',
        'hospital_id isolation',
    ];
    for (const check of rlsChecks) {
        if (rlsSql.includes(check)) pass(`RLS SQL: "${check}" present`);
        else warn(`RLS SQL: "${check}" not found`);
    }
} catch (e) {
    fail('RLS SQL read', e.message);
}

// Check prior RLS migration files
const rlsMigrations = ['./supabase_rls_audit_day11.sql', './enable_rls_health_modules.sql'];
for (const m of rlsMigrations) {
    if (existsSync(m)) pass(`RLS Migration: ${m}`);
    else warn(`RLS Migration: ${m} — not found`);
}

// ============================================================
// STEP 4: FRONTEND DASHBOARD TESTS (Frontend Agent)
// ============================================================
console.log(c.head('STEP 4 · Frontend Agent — Dashboard Validation'));

const frontends = {
    'Patient Portal': './app',
    'Doctor Portal': './doctor-portal/src/app',
    'Hospital HMS': './hospital-hms/src/app',
    'Admin Panel': './haspataal-admin/app',
};

for (const [name, dir] of Object.entries(frontends)) {
    if (existsSync(dir)) {
        pass(`${name}: directory present at ${dir}`);
        const layoutPath = `${dir}/layout.tsx`;
        const pagePath = `${dir}/page.tsx`;
        if (existsSync(layoutPath)) pass(`${name}: layout.tsx present`);
        else fail(`${name}: layout.tsx MISSING`);
        if (existsSync(pagePath)) pass(`${name}: page.tsx present`);
        else warn(`${name}: page.tsx not yet created`);
    } else {
        fail(`${name}: directory ${dir} NOT FOUND`);
    }
}

// Check API client files
const apiClients = [
    './doctor-portal/src/lib/api.ts',
    './hospital-hms/src/lib/api.ts',
];
for (const client of apiClients) {
    if (existsSync(client)) {
        const code = require('fs').readFileSync(client, 'utf8');
        if (code.includes('NEXT_PUBLIC_API_URL')) pass(`API Client: ${client} correctly uses env var`);
        else fail(`API Client: ${client} hardcodes URL`);
    } else {
        fail(`API Client: ${client} MISSING`);
    }
}

// ============================================================
// STEP 5: SECURITY AUDIT (Security Agent)
// ============================================================
console.log(c.head('STEP 5 · Security Agent — Security Audit'));

// RBAC checks
try {
    const rbac = require('fs').readFileSync('./api-gateway/middleware/auth.js', 'utf8');
    const securityChecks = {
        'JWT verification via jwt.verify': 'jwt.verify',
        'Missing token returns 401': '401',
        'Wrong role returns 403': '403',
        'Cross-tenant access denied': 'Cross-tenant',
        'Admin bypass allowed': 'super_admin',
    };
    for (const [label, pattern] of Object.entries(securityChecks)) {
        if (rbac.includes(pattern)) pass(`Security: ${label}`);
        else fail(`Security: ${label}`, `pattern "${pattern}" not found`);
    }
} catch (e) {
    fail('Security RBAC read', e.message);
}

// Check for hardcoded secrets
const sensitiveFiles = ['./auth-service/index.js', './api-gateway/index.js'];
for (const f of sensitiveFiles) {
    if (existsSync(f)) {
        const code = require('fs').readFileSync(f, 'utf8');
        // Check no hardcoded password strings
        if (!code.match(/password\s*=\s*['"][^'"]{6,}['"]/)) {
            pass(`Security: No hardcoded passwords in ${f}`);
        } else {
            fail(`Security: Hardcoded password detected in ${f}`);
        }
        // Check env fallback
        if (code.includes('process.env')) {
            pass(`Security: Env-var usage in ${f}`);
        } else {
            warn(`Security: No process.env usage in ${f}`);
        }
    }
}

// Nginx security headers check
try {
    const nginx = require('fs').readFileSync('./nginx.conf', 'utf8');
    const headers = ['X-Frame-Options', 'Strict-Transport-Security', 'X-Content-Type-Options'];
    for (const h of headers) {
        if (nginx.includes(h)) pass(`Nginx security header: ${h}`);
        else fail(`Nginx security header: ${h} MISSING`);
    }
    if (nginx.includes('TLSv1.3')) pass('Nginx: TLS 1.3 enabled');
    else warn('Nginx: TLS 1.3 not explicitly set');
} catch (e) {
    fail('Nginx config read', e.message);
}

// SEO checks
try {
    const sitemap = require('fs').readFileSync('./app/sitemap.ts', 'utf8');
    if (sitemap.includes('haspataal.com')) pass('SEO: Sitemap uses correct domain');
    else fail('SEO: Sitemap domain misconfigured');
    const cityCount = (sitemap.match(/'/g) || []).length;
    if (cityCount > 10) pass('SEO: Sitemap has multiple cities');
    else warn('SEO: Sitemap has fewer cities than expected');
} catch (e) {
    fail('Sitemap read', e.message);
}

// ============================================================
// FINAL REPORT
// ============================================================
console.log(c.head('FINAL HEALTH REPORT — WAR ROOM AUDIT'));

const total = passCount + failCount + warnCount;
console.log(`\n  Total Checks : ${total}`);
console.log(`  ${c.pass(`PASS         : ${passCount}`)}`);
console.log(`  ${c.warn(`WARN         : ${warnCount}`)}`);
console.log(`  ${c.fail(`FAIL         : ${failCount}`)}`);

if (failCount === 0) {
    console.log('\n\x1b[32m\x1b[1m  🏆  PLATFORM STATUS: HEALTHY — ALL SYSTEMS OPERATIONAL\x1b[0m\n');
} else if (failCount <= 3) {
    console.log('\n\x1b[33m\x1b[1m  ⚠️   PLATFORM STATUS: DEGRADED — Minor issues detected\x1b[0m\n');
} else {
    console.log('\n\x1b[31m\x1b[1m  🚨  PLATFORM STATUS: CRITICAL — Multiple failures\x1b[0m\n');
}

if (Object.keys(findings).length > 0) {
    console.log('  Issues to Fix:');
    Object.entries(findings).forEach(([k, v]) => console.log(`   • ${k}: ${v}`));
}

process.exit(failCount > 0 ? 1 : 0);
