import { PrismaClient, Prisma } from '@prisma/client'

/**
 * PRISMA PERFORMANCE & BUILD STABILITY NOTE:
 * If encountering 'Too many connections' or 'Connection Refused' during 'next build':
 * 1. append '?connection_limit=10' to DATABASE_URL in .env.
 * 2. If using Supabase Pooler (Port 6543), append '&pgbouncer=true'.
 */

// Models that use soft-delete (medical records — never hard-delete)
const SOFT_DELETE_MODELS = [
    'Appointment',
    'DiagnosticOrder',
    'Visit',
    'MedicalRecord',
    'PatientRecord',
];

// Extend PrismaClient type with custom helpers
export interface ExtendedPrismaClient extends PrismaClient {
    withAuth: (
        session: any,
        callback: (tx: Prisma.TransactionClient) => Promise<any>
    ) => Promise<any>;
}

const prismaClientSingleton = (): ExtendedPrismaClient => {
    const client = new PrismaClient() as unknown as ExtendedPrismaClient;

    // RLS Session Helper: ensures absolute database-level isolation
    // Use this wrapper for any query requiring multi-tenant security
    client.withAuth = async (session, callback) => {
        return client.$transaction(async (tx) => {
            if (session && session.user) {
                const claims = JSON.stringify({
                    role: session.user.role,
                    id: session.user.id,
                    hospitalId: session.user.hospitalId || null
                });
                // Set the session context for Postgres RLS policies
                await tx.$executeRawUnsafe(`SET LOCAL request.jwt.claims = '${claims.replace(/'/g, "''")}'`);
            }
            return callback(tx);
        });
    };

    // Middleware: intercept delete → soft-delete
    (client as any).$use(async (params: any, next: (params: any) => Promise<any>) => {
        if (SOFT_DELETE_MODELS.includes(params.model)) {
            // Convert delete to update with deletedAt
            if (params.action === 'delete') {
                params.action = 'update';
                params.args.data = { deletedAt: new Date() };
            }
            if (params.action === 'deleteMany') {
                params.action = 'updateMany';
                if (params.args.data) {
                    params.args.data.deletedAt = new Date();
                } else {
                    params.args.data = { deletedAt: new Date() };
                }
            }

            // Auto-filter soft-deleted rows from reads.
            // `findUnique` only accepts unique fields, so convert it to `findFirst`
            // before injecting the soft-delete predicate.
            if (params.action === 'findUnique') {
                params.action = 'findFirst';
            }
            if (params.action === 'findUniqueOrThrow') {
                params.action = 'findFirstOrThrow';
            }

            if (['findFirst', 'findFirstOrThrow', 'findMany', 'count'].includes(params.action)) {
                if (!params.args) params.args = {};
                if (params.args.where) {
                    if (params.args.where.deletedAt === undefined) {
                        params.args.where.deletedAt = null;
                    }
                } else {
                    params.args.where = { deletedAt: null };
                }
            }
        }
        return next(params);
    });

    return client;
}

declare global {
    var _prisma: ExtendedPrismaClient | undefined;
}

const prisma = globalThis._prisma || prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis._prisma = prisma
