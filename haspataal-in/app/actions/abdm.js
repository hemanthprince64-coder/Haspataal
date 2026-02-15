'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { verifyAbha } from "@/lib/abdm";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";

export async function linkAbhaAction(formData) {
    const session = await auth();
    if (!session || !session.user) return { message: 'Unauthorized' };

    const abhaAddress = formData.get('abhaAddress');
    if (!abhaAddress) return { message: 'ABHA Address is required' };

    // 1. Verify with ABDM (Mock/Sandbox)
    const verification = await verifyAbha(abhaAddress);

    if (!verification.verified) {
        return { message: verification.message || 'ABHA Verification Failed' };
    }

    try {
        // 2. Link to Patient Profile
        await prisma.patient.update({
            where: { id: session.user.id },
            data: { abhaAddress: verification.abha }
        });

        // 3. Log it
        await logAction(session.user.id, 'LINK_ABHA', 'Patient', session.user.id, { abha: verification.abha });

        revalidatePath('/profile');
        return { success: true, message: 'ABHA Linked Successfully!' };
    } catch (e) {
        console.error("Link ABHA Error", e);
        if (e.code === 'P2002') return { message: 'This ABHA is already linked to another account.' };
        return { message: 'Failed to link ABHA.' };
    }
}
