import {
  PrismaClient,
  ReactionSeverity,
  TransfusionStatus,
  TransfusionReactionStatus,
  TransfusionReactionOutcome,
} from '@prisma/client';

import { OutboxService } from '../outbox/service';
import { BloodBankEvent, BloodBankEventType } from './types';

export class ReactionService {
  constructor(
    private prisma: PrismaClient,
    private outbox: OutboxService,
  ) {}

  async recordReaction(
    episodeId: string,
    recordedBy: string,
    severity: ReactionSeverity,
    symptoms: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const episode = await tx.transfusionEpisode.findUniqueOrThrow({
        where: { id: episodeId },
        include: {
          issue: {
            include: { executionItem: { include: { execution: true } } },
          },
        },
      });

      const reaction = await tx.transfusionReaction.create({
        data: {
          episodeId,
          recordedBy,
          severity,
          symptoms,
          status: TransfusionReactionStatus.RECORDED,
        },
      });

      // Pause the transfusion automatically
      await tx.transfusionEpisode.update({
        where: { id: episodeId },
        data: { status: TransfusionStatus.PAUSED },
      });

      const event: BloodBankEvent = {
        eventId: crypto.randomUUID(),
        eventType: BloodBankEventType.TRANSFUSION_REACTION_RECORDED,
        hospitalId: episode.issue.executionItem.execution.hospitalId,
        patientId: episode.issue.executionItem.execution.patientId,
        executionId: episode.issue.executionItem.executionId,
        episodeId,
        reactionId: reaction.id,
        timestamp: new Date(),
        payload: { reactionId: reaction.id, severity, symptoms },
      };

      await tx.bloodBankAudit.create({
        data: {
          executionId: episode.issue.executionItem.executionId,
          action: 'TRANSFUSION_REACTION_RECORDED',
          performedBy: recordedBy,
          details: { reactionId: reaction.id, severity, symptoms },
        },
      });

      await this.outbox.createEvent(
        typeof tx !== 'undefined' ? tx : this.prisma,
        event.patientId,
        event.eventType,
        event.payload,
      );

      return reaction;
    });
  }

  async resolveReaction(
    reactionId: string,
    resolvedBy: string,
    outcome: TransfusionReactionOutcome,
    management: string,
  ) {
    const reaction = await this.prisma.transfusionReaction.update({
      where: { id: reactionId },
      data: {
        status: TransfusionReactionStatus.RESOLVED,
        outcome,
        management,
        resolutionTime: new Date(),
      },
      include: {
        episode: {
          include: {
            issue: { include: { executionItem: { include: { execution: true } } } },
          },
        },
      },
    });

    const event: BloodBankEvent = {
      eventId: crypto.randomUUID(),
      eventType: BloodBankEventType.TRANSFUSION_REACTION_ACKNOWLEDGED,
      hospitalId: reaction.episode.issue.executionItem.execution.hospitalId,
      patientId: reaction.episode.issue.executionItem.execution.patientId,
      executionId: reaction.episode.issue.executionItem.executionId,
      episodeId: reaction.episodeId,
      reactionId,
      timestamp: new Date(),
      payload: { reactionId, outcome, management },
    };

    await this.prisma.bloodBankAudit.create({
      data: {
        executionId: reaction.episode.issue.executionItem.executionId,
        action: 'TRANSFUSION_REACTION_ACKNOWLEDGED',
        performedBy: resolvedBy,
        details: { reactionId, outcome, management },
      },
    });

    await this.outbox.createEvent(
      typeof tx !== 'undefined' ? tx : this.prisma,
      event.patientId,
      event.eventType,
      event.payload,
    );

    return reaction;
  }
}
