const { execSync } = require('child_process');
const path = require('path');

// 1. Run prepare-schema first to ensure the SQLite schema is generated if active
require('./prepare-schema');

const provider = process.env.DATABASE_PROVIDER || 'postgres';

// 2. Determine which schema file to use
let schemaPath = path.join('packages', 'db', 'prisma', 'schema.prisma');
if (provider === 'sqlite') {
  schemaPath = path.join('packages', 'db', 'prisma', 'schema.sqlite.prisma');
}

// 3. Collect command arguments passed to this wrapper
const args = process.argv.slice(2);

// Check if --schema is already specified in args. If not, append ours.
const hasSchema = args.some(arg => arg.startsWith('--schema'));
if (!hasSchema) {
  args.push(`--schema=${schemaPath}`);
}

const cmd = `npx prisma ${args.join(' ')}`;
console.log(`[prisma-cmd] Running: ${cmd}`);

try {
  execSync(cmd, { stdio: 'inherit', env: process.env });
} catch (error) {
  // Child process errors will already have printed to stderr due to { stdio: 'inherit' }
  process.exit(1);
}
