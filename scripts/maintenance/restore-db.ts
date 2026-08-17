import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

const logger = pino({ name: 'restore-db', level: 'info' });

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function confirm(message: string): boolean {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(`${message} (yes/no): `, (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  }).then((result) => {
    if (!result) {
      logger.info('Restore cancelled by user');
      process.exit(0);
    }
    return true;
  });
}

function runRestore() {
  const databaseUrl = getEnvVar('DATABASE_URL');
  const backupFile = process.argv[2];

  if (!backupFile) {
    logger.error('Usage: npx tsx scripts/restore-db.ts <backup-file.sql>');
    process.exit(1);
  }

  if (!fs.existsSync(backupFile)) {
    logger.error({ backupFile }, 'Backup file not found');
    process.exit(1);
  }

  const metaFile = `${backupFile}.meta.json`;
  if (fs.existsSync(metaFile)) {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    logger.info({ meta }, 'Backup metadata loaded');
  }

  const stats = fs.statSync(backupFile);
  logger.info(
    { backupFile, size: `${(stats.size / 1024 / 1024).toFixed(2)} MB` },
    'Backup file found',
  );

  if (!process.env.SKIP_CONFIRM) {
    confirm(
      `This will DROP and recreate the database from backup. All current data will be lost. Continue?`,
    );
  }

  logger.info('Stopping application services...');
  try {
    execSync(
      'docker compose stop patient-portal hospital-hms admin-panel api-gateway auth-service escalation-worker',
      {
        stdio: 'pipe',
      },
    );
  } catch {
    logger.warn('Could not stop all services (may not be running)');
  }

  logger.info('Restoring database...');
  try {
    execSync(`psql "${databaseUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`, {
      stdio: 'pipe',
    });
    execSync(`psql "${databaseUrl}" < "${backupFile}"`, { stdio: 'inherit' });
  } catch (error) {
    logger.error({ error }, 'Restore failed');
    process.exit(1);
  }

  logger.info('Running Prisma migrations...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  } catch (error) {
    logger.error({ error }, 'Migration deployment failed');
    process.exit(1);
  }

  logger.info('Restore completed successfully');
  logger.info('Start application services with: docker compose up -d');
}

runRestore();
