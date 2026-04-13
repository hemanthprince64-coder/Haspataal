const { z } = require('zod');
require('dotenv').config({ path: '.env' });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters for production"),
  AUTH_SERVICE_PORT: z.string().default('4001'),
  API_GATEWAY_PORT: z.string().default('4002'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

if (require.main === module) {
  validateEnv();
}

module.exports = { validateEnv };
