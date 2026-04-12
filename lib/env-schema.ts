import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32, "Secret must be at least 32 characters for security"),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379"),
  GEMINI_API_KEY: z.string().optional(),
  
  // Service Ports
  AUTH_SERVICE_PORT: z.string().default("4001"),
  API_GATEWAY_PORT: z.string().default("4002"),
  
  // External Providers
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.flatten().fieldErrors);
      process.exit(1);
    }
    throw error;
  }
}

export type Env = z.infer<typeof envSchema>;
