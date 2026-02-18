'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReview(prevState, formData) {
    const patientId = formData.get('patientId');
    const doctorId = formData.get('doctorId');
    const hospitalId = formData.get('hospitalId');
    const rating = parseInt(formData.get('rating'));
    const comment = formData.get('comment');

    if (!patientId || !rating) {
        return { success: false, message: 'Patient ID and Rating are required.' };
    }

    if (!doctorId && !hospitalId) {
        return { success: false, message: 'Must review either a Doctor or a Hospital.' };
    }

    try {
        await prisma.review.create({
            data: {
                patientId,
                doctorId: doctorId || null,
                hospitalId: hospitalId || null,
                rating,
                comment
            }
        });

        if (doctorId) revalidatePath(`/doctor/${doctorId}`);
        if (hospitalId) revalidatePath(`/hospital/${hospitalId}`);

        return { success: true, message: 'Review submitted successfully.' };

    } catch (e) {
        console.error('Submit Review Error:', e);
        return { success: false, message: 'Failed to submit review.' };
    }
}

export async function getDoctorReviews(doctorId) {
    try {
        const reviews = await prisma.review.findMany({
            where: { doctorId },
            include: { patient: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: reviews };
    } catch (e) {
        return { success: false, data: [] };
    }
}

export async function getHospitalReviews(hospitalId) {
    try {
        const reviews = await prisma.review.findMany({
            where: { hospitalId },
            include: { patient: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: reviews };
    } catch (e) {
        return { success: false, data: [] };
    }
}
