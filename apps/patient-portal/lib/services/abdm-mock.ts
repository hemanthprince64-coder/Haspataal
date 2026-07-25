/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type, local-rules/no-direct-prisma-in-pages, @typescript-eslint/no-unused-vars */
import { prisma } from '@/lib/util/prisma-singleton';

export interface AbhaVerificationResult {
  verified: boolean;
  abhaAddress: string;
  name: string;
  gender: string;
  dob: string;
}

export const abdmMockService = {
  /**
   * Simulates generating a new ABHA ID for a patient.
   */
  async createABHA(patientId: string, _adharNumber: string): Promise<AbhaVerificationResult> {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Generate simulated ABHA address based on name
    const nameSlug = patient.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const abhaAddress = `${nameSlug}${Math.floor(1000 + Math.random() * 9000)}@abdm`;

    // Save to patient profile
    await prisma.patient.update({
      where: { id: patientId },
      data: { abhaAddress },
    });

    return {
      verified: true,
      abhaAddress,
      name: patient.name,
      gender: patient.gender || 'F',
      dob: patient.dob ? patient.dob.toISOString().split('T')[0] : '1995-01-01',
    };
  },

  /**
   * Simulates verifying an existing ABHA ID.
   */
  async verifyABHA(abhaAddress: string): Promise<AbhaVerificationResult> {
    if (!abhaAddress.endsWith('@abdm')) {
      return { verified: false, abhaAddress, name: '', gender: '', dob: '' };
    }

    // In a real sandbox, this would request NHA gateway. We simulate a successful match:
    const base = abhaAddress.split('@')[0];
    const capitalized = base.charAt(0).toUpperCase() + base.slice(1);
    return {
      verified: true,
      abhaAddress,
      name: capitalized.replace(/\d/g, ' ') + ' Devi',
      gender: 'F',
      dob: '1998-05-15',
    };
  },

  /**
   * Link a caregiver family member to the pregnant mother's care profile
   */
  async linkCaregiver(
    patientId: string,
    caregiverDetails: { name: string; relation: string; abhaAddress?: string },
  ) {
    return await prisma.familyMember.create({
      data: {
        patientId,
        name: caregiverDetails.name,
        relation: caregiverDetails.relation,
        bloodGroup: 'Unknown',
      },
    });
  },
};

