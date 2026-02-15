'use server';

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/audit";
import { ROLES } from "@/lib/permissions";

export async function createHealthRecord(formData) {
    const session = await auth();
    if (!session || session.user.role !== ROLES.DOCTOR) {
        return { message: 'Unauthorized' };
    }

    const patientId = formData.get('patientId');
    const diagnosis = formData.get('diagnosis');
    const prescription = formData.get('prescription');
    const notes = formData.get('notes');

    // Vitals
    const bp = formData.get('bp');
    const sugar = formData.get('sugar');
    const temperature = formData.get('temperature');
    const weight = formData.get('weight');

    if (!patientId || !diagnosis) {
        return { message: 'Patient and Diagnosis are required.' };
    }

    try {
        const record = await prisma.patientRecord.create({
            data: {
                patientId,
                doctorId: session.user.id,
                diagnosis,
                prescription,
                notes,
                vitals: {
                    bp,
                    sugar,
                    temperature,
                    weight
                }
            }
        });

        // Log the action
        await logAction(session.user.id, 'CREATE_EHR', 'PatientRecord', record.id, { patientId });

        revalidatePath(`/dashboard/doctor`);
        return { success: true, message: 'Health Record saved successfully!' };
    } catch (e) {
        console.error("EHR Error", e);
        return { message: 'Failed to save record.' };
    }
}
