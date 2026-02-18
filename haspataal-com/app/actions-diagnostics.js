'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch Global Catalog
export async function getDiagnosticCatalog(query = '') {
    try {
        const tests = await prisma.diagnosticMasterTest.findMany({
            where: {
                testName: { contains: query, mode: 'insensitive' }
            },
            take: 20
        });
        return { success: true, data: tests };
    } catch (e) {
        console.error('Fetch Catalog Error:', e);
        return { success: false, message: 'Failed to fetch catalog.' };
    }
}

// Create Order (Doctor/Staff Action)
export async function createDiagnosticOrder(prevState, formData) {
    const hospitalId = formData.get('hospitalId');
    const patientId = formData.get('patientId');
    const doctorId = formData.get('doctorId'); // Optional Prescriber
    const testIds = formData.getAll('testIds'); // Array of IDs

    if (!hospitalId || !patientId || testIds.length === 0) {
        return { success: false, message: 'Missing order details.' };
    }

    try {
        // Calculate total (simplified logic, assumes fetch price first in real app)
        // Here we just fetch prices from HospitalPricing
        const prices = await prisma.hospitalDiagnosticPricing.findMany({
            where: {
                hospitalId,
                testId: { in: testIds }
            }
        });

        let totalAmount = 0;
        const itemsToCreate = testIds.map(testId => {
            const priceRecord = prices.find(p => p.testId === testId);
            const price = priceRecord ? Number(priceRecord.price) : 0;
            totalAmount += price;
            return {
                testId,
                priceAtOrder: price,
                status: 'pending'
            };
        });

        const order = await prisma.diagnosticOrder.create({
            data: {
                hospitalId,
                patientId,
                doctorId: doctorId || null,
                orderStatus: 'ordered',
                totalAmount,
                items: {
                    create: itemsToCreate
                }
            }
        });

        revalidatePath(`/hospital/${hospitalId}/diagnostics`);
        return { success: true, message: `Order created: ${order.id}` };

    } catch (e) {
        console.error('Create Order Error:', e);
        return { success: false, message: 'Failed to create order.' };
    }
}

// Fetch Patient Orders
export async function getPatientOrders(patientId) {
    try {
        const orders = await prisma.diagnosticOrder.findMany({
            where: { patientId },
            include: {
                hospital: { select: { displayName: true } },
                items: {
                    include: { test: { select: { testName: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: orders };
    } catch (e) {
        return { success: false, message: 'Failed to fetch orders.' };
    }
}
