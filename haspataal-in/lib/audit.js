import prisma from "@/lib/prisma";

export async function logAction(userId, action, entity, entityId, details = {}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details
            }
        });
    } catch (error) {
        console.error("Failed to log audit:", error);
        // We generally shouldn't throw here to avoid blocking the main action
    }
}
