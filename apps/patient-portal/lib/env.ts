import { z } from 'zod';

/**
 * Global Environment Schema
 * Documented in .env.example
 */
const envSchema = z.object({
  // --- Database ---
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid PostgreSQL connection string").optional(),

  // --- Auth ---
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters for security"),

  // --- API & Services ---
  NEXT_PUBLIC_API_URL: z.string().url("NEXT_PUBLIC_API_URL must be a valid URL"),
  NEXT_PUBLIC_AUTH_URL: z.string().url("NEXT_PUBLIC_AUTH_URL must be a valid URL"),

  // --- Supabase (Optional) ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // --- Cache & Infrastructure ---
  REDIS_URL: z.string().url("REDIS_URL must be a valid redis:// connection string"),
  ENCRYPTION_KEY: z.string().length(32, "ENCRYPTION_KEY must be exactly 32 characters"),

  // --- Service Ports ---
  AUTH_SERVICE_PORT: z.string().regex(/^\d+$/).default("4001"),
  API_GATEWAY_PORT: z.string().regex(/^\d+$/).default("4002"),

  // --- Logging & Env ---
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // --- Docker Specific ---
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_DB: z.string().default("haspataal"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates the entire environment and exports the result.
 * Use this 'env' object throughout the application instead of process.env.
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("\n❌ ENVIRONMENT VALIDATION FAILED:");
    parsed.error.flatten().fieldErrors;
    
    Object.entries(parsed.error.flatten().fieldErrors).forEach(([field, errors]) => {
      console.error(`   - ${field}: ${errors?.join(", ")}`);
    });
    
    console.error("\n💡 Please check your .env.local file against .env.example\n");
    
    throw new Error("Missing or invalid required environment variables.");
  }

  return parsed.data;
}

export const env = validateEnv();
