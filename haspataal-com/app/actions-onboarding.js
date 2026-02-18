'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registerHospital(prevState, formData) {
    const rawData = {
        legalName: formData.get('legalName'),
        registrationNumber: formData.get('registrationNumber'),
        city: formData.get('city'),
        icuAvailable: formData.get('icuAvailable') === 'on',
        otCount: parseInt(formData.get('otCount') || '0'),
        adminName: formData.get('adminName'),
        adminMobile: formData.get('adminMobile'),
        adminEmail: formData.get('adminEmail'),
    };

    if (!rawData.legalName || !rawData.registrationNumber || !rawData.adminMobile) {
        return { success: false, message: 'Missing required fields.' };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Hospital
            const hospital = await tx.hospital.create({
                data: {
                    legalName: rawData.legalName,
                    registrationNumber: rawData.registrationNumber,
                    city: rawData.city,
                    verificationStatus: 'pending',
                    accountStatus: 'inactive'
                }
            });

            // 2. Add Facilities
            await tx.hospitalFacilities.create({
                data: {
                    hospitalId: hospital.id,
                    icuAvailable: rawData.icuAvailable,
                    otCount: rawData.otCount
                }
            });

            // 3. Add Primary Admin
            await tx.hospitalAdmin.create({
                data: {
                    hospitalId: hospital.id,
                    fullName: rawData.adminName,
                    mobile: rawData.adminMobile,
                    email: rawData.adminEmail,
                    isPrimary: true,
                    verificationStatus: 'pending'
                }
            });

            return hospital;
        });

        revalidatePath('/admin/hospitals'); // Assuming an admin dashboard exists
        return { success: true, message: `Hospital registered with ID: ${result.id}` };

    } catch (e) {
        console.error('Registration Error:', e);
        if (e.code === 'P2002') {
            return { success: false, message: 'Registration number or Admin mobile/email already exists.' };
        }
        return { success: false, message: 'Registration failed.' };
    }
}
