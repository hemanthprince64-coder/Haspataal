import { prisma } from '@haspataal/db';
import { EncounterStatus } from '@haspataal/types';

export class EncounterGuard {
  static async requireActiveEncounter(encounterId: string) {
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    if (
      encounter.status !== EncounterStatus.ACTIVE &&
      encounter.status !== EncounterStatus.TRIAGE &&
      encounter.status !== EncounterStatus.CONSULTATION
    ) {
      throw new Error(
        `Invalid Encounter State: Expected an active/in-progress encounter but got ${encounter.status}`,
      );
    }

    return encounter;
  }

  static async requireEncounterDoctor(encounterId: string, doctorId: string) {
    const encounter = await this.requireActiveEncounter(encounterId);

    if (encounter.doctorId && encounter.doctorId !== doctorId) {
      throw new Error(`Forbidden: You are not the assigned doctor for this encounter.`);
    }

    return encounter;
  }

  static async requireEncounterNotCompleted(encounterId: string) {
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    if (encounter.status === EncounterStatus.COMPLETED) {
      throw new Error('Forbidden: This encounter has already been completed.');
    }

    return encounter;
  }

  static async requireEncounterHospital(encounterId: string, hospitalId: string) {
    const encounter = await prisma.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error(`Encounter not found: ${encounterId}`);
    }

    if (encounter.hospitalId !== hospitalId) {
      throw new Error(`Forbidden: Encounter does not belong to this hospital.`);
    }

    return encounter;
  }
}
