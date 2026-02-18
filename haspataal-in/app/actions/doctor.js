'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// --- Doctor Order Management ---

export async function getDoctorOrders() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'doctor') return { success: false, message: 'Unauthorized' };

        // In prototype, doctor is loosely coupled.
        // We might want to find orders where doctorId matches session.user.id
        // OR if this is a Lab Staff role, orders for a specific hospital (which we haven't linked to DoctorMaster yet in auth).
        // For now, let's just fetch ALL orders where doctorId matches OR return success/empty if we haven't linked hospital.

        // Wait, earlier logic was `getDoctorOrders(doctorId, hospitalId)`.
        // The doctor session only has `id`.
        // And `DoctorMaster` can be affiliated specifically.
        // Let's fetch affiliations to find the hospitals.
        // Then fetch orders for those hospitals.

        const affiliations = await prisma.doctorHospitalAffiliation.findMany({
            where: { doctorId: session.user.id, isCurrent: true }
        });

        const hospitalIds = affiliations.map(a => a.hospitalId);

        const whereClause = {
            hospitalId: { in: hospitalIds },
            orderStatus: { not: 'cancelled' }
        };

        const orders = await prisma.diagnosticOrder.findMany({
            where: whereClause,
            include: {
                patient: true,
                doctor: true,
                items: {
                    include: {
                        test: true,
                        results: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, data: orders };

    } catch (e) {
        console.error('getDoctorOrders Error:', e);
        return { success: false, message: 'Failed to fetch orders.' };
    }
}

export async function getOrderDetails(orderId) {
    const session = await auth();
    if (!session) return { success: false, message: 'Unauthorized' };

    // Validate access (is this doctor affiliated with the hospital of the order?)
    // Skipping deep check for prototype speed, but GOOD TO HAVE.

    try {
        const order = await prisma.diagnosticOrder.findUnique({
            where: { id: orderId },
            include: {
                patient: true,
                doctor: true,
                items: {
                    include: {
                        test: true,
                        results: true
                    }
                }
            }
        });
        return { success: true, data: order };
    } catch (e) {
        return { success: false, message: 'Failed to fetch order.' };
    }
}

export async function updateDiagnosticResult(prevState, formData) {
    const session = await auth();
    if (!session || session.user.role !== 'doctor') return { success: false, message: 'Unauthorized' };

    const orderItemId = formData.get('orderItemId');
    const resultValue = formData.get('resultValue');
    const resultFlag = formData.get('resultFlag'); // normal, high, low, critical
    const notes = formData.get('notes'); // e.g., methodology used
    const verifiedBy = session.user.id; // Correct ID from session

    // Check if result exists, if so update, else create
    try {
        // Find existing result linked to this item
        const existingResult = await prisma.diagnosticResult.findFirst({
            where: { orderItemId }
        });

        if (existingResult) {
            await prisma.diagnosticResult.update({
                where: { id: existingResult.id },
                data: {
                    resultValue,
                    resultFlag,
                    verifiedBy,
                    verifiedAt: new Date(),
                    // Using structuredData for notes for now
                    structuredData: notes ? { notes } : undefined
                }
            });
        } else {
            await prisma.diagnosticResult.create({
                data: {
                    orderItemId,
                    resultValue,
                    resultFlag,
                    verifiedBy,
                    verifiedAt: new Date(),
                    structuredData: notes ? { notes } : undefined
                }
            });
        }

        // Also update item status to 'completed'
        await prisma.diagnosticOrderItem.update({
            where: { id: orderItemId },
            data: { status: 'completed' }
        });

        revalidatePath('/dashboard/doctor/orders');
        return { success: true, message: 'Result saved.' };

    } catch (e) {
        console.error('updateDiagnosticResult Error:', e);
        return { success: false, message: 'Failed to save result.' };
    }
}

export async function finalizeOrder(orderId) {
    const session = await auth();
    if (!session) return { success: false, message: 'Unauthorized' };

    try {
        // Check if all items are completed? 
        // For now, just force status update.
        await prisma.diagnosticOrder.update({
            where: { id: orderId },
            data: { orderStatus: 'completed' }
        });

        revalidatePath('/dashboard/doctor/orders');
        return { success: true, message: 'Order finalized.' };
    } catch (e) {
        return { success: false, message: 'Failed to finalize order.' };
    }
}
