'use server';

import { getSession } from '@haspataal/auth';
import { PlaceClinicalOrderUseCase } from '@haspataal/orders';
import { ClinicalOrderType, OrderPriority } from '@haspataal/types';

import { revalidatePath } from 'next/cache';

export async function placeClinicalOrder(
  encounterId: string,
  patientId: string,
  hospitalId: string,
  type: ClinicalOrderType,
  priority: OrderPriority,
  reason: string,
  payload: any,
) {
  const session = await getSession();

  if (
    !session ||
    !session.user ||
    (session.user.role !== 'DOCTOR' && session.user.role !== 'HOSPITAL_ADMIN')
  ) {
    throw new Error('Unauthorized');
  }

  const result = await PlaceClinicalOrderUseCase.execute({
    encounterId,
    patientId,
    hospitalId,
    doctorId: session.user.role === 'DOCTOR' ? session.user.id : undefined,
    type,
    priority,
    reason,
    payload,
    requestedBy: session.user.id,
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  // Revalidate the consultation page
  revalidatePath('/hospital/dashboard/consultation/[appointmentId]', 'page');

  return { success: true, orderId: result.order?.id };
}
