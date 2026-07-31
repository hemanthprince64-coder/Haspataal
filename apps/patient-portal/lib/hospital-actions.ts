 
'use server';

import { revalidatePath } from 'next/cache';

import { requireHospitalAccess } from '@/lib/auth/hospital-access';
import { prisma } from '@/lib/prisma';

import {
  HospitalInsuranceSchema,
  UpdateHospitalInsuranceSchema,
} from './validations/hospital-insurance';

// ── Server Actions ─────────────────────────────────────────────

export async function createHospitalInsurance(input: unknown) {
  try {
    const access = await requireHospitalAccess('billing', 'create');
    const validated = HospitalInsuranceSchema.parse(input);

    const insurance = await prisma.hospitalInsurance.create({
      data: {
        hospitalId: access.hospitalId,
        insurerName: validated.insurerName,
        insurerType: validated.insurerType,
        policyNumber: validated.policyNumber || null,
        tieUpLetterFileUrl: validated.tieUpLetterFileUrl || null,
        validFrom: new Date(validated.validFrom),
        validTo: new Date(validated.validTo),
        specialitiesCovered: validated.specialitiesCovered,
        coPayPercentage: validated.coPayPercentage ?? null,
        cashlessNetwork: validated.cashlessNetwork,
        isActive: true,
      },
    });

    revalidatePath('/hospital/dashboard/settings/insurance');
    return { success: true, data: insurance };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create insurance policy' };
  }
}

export async function updateHospitalInsurance(input: unknown) {
  try {
    const access = await requireHospitalAccess('billing', 'update');
    const validated = UpdateHospitalInsuranceSchema.parse(input);

    const insurance = await prisma.hospitalInsurance.update({
      where: {
        id: validated.id,
        hospitalId: access.hospitalId,
      },
      data: {
        ...(validated.insurerName && { insurerName: validated.insurerName }),
        ...(validated.insurerType && { insurerType: validated.insurerType }),
        ...(validated.policyNumber !== undefined && {
          policyNumber: validated.policyNumber || null,
        }),
        ...(validated.tieUpLetterFileUrl !== undefined && {
          tieUpLetterFileUrl: validated.tieUpLetterFileUrl || null,
        }),
        ...(validated.validFrom && { validFrom: new Date(validated.validFrom) }),
        ...(validated.validTo && { validTo: new Date(validated.validTo) }),
        ...(validated.specialitiesCovered && {
          specialitiesCovered: validated.specialitiesCovered,
        }),
        ...(validated.coPayPercentage !== undefined && {
          coPayPercentage: validated.coPayPercentage,
        }),
        ...(validated.cashlessNetwork !== undefined && {
          cashlessNetwork: validated.cashlessNetwork,
        }),
      },
    });

    revalidatePath('/hospital/dashboard/settings/insurance');
    return { success: true, data: insurance };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update insurance policy' };
  }
}

export async function getHospitalInsurances(hospitalId: string) {
  try {
    await requireHospitalAccess('billing', 'read');
    const insurances = await prisma.hospitalInsurance.findMany({
      where: {
        hospitalId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return insurances;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch insurance policies');
  }
}

export async function deleteHospitalInsurance(id: string, hospitalId: string) {
  try {
    await requireHospitalAccess('billing', 'delete');
    await prisma.hospitalInsurance.update({
      where: {
        id,
        hospitalId,
      },
      data: {
        isActive: false,
      },
    });

    revalidatePath('/hospital/dashboard/settings/insurance');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete insurance policy' };
  }
}

export async function toggleHospitalInsurance(id: string) {
  try {
    const access = await requireHospitalAccess('billing', 'update');
    const current = await prisma.hospitalInsurance.findUnique({
      where: { id, hospitalId: access.hospitalId },
      select: { cashlessNetwork: true },
    });

    if (!current) {
      return { success: false, message: 'Policy not found' };
    }

    const updated = await prisma.hospitalInsurance.update({
      where: { id, hospitalId: access.hospitalId },
      data: { cashlessNetwork: !current.cashlessNetwork },
    });

    revalidatePath('/hospital/dashboard/settings/insurance');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to toggle network mode' };
  }
}
