import {
  PrismaClient,
  TransfusionStatus,
  BloodUnitStatus,
  BloodRequestStatus,
} from '@prisma/client';

import { OutboxService } from '@haspataal/core';
import { BloodBankEvent, BloodBankEventType } from './types';

export class TransfusionService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async prepareBedsideVerification(issueId: string, patientId: string) {
    const issue = await this.prisma.bloodIssue.findUniqueOrThrow({
      where: { id: issueId },
      include: { executionItem: { include: { execution: true } } },
    });

    if (issue.executionItem.execution.patientId !== patientId) {
      throw new Error('Patient mismatch during bedside verification setup.');
    }

    // Check if TransfusionEpisode exists, else create it
    let episode = await this.prisma.transfusionEpisode.findUnique({
      where: { issueId },
    });

    if (!episode) {
      episode = await this.prisma.transfusionEpisode.create({
        data: {
          issueId,
          patientId,
          status: TransfusionStatus.NOT_STARTED,
        },
      });
    }

    return episode;
  }

  async verifyBedside(
    episodeId: string,
    performedBy: string,
    patientVerified: boolean,
    unitVerified: boolean,
    componentVerified: boolean,
  ) {
    const verification = await this.prisma.bedsideVerification.upsert({
      where: { transfusionEpisodeId: episodeId },
      create: {
        transfusionEpisodeId: episodeId,
        patientVerified,
        unitVerified,
        componentVerified,
        performedBy,
      },
      update: {
        patientVerified,
        unitVerified,
        componentVerified,
        performedBy,
        performedAt: new Date(),
      },
    });

    return verification;
  }

  async startTransfusion(episodeId: string, administeringNurseId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Must be verified
      const verification = await tx.bedsideVerification.findUnique({
        where: { transfusionEpisodeId: episodeId },
      });

      if (
        !verification ||
        !verification.patientVerified ||
        !verification.unitVerified ||
        !verification.componentVerified
      ) {
        throw new Error('Transfusion blocked: Bedside verification is incomplete.');
      }

      const episode = await tx.transfusionEpisode.findUniqueOrThrow({
        where: { id: episodeId },
        include: {
          issue: {
            include: {
              executionItem: { include: { execution: true } },
            },
          },
        },
      });

      if (episode.status !== TransfusionStatus.NOT_STARTED) {
        throw new Error('Transfusion has already been started.');
      }

      const updatedEpisode = await tx.transfusionEpisode.update({
        where: { id: episodeId },
        data: {
          status: TransfusionStatus.STARTED,
          startedAt: new Date(),
          administeringNurseId,
        },
      });

      await tx.bloodBankExecutionItem.update({
        where: { id: episode.issue.executionItemId },
        data: { status: BloodRequestStatus.TRANSFUSION_STARTED },
      });

      const event: BloodBankEvent = {
        eventId: crypto.randomUUID(),
        eventType: BloodBankEventType.TRANSFUSION_STARTED,
        hospitalId: episode.issue.executionItem.execution.hospitalId,
        patientId: episode.issue.executionItem.execution.patientId,
        executionId: episode.issue.executionItem.executionId,
        episodeId,
        bloodUnitId: episode.issue.bloodUnitId,
        timestamp: new Date(),
        payload: { episodeId },
      };

      await this.outbox.createEvent(
        this.prisma,
        event.patientId,
        event.eventType,
        event.payload,
      );

      return updatedEpisode;
    });
  }

  async recordObservation(episodeId: string, observerId: string, stage: string, vitals: any) {
    const observation = await this.prisma.transfusionObservation.create({
      data: {
        episodeId,
        observerId,
        stage, // BASELINE, 15_MIN, HOURLY, COMPLETION
        temperature: vitals.temperature,
        pulse: vitals.pulse,
        bloodPressure: vitals.bloodPressure,
        respiratoryRate: vitals.respiratoryRate,
        oxygenSaturation: vitals.oxygenSaturation,
      },
    });
    return observation;
  }

  async completeTransfusion(episodeId: string) {
    return this.prisma.$transaction(async (tx) => {
      const episode = await tx.transfusionEpisode.update({
        where: { id: episodeId },
        data: {
          status: TransfusionStatus.COMPLETED,
          stoppedAt: new Date(),
        },
        include: {
          issue: {
            include: { executionItem: { include: { execution: true } } },
          },
        },
      });

      await tx.bloodBankExecutionItem.update({
        where: { id: episode.issue.executionItemId },
        data: { status: BloodRequestStatus.TRANSFUSION_COMPLETED },
      });

      await tx.bloodUnit.update({
        where: { id: episode.issue.bloodUnitId },
        data: { currentStatus: BloodUnitStatus.TRANSFUSED },
      });

      const event: BloodBankEvent = {
        eventId: crypto.randomUUID(),
        eventType: BloodBankEventType.TRANSFUSION_COMPLETED,
        hospitalId: episode.issue.executionItem.execution.hospitalId,
        patientId: episode.issue.executionItem.execution.patientId,
        executionId: episode.issue.executionItem.executionId,
        episodeId,
        bloodUnitId: episode.issue.bloodUnitId,
        timestamp: new Date(),
        payload: { episodeId },
      };

      await this.outbox.createEvent(
        this.prisma,
        event.patientId,
        event.eventType,
        event.payload,
      );

      return episode;
    });
  }
}
