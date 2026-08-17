import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

const logger = pino({ name: 'backup-db', level: 'info' });

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runBackup() {
  const databaseUrl = getEnvVar('DATABASE_URL');
  const backupDir = process.env.BACKUP_DIR || 'backups';
  const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
  const filename = `backup-${timestamp()}.sql`;
  const filepath = path.join(backupDir, filename);

  ensureDir(backupDir);

  logger.info(
    { databaseUrl: databaseUrl.replace(/\/\/.*@/, '//***@'), filepath },
    'Starting database backup',
  );

  try {
    execSync(
      `pg_dump "${databaseUrl}" --format=plain --no-owner --no-acl --verbose > "${filepath}"`,
      {
        stdio: 'inherit',
      },
    );
  } catch (error) {
    logger.error({ error }, 'pg_dump failed');
    process.exit(1);
  }

  const stats = fs.statSync(filepath);
  logger.info(
    { filepath, size: `${(stats.size / 1024 / 1024).toFixed(2)} MB` },
    'Backup completed',
  );

  const metadata = {
    timestamp: new Date().toISOString(),
    filepath,
    size: stats.size,
    databaseUrl: databaseUrl.replace(/\/\/.*@/, '//***@'),
    retentionDays,
  };
  fs.writeFileSync(`${filepath}.meta.json`, JSON.stringify(metadata, null, 2));

  const backups = fs
    .readdirSync(backupDir)
    .filter((f) => f.startsWith('backup-') && f.endsWith('.sql'));
  if (backups.length > retentionDays) {
    const sorted = backups.sort().slice(0, backups.length - retentionDays);
    for (const old of sorted) {
      const oldPath = path.join(backupDir, old);
      fs.rmSync(oldPath, { force: true });
      const metaPath = `${oldPath}.meta.json`;
      if (fs.existsSync(metaPath)) fs.rmSync(metaPath, { force: true });
      logger.info({ oldPath }, 'Removed old backup (retention policy)');
    }
  }

  logger.info('Backup completed successfully');
}

runBackup();
