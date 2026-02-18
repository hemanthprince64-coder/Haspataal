'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

// --- Diagnostic Pricing ---

export async function getHospitalCatalog() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') return { success: false, message: 'Unauthorized' };

        const hospitalId = session.user.hospitalId;

        // Fetch all global tests
        const globalTests = await prisma.diagnosticMasterTest.findMany({
            include: { category: true }
        });

        // Fetch hospital specific pricing
        const hospitalPricing = await prisma.hospitalDiagnosticPricing.findMany({
            where: { hospitalId }
        });

        // Merge data
        const catalog = globalTests.map(test => {
            const pricing = hospitalPricing.find(p => p.testId === test.id);
            return {
                ...test,
                price: pricing?.price || null,
                isAvailable: pricing?.isAvailable ?? false,
                tat: pricing?.tatOverrideHours || test.turnaroundTimeHours,
                pricingId: pricing?.id
            };
        });

        return { success: true, data: catalog };
    } catch (e) {
        console.error('getHospitalCatalog Error:', e);
        return { success: false, message: 'Failed to fetch catalog.' };
    }
}

export async function updateDiagnosticPrice(prevState, formData) {
    const session = await auth();
    if (!session || session.user.role !== 'admin') return { success: false, message: 'Unauthorized' };

    const hospitalId = session.user.hospitalId;
    const testId = formData.get('testId');
    const price = parseFloat(formData.get('price'));
    const isAvailable = formData.get('isAvailable') === 'on';

    try {
        await prisma.hospitalDiagnosticPricing.upsert({
            where: {
                hospitalId_testId: { hospitalId, testId }
            },
            update: {
                price,
                isAvailable
            },
            create: {
                hospitalId,
                testId,
                price,
                isAvailable
            }
        });

        revalidatePath('/dashboard/admin/diagnostics');
        return { success: true, message: 'Price updated successfully.' };
    } catch (e) {
        console.error('updateDiagnosticPrice Error:', e);
        return { success: false, message: 'Failed to update price.' };
    }
}

// --- Order Management ---

export async function getHospitalOrders() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') return { success: false, message: 'Unauthorized' };
        const hospitalId = session.user.hospitalId;

        const orders = await prisma.diagnosticOrder.findMany({
            where: { hospitalId },
            include: {
                patient: true,
                items: {
                    include: { test: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: orders };
    } catch (e) {
        return { success: false, message: 'Failed to fetch orders.' };
    }
}

export async function updateOrderStatus(prevState, formData) {
    const orderId = formData.get('orderId');
    const status = formData.get('status'); // 'completed', 'cancelled', etc.

    try {
        await prisma.diagnosticOrder.update({
            where: { id: orderId },
            data: { orderStatus: status }
        });

        revalidatePath('/dashboard/admin/orders');
        return { success: true, message: `Order marked as ${status}.` };
    } catch (e) {
        return { success: false, message: 'Failed to update order.' };
    }
}

// --- Facilities Management ---

export async function getHospitalFacilities() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') return { success: false, message: 'Unauthorized' };
        const hospitalId = session.user.hospitalId;

        const facilities = await prisma.hospitalFacilities.findUnique({
            where: { hospitalId }
        });
        return { success: true, data: facilities };
    } catch (e) {
        return { success: false, message: 'Failed to fetch facilities.' };
    }
}

export async function updateHospitalFacilities(prevState, formData) {
    const session = await auth();
    if (!session || session.user.role !== 'admin') return { success: false, message: 'Unauthorized' };
    const hospitalId = session.user.hospitalId;

    const data = {
        icuAvailable: formData.get('icuAvailable') === 'on',
        nicuAvailable: formData.get('nicuAvailable') === 'on',
        emergency24x7: formData.get('emergency24x7') === 'on',
        ambulanceAvailable: formData.get('ambulanceAvailable') === 'on',
        pharmacyAvailable: formData.get('pharmacyAvailable') === 'on',
        labAvailable: formData.get('labAvailable') === 'on',
        otCount: parseInt(formData.get('otCount') || '0')
    };

    try {
        await prisma.hospitalFacilities.upsert({
            where: { hospitalId },
            update: data,
            create: { hospitalId, ...data }
        });

        revalidatePath('/dashboard/admin/facilities');
        return { success: true, message: 'Facilities updated successfully.' };

    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to update facilities.' };
    }
}
