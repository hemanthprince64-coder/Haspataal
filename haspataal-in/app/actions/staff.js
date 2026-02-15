'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStaff(prevState, formData) {
    const name = formData.get('name');
    const mobile = formData.get('mobile');
    const hospitalId = formData.get('hospitalId');
    const role = formData.get('role') || 'STAFF'; // Can be DOCTOR if we reuse this form? No, keeps logic separate.

    if (!name || !mobile || !hospitalId) {
        return { message: 'Missing fields' };
    }

    try {
        await prisma.staff.create({
            data: {
                name,
                mobile,
                password: mobile, // Default password
                hospitalId,
                role: role // 'STAFF'
            }
        });
        revalidatePath('/dashboard/staff');
        return { message: 'Staff created successfully!' };
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create staff. Mobile might be duplicate.' };
    }
}
