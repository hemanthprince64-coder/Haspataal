import { execSync } from 'child_process';
import pino from 'pino';

const logger = pino({ name: 'rollback-deploy', level: 'info' });

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function runRollback() {
  const githubSha = process.env.PREVIOUS_GITHUB_SHA || process.env.GITHUB_SHA;
  const deployHost = getEnvVar('DEPLOY_HOST');
  const deployUser = getEnvVar('DEPLOY_USER');
  const sshKey = getEnvVar('DEPLOY_SSH_KEY');
  const deployDir = getEnvVar('DEPLOY_DIR') || '/opt/haspataal';

  logger.info({ githubSha, deployHost, deployDir }, 'Starting rollback');

  const sshOptions = [
    '-i',
    sshKey,
    '-o',
    'StrictHostKeyChecking=no',
    '-o',
    'UserKnownHostsFile=/dev/null',
  ];

  const sshCmd = (cmd: string) =>
    `ssh ${sshOptions.join(' ')} ${deployUser}@${deployHost} "cd ${deployDir} && ${cmd}"`;

  try {
    logger.info('Stopping services...');
    execSync(sshCmd('docker compose down'), { stdio: 'inherit' });

    logger.info('Reverting to previous image...');
    execSync(sshCmd(`git checkout ${githubSha}`), { stdio: 'inherit' });
    execSync(sshCmd('docker compose pull'), { stdio: 'inherit' });

    logger.info('Starting services...');
    execSync(sshCmd('docker compose up -d --no-build'), { stdio: 'inherit' });

    logger.info('Running smoke tests...');
    execSync(sshCmd('sleep 30 && curl -f http://localhost/api/health'), { stdio: 'inherit' });

    logger.info('Rollback completed successfully');
  } catch (error) {
    logger.error({ error }, 'Rollback failed');
    process.exit(1);
  }
}

runRollback();
