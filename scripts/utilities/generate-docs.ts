import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

const logger = pino({ name: 'generate-docs', level: 'info' });

function runCommand(cmd: string, description: string) {
  try {
    logger.info({ description }, 'Running');
    execSync(cmd, { stdio: 'inherit' });
    logger.info({ description }, 'Completed');
  } catch (error) {
    logger.error({ error, description }, 'Failed');
  }
}

function findRouteFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('route.ts') || entry.name.endsWith('route.js'))
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

function generateApiDocs() {
  logger.info('Generating API documentation...');
  const apiRoutes: string[] = [];

  const apiDirs = [
    'apps/patient-portal/app/api',
    'apps/hospital-hms/app/api',
    'services/gateway/src',
    'services/auth/src',
  ];

  for (const dir of apiDirs) {
    const files = findRouteFiles(dir);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const methods: string[] = [];
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH')) methods.push('PATCH');

      if (methods.length > 0) {
        apiRoutes.push(`- ${methods.join(', ')} ${file.replace(/\\/g, '/')}`);
      }
    }
  }

  const apiDoc = `# Haspataal API Reference\n\nGenerated: ${new Date().toISOString()}\n\n## Endpoints\n\n${apiRoutes.sort().join('\n')}\n`;
  fs.writeFileSync('docs/api-reference.md', apiDoc);
  logger.info('API documentation generated at docs/api-reference.md');
}

function generateUserManuals() {
  logger.info('Generating user manuals...');

  const adminManual = `# Haspataal Admin Manual\n\n## Overview\nThis manual is for Super Admins managing the Haspataal platform.\n\n## Responsibilities\n- Approve hospital onboarding requests\n- Verify doctor credentials\n- Manage platform-wide settings\n- Review audit logs and compliance reports\n- Handle escalation alerts\n\n## Key Workflows\n\n### Hospital Approval\n1. Log in to Admin Panel\n2. Navigate to Hospitals → Pending\n3. Review uploaded documents\n4. Click Approve\n5. Set commission percentage and payout cycle\n\n### Doctor Verification\n1. Navigate to Doctors → Pending\n2. Verify medical registration number\n3. Approve or reject\n\n### Billing Configuration\n1. Navigate to Billing → Profiles\n2. Set GST applicability\n3. Configure payment gateways\n4. Set invoice layout\n\n## Security\n- Use strong passwords\n- Enable 2FA if available\n- Review audit logs weekly\n- Never share credentials\n`;

  const doctorManual = `# Haspataal Doctor Manual\n\n## Overview\nThis manual is for doctors using Haspataal HMS.\n\n## Responsibilities\n- Manage appointments\n- Conduct consultations\n- Write prescriptions\n- Review lab results\n- Update patient records\n\n## Key Workflows\n\n### Appointment Management\n1. View today's appointments\n2. Start consultation\n3. Add diagnosis and notes\n4. Prescribe medicines or order tests\n5. Complete consultation\n\n### Prescription\n1. Select patient\n2. Add medicine, dosage, duration\n3. Submit prescription\n4. Patient can view and print\n\n### Lab Results\n1. Navigate to Lab Results\n2. Review incoming results\n3. Add interpretation\n4. Mark as reviewed\n`;

  const nurseManual = `# Haspataal Nurse Manual\n\n## Overview\nThis manual is for nurses using Haspataal HMS.\n\n## Responsibilities\n- Manage IPD admissions\n- Administer medications\n- Update vitals\n- Coordinate with doctors\n- Handle discharge process\n\n## Key Workflows\n\n### IPD Admission\n1. Search patient\n2. Select ward and bed\n3. Complete admission form\n4. Assign doctor\n\n### Medication Administration\n1. View medication schedule\n2. Record administration\n3. Document any adverse reactions\n\n### Discharge\n1. Verify discharge summary\n2. Ensure all bills are settled\n3. Update bed status\n4. Hand over to family\n`;

  const receptionManual = `# Haspataal Reception Manual\n\n## Overview\nThis manual is for reception staff using Haspataal HMS.\n\n## Responsibilities\n- Book appointments\n- Register patients\n- Handle billing inquiries\n- Manage queue\n- Process payments\n\n## Key Workflows\n\n### Patient Registration\n1. Click New Patient\n2. Enter demographics\n3. Select insurance if applicable\n4. Save record\n\n### Appointment Booking\n1. Select doctor and specialty\n2. Choose date and time\n3. Enter patient details\n4. Confirm booking\n5. Send confirmation (WhatsApp/SMS)\n\n### Payment Collection\n1. Navigate to Billing\n2. Select invoice\n3. Choose payment method\n4. Record payment\n5. Print receipt\n`;

  fs.mkdirSync('docs/manuals', { recursive: true });
  fs.writeFileSync('docs/manuals/admin.md', adminManual);
  fs.writeFileSync('docs/manuals/doctor.md', doctorManual);
  fs.writeFileSync('docs/manuals/nurse.md', nurseManual);
  fs.writeFileSync('docs/manuals/reception.md', receptionManual);

  logger.info('User manuals generated at docs/manuals/');
}

function generateOperationsRunbook() {
  logger.info('Generating operations runbook...');

  const runbook = `# Haspataal Operations Runbook\n\n## Overview\nThis runbook provides step-by-step procedures for operations staff.\n\n## Table of Contents\n1. [Daily Checks](#daily-checks)\n2. [Backup Verification](#backup-verification)\n3. [Incident Response](#incident-response)\n4. [Common Issues](#common-issues)\n\n## Daily Checks\n\n### Health Check\n\`\`\`bash\ncurl -f https://haspataal.in/api/health\n\`\`\`\n\nExpected: 200 OK\n\n### Database Connectivity\n\`\`\`bash\ncurl -f https://haspataal.in/api/health/db\n\`\`\`\n\n### Redis Connectivity\n\`\`\`bash\ncurl -f https://haspataal.in/api/health/redis\n\`\`\`\n\n### Error Rate\nCheck Grafana dashboard for error rate > 1%.\n\n## Backup Verification\n\n### Verify Backup Completed\n\`\`\`bash\nls -lh backups/\n\`\`\`\n\n### Test Restore (Weekly)\n\`\`\`bash\nnpx tsx scripts/restore-db.ts backups/backup-latest.sql\n\`\`\`\n\n## Incident Response\n\n### High Error Rate\n1. Check Grafana dashboard\n2. Check application logs: \`docker logs patient-portal --tail 100\`\n3. Check database connections\n4. Restart affected service if needed\n\n### Database Down\n1. Check PostgreSQL status\n2. If using Supabase, check dashboard\n3. Promote read replica if available\n4. Update connection string if needed\n\n### Redis Down\n1. BullMQ queues will stall\n2. Outbox will accumulate events\n3. Restart Redis service\n4. Verify workers resume\n\n## Common Issues\n\n### Patient Portal Not Loading\n1. Check Nginx status\n2. Check Next.js build\n3. Check environment variables\n4. Restart container\n\n### Appointment Not Confirming\n1. Check Redis lock status\n2. Verify doctor availability\n3. Check payment status\n4. Review audit log\n\n### SMS/WhatsApp Not Sending\n1. Check notification worker logs\n2. Verify API credentials\n3. Check message queue depth\n4. Test with manual trigger\n`;

  fs.writeFileSync('docs/runbook.md', runbook);
  logger.info('Operations runbook generated at docs/runbook.md');
}

generateApiDocs();
generateUserManuals();
generateOperationsRunbook();

logger.info('Documentation generation complete');
