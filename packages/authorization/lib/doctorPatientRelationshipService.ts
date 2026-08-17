import {
  PrismaClient,
  RelationshipLevel,
  RelationshipStatus,
  RelationshipTrigger,
  TerminationReason,
  CarePurpose,
} from '@prisma/client';

export class DoctorPatientRelationshipService {
  constructor(private prisma: PrismaClient) {}

  async establishRelationship(params: {
    patientId: string;
    doctorId: string;
    hospitalId?: string;
    episodeId?: string;
    originatingEventId?: string;
    level: RelationshipLevel;
    carePurpose: CarePurpose;
    sourceTrigger: RelationshipTrigger;
  }) {
    // Establish relationship. DB unique constraint prevents duplicate ACTIVE relationships for same patient, doctor, and episode.
    return await this.prisma.doctorPatientRelationship.create({
      data: {
        patientId: params.patientId,
        doctorId: params.doctorId,
        hospitalId: params.hospitalId,
        episodeId: params.episodeId,
        originatingEventId: params.originatingEventId,
        level: params.level,
        status: RelationshipStatus.ACTIVE,
        carePurpose: params.carePurpose,
        sourceTrigger: params.sourceTrigger,
      },
    });
  }

  async terminateRelationship(params: {
    relationshipId: string;
    endedBy: string;
    reason: TerminationReason;
  }) {
    return await this.prisma.doctorPatientRelationship.update({
      where: { id: params.relationshipId },
      data: {
        status: RelationshipStatus.ENDED,
        endedAt: new Date(),
        endedBy: params.endedBy,
        terminationReason: params.reason,
        version: { increment: 1 },
      },
    });
  }

  async handleDepartureSignal(params: {
    relationshipId: string;
    signal:
      | 'DISCHARGE_CLINICALLY_DECIDED'
      | 'LAMA_INITIATED'
      | 'ABSCONDING_SUSPECTED'
      | 'PATIENT_PHYSICALLY_LEFT_STANDARD'
      | 'PATIENT_PHYSICALLY_LEFT_LAMA'
      | 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE';
  }) {
    let newStatus: any = RelationshipStatus.ACTIVE;

    // Only authoritative confirmed physical departure ends ACTIVE care authorization.
    if (
      params.signal === 'PATIENT_PHYSICALLY_LEFT_STANDARD' ||
      params.signal === 'PATIENT_PHYSICALLY_LEFT_LAMA' ||
      params.signal === 'PATIENT_PHYSICALLY_LEFT_WITHOUT_NOTICE'
    ) {
      newStatus = RelationshipStatus.ENDED;
    }

    return await this.prisma.doctorPatientRelationship.update({
      where: { id: params.relationshipId },
      data: {
        status: newStatus,
        // Store departure signal in terminationReason for traceability
        ...(newStatus === RelationshipStatus.ENDED
          ? { endedAt: new Date(), terminationReason: params.signal as any }
          : {}),
      },
    });
  }
}