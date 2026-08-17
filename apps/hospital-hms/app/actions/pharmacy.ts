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

  const result = await ProcessPharmacyOrderUseCase.execute({
    clinicalOrderId: data.clinicalOrderId,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidatePath('/pharmacy');
  return result;
}

export async function verifyPharmacyOrder(data: { executionId: string; expectedVersion: number }) {
  const user = getMockUser();

  const result = await VerifyPharmacyOrderUseCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
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

  const result = await DispenseMedicationUseCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    itemsDispensed: data.items,
    isPartial: false, // Defaulting to false, should be determined by client logic or DTO
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
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

  const result = await CancelPharmacyOrderUseCase.execute({
    executionId: data.executionId,
    expectedVersion: data.expectedVersion,
    reason: data.reason,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidatePath('/pharmacy');
  revalidatePath(`/pharmacy/${data.executionId}`);
  return result;
}
