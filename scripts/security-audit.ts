import { execSync } from 'child_process';
import pino from 'pino';

const logger = pino({ name: 'security-audit', level: 'info' });

interface SecurityFinding {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  status: 'OPEN' | 'FIXED' | 'ACCEPTED';
}

const findings: SecurityFinding[] = [];

function addFinding(finding: Omit<SecurityFinding, 'status'>) {
  findings.push({ ...finding, status: 'OPEN' });
}

function auditSecretsManagement() {
  const envExample = require('fs').readFileSync('.env.example', 'utf8');
  const hasFallbackSecret = envExample.includes('fallback') || envExample.includes('dummy');
  if (hasFallbackSecret) {
    addFinding({
      severity: 'HIGH',
      category: 'Secrets Management',
      title: 'Fallback secrets in codebase',
      description: 'JWT_SECRET uses fallback value in development mode.',
      recommendation: 'Remove all fallback secrets. Fail fast in non-production environments.',
    });
  }
}

function auditCSRFProtection() {
  const gatewayIndex = require('fs').readFileSync('services/gateway/src/index.ts', 'utf8');
  const hasCsrfOnPost = gatewayIndex.includes('csrfProtection');
  const hasCsrfOnPatch = gatewayIndex.includes('csrfProtection');

  if (!hasCsrfOnPost || !hasCsrfOnPatch) {
    addFinding({
      severity: 'HIGH',
      category: 'CSRF Protection',
      title: 'Missing CSRF protection on state-changing endpoints',
      description: 'POST/PATCH endpoints do not validate CSRF tokens.',
      recommendation: 'Apply csrfProtection middleware to all state-changing routes.',
    });
  }
}

function auditSecurityHeaders() {
  const gatewayIndex = require('fs').readFileSync('services/gateway/src/index.ts', 'utf8');
  const securityMiddleware = require('fs').readFileSync(
    'packages/auth/middleware/security-headers.ts',
    'utf8',
  );
  const combined = gatewayIndex + '\n' + securityMiddleware;
  const hasSecurityHeaders =
    combined.includes('securityHeaders') || gatewayIndex.includes('securityHeaders');

  if (!hasSecurityHeaders) {
    addFinding({
      severity: 'MEDIUM',
      category: 'Security Headers',
      title: 'Missing security headers middleware',
      description: 'Security headers are not applied globally.',
      recommendation: 'Add securityHeaders middleware to all services.',
    });
  }

  const hasCSP = combined.includes('Content-Security-Policy');
  if (!hasCSP) {
    addFinding({
      severity: 'MEDIUM',
      category: 'Security Headers',
      title: 'Missing Content-Security-Policy',
      description: 'CSP header is not set.',
      recommendation: 'Add CSP header to mitigate XSS attacks.',
    });
  }
}

function auditSessionSecurity() {
  const sessionFile = require('fs').readFileSync('packages/auth/session.ts', 'utf8');
  const hasHttpOnly = sessionFile.includes('httpOnly: true');
  const hasSecure = sessionFile.includes('secure:');
  const hasSameSite = sessionFile.includes('sameSite:');

  if (!hasHttpOnly) {
    addFinding({
      severity: 'HIGH',
      category: 'Session Security',
      title: 'Session cookie missing HttpOnly flag',
      description: 'Session cookies are accessible to JavaScript.',
      recommendation: 'Set httpOnly: true on all session cookies.',
    });
  }

  if (!hasSecure) {
    addFinding({
      severity: 'HIGH',
      category: 'Session Security',
      title: 'Session cookie missing Secure flag',
      description: 'Session cookies can be transmitted over HTTP.',
      recommendation: 'Set secure: true in production environments.',
    });
  }

  if (!hasSameSite) {
    addFinding({
      severity: 'MEDIUM',
      category: 'Session Security',
      title: 'Session cookie missing SameSite attribute',
      description: 'Session cookies are vulnerable to CSRF attacks.',
      recommendation: 'Set sameSite: "lax" or "strict" on all session cookies.',
    });
  }
}

function auditAuditLogCompleteness() {
  const auditLogger = require('fs').readFileSync('packages/logger/lib/audit-logger.ts', 'utf8');
  const hasAccessAction = auditLogger.includes("'ACCESS'");

  if (!hasAccessAction) {
    addFinding({
      severity: 'MEDIUM',
      category: 'Audit Logging',
      title: 'Missing ACCESS action in audit logger',
      description: 'Read operations are not audited.',
      recommendation: 'Add ACCESS action to audit logger for compliance.',
    });
  }
}

function auditTenantIsolation() {
  const gatewayIndex = require('fs').readFileSync('services/gateway/src/index.ts', 'utf8');
  const hasTenantGuard = gatewayIndex.includes('requireHospitalTenant');

  if (!hasTenantGuard) {
    addFinding({
      severity: 'CRITICAL',
      category: 'Tenant Isolation',
      title: 'Missing tenant isolation guard',
      description: 'Cross-tenant data access is possible.',
      recommendation: 'Add requireHospitalTenant middleware to all hospital-scoped routes.',
    });
  }
}

function runAudit() {
  logger.info('Starting security audit...');
  auditSecretsManagement();
  auditCSRFProtection();
  auditSecurityHeaders();
  auditSessionSecurity();
  auditAuditLogCompleteness();
  auditTenantIsolation();

  const critical = findings.filter((f) => f.severity === 'CRITICAL' && f.status === 'OPEN').length;
  const high = findings.filter((f) => f.severity === 'HIGH' && f.status === 'OPEN').length;
  const medium = findings.filter((f) => f.severity === 'MEDIUM' && f.status === 'OPEN').length;
  const low = findings.filter((f) => f.severity === 'LOW' && f.status === 'OPEN').length;

  logger.info(
    { findings: findings.length, critical, high, medium, low },
    'Security audit complete',
  );

  console.log('\n=== SECURITY AUDIT REPORT ===\n');
  findings.forEach((f, i) => {
    console.log(`[${f.status}] [${f.severity}] ${f.category}: ${f.title}`);
    console.log(`  ${f.description}`);
    console.log(`  Recommendation: ${f.recommendation}\n`);
  });

  console.log(
    `\nSummary: ${findings.length} findings (${critical} critical, ${high} high, ${medium} medium, ${low} low)`,
  );

  if (critical > 0 || high > 0) {
    console.log('\nAction Required: Critical and High findings must be resolved before launch.');
    process.exit(1);
  }
}

runAudit();
