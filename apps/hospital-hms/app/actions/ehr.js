/* eslint-disable */
'use server';

import { requirePermission, Permission } from '@haspataal/auth';

import { revalidatePath } from 'next/cache';

import { logAction } from '@/lib/audit';
import prisma from '@/lib/prisma';

export async function createHealthRecord(formData) {
  let user;
  try {
    user = await requirePermission(Permission.EMR_EDIT);
  } catch (e) {
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
        doctorId: user.id,
        diagnosis,
        prescription,
        notes,
        vitals: {
          bp,
          sugar,
          temperature,
          weight,
        },
      },
    });

    const radiologyModality = formData.get('radiologyModality');
    const radiologyReason = formData.get('radiologyReason');

    if (radiologyModality) {
      try {
        const { PlaceRadiologyOrderUseCase } = await import('@haspataal/radiology');
        await PlaceRadiologyOrderUseCase.execute({
          encounterId: record.id,
          patientId: patientId,
          hospitalId: user.hospitalId,
          doctorId: user.id,
          modality: radiologyModality,
          reason: radiologyReason || undefined,
          requestedBy: user.id,
        });
      } catch (err) {
        // console.error('Failed to place radiology order', err);
      }
    }

    // Log the action
    await logAction(user.id, 'CREATE_EHR', 'PatientRecord', record.id, { patientId });

    revalidatePath(`/dashboard/doctor`);
    return { success: true, message: 'Health Record saved successfully!' };
  } catch (e) {
    // console.error('EHR Error', e);
    return { message: 'Failed to save record.' };
  }
}
