'use server';

import { prisma } from '@haspataal/db';
import {
  ProcessPharmacyOrderUseCase,
  VerifyPharmacyOrderUseCase,
  DispenseMedicationUseCase,
  CancelPharmacyOrderUseCase,
} from '@haspataal/pharmacy';
import { getTimelinePublisher } from '@haspataal/timeline';

import { revalidatePath } from 'next/cache';

// We mock requireHospitalStaff for now since it's likely returning a mock user for the MVP,
// as seen in the radiology action.
const getMockUser = () => ({
  id: 'usr_mock_pharmacist',
  name: 'Mock Pharmacist',
  role: 'PHARMACIST',
  hospitalId: 'hosp_test',
});

export async function processPharmacyOrder(data: { clinicalOrderId: string }) {
  const user = getMockUser();
  const useCase = new ProcessPharmacyOrderUseCase(prisma);

  const result = await useCase.execute({
    clinicalOrderId: data.clinicalOrderId,
    actor: { id: user.id, name: user.name, role: user.role },
  });

  revalidatePath('/pharmacy');
  return result;
}

export async function verifyPharmacyOrder(data: { executionId: string; expectedVersion: number }) {
  const user = getMockUser();
  const useCase = new VerifyPharmacyOrderUseCase(prisma, getTimelinePublisher());

  const result = await useCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    actor: { id: user.id, name: user.name, role: user.role },
  });

  revalidatePath('/pharmacy');
  revalidatePath(`/pharmacy/${data.executionId}`);
  return result;
}

export async function dispenseMedication(data: {
  executionId: string;
  items: any[];
  expectedVersion: number;
}) {
  const user = getMockUser();
  const useCase = new DispenseMedicationUseCase(prisma, getTimelinePublisher());

  const result = await useCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    items: data.items,
    actor: { id: user.id, name: user.name, role: user.role },
  });

  revalidatePath('/pharmacy');
  revalidatePath(`/pharmacy/${data.executionId}`);
  return result;
}

export async function cancelPharmacyOrder(data: {
  executionId: string;
  reason: string;
  expectedVersion: number;
}) {
  const user = getMockUser();
  const useCase = new CancelPharmacyOrderUseCase(prisma, getTimelinePublisher());

  const result = await useCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    reason: data.reason,
    actor: { id: user.id, name: user.name, role: user.role },
  });

  revalidatePath('/pharmacy');
  revalidatePath(`/pharmacy/${data.executionId}`);
  return result;
}
