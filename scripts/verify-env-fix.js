const { z } = require('zod');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local from root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const envSchema = z.object({
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
});

try {
    const validatedEnv = envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    console.log('✅ Environment variables validated successfully!');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', validatedEnv.NEXT_PUBLIC_SUPABASE_URL);
} catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
        console.error(error.errors);
    } else {
        console.error(error);
    }
    process.exit(1);
}
