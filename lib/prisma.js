import { PrismaClient } from '@prisma/client'

// Models that use soft-delete (medical records — never hard-delete)
const SOFT_DELETE_MODELS = [
    'Appointment',
    'DiagnosticOrder',
    'Visit',
    'MedicalRecord',
    'PatientRecord',
];

const prismaClientSingleton = () => {
    const client = new PrismaClient();

    // Middleware: intercept delete → soft-delete
    client.$use(async (params, next) => {
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

            // Auto-filter soft-deleted rows from reads
            if (['findFirst', 'findMany', 'findUnique', 'count'].includes(params.action)) {
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

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma || prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
