const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const container = await new PostgreSqlContainer('postgres:16').start();
  const dbUrl = container.getConnectionUri();
  console.log('Started PG at', dbUrl);

  execSync(
    'npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate --force-reset --accept-data-loss',
    {
      env: { ...process.env, DATABASE_URL: dbUrl, DIRECT_URL: dbUrl },
      stdio: 'inherit',
    },
  );

  execSync(
    `npx prisma db execute --url="${dbUrl}" --file="scripts/migrations/10_add_outbox_canonical_columns.sql"`,
    { stdio: 'inherit' },
  );
  execSync(
    `npx prisma db execute --url="${dbUrl}" --file="scripts/migrations/11_phase0b_idempotency_dlq.sql"`,
    { stdio: 'inherit' },
  );

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

  try {
    const res = await prisma.$queryRaw`SELECT delivery_status FROM outbox_events LIMIT 1`;
    console.log('Success!', res);
  } catch (e) {
    console.error('Error:', e);
  }

  await prisma.$disconnect();
  await container.stop();
}

main().catch(console.error);
