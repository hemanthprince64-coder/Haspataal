import { PrismaClient } from '@prisma/client';

/**
 * Prisma Singleton (L1 Fix)
 * Prevents multiple PrismaClient instances from being created,
 * which would exhaust the connection pool under load.
 *
 * All infrastructure files should import from this module instead of
 * instantiating their own PrismaClient.
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
