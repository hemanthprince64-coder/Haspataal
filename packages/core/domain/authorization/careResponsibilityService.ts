import { PrismaClient, ResponsibilityStatus } from '@prisma/client';

export class CareResponsibilityService {
  constructor(private prisma: PrismaClient) {}

  async assignPrimaryResponsibility(params: {
    doctorId: string;
    patientId: string;
    episodeId: string;
  }) {
    // Note: The unique index on (patientId, episodeId) WHERE isPrimary=true AND status='ACTIVE'
    // guarantees only one active primary responsibility exists at a time.
    return await this.prisma.careResponsibility.create({
      data: {
        doctorId: params.doctorId,
        patientId: params.patientId,
        episodeId: params.episodeId,
        isPrimary: true,
        status: ResponsibilityStatus.ACTIVE,
      },
    });
  }

  async assignCoTreatingResponsibility(params: {
    doctorId: string;
    patientId: string;
    episodeId: string;
  }) {
    return await this.prisma.careResponsibility.create({
      data: {
        doctorId: params.doctorId,
        patientId: params.patientId,
        episodeId: params.episodeId,
        isPrimary: false,
        status: ResponsibilityStatus.ACTIVE,
      },
    });
  }

  async endResponsibility(params: { responsibilityId: string; reason: string }) {
    return await this.prisma.careResponsibility.update({
      where: { id: params.responsibilityId },
      data: {
        status: ResponsibilityStatus.ENDED,
        endedAt: new Date(),
        terminationReason: params.reason,
      },
    });
  }

  async handleDepartureSignal(params: {
    responsibilityId: string;
    signal:
      | 'DISCHARGE_CLINICALLY_DECIDED'
      | 'LAMA_INITIATED'
      | 'ABSCONDING_SUSPECTED'
      | 'PATIENT_PHYSICALLY_LEFT_STANDARD'
      | 'PATIENT_PHYSICALLY_LEFT_LAMA'
      | 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE';
  }) {
    let newStatus: any = ResponsibilityStatus.ACTIVE;

    // Only authoritative confirmed physical departure ends ACTIVE care authorization.
    if (
      params.signal === 'PATIENT_PHYSICALLY_LEFT_STANDARD' ||
      params.signal === 'PATIENT_PHYSICALLY_LEFT_LAMA' ||
      params.signal === 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE'
    ) {
      newStatus = ResponsibilityStatus.ENDED;
    }

    return await this.prisma.careResponsibility.update({
      where: { id: params.responsibilityId },
      data: {
        status: newStatus,
        // Store departure signal in terminationReason for traceability
        terminationReason: params.signal as any,
        ...(newStatus === ResponsibilityStatus.ENDED ? { endedAt: new Date() } : {}),
      },
    });
  }
}
