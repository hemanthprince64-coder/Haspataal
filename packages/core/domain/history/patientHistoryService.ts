import { PrismaClient } from '@prisma/client';

import { AuthorizationService } from '../authorization/service';
import { DomainAction, AuthorizationDecision } from '../authorization/types';

export class PatientHistoryService {
  constructor(
    private prisma: PrismaClient,
    private authService: AuthorizationService,
  ) {}

  /**
   * Fetches the longitudinal clinical history for a patient.
   * This service boundary enforces strict authorization.
   */
  async getLongitudinalHistory(
    actorId: string,
    actorRole: string,
    patientId: string,
    hospitalId?: string,
  ) {
    const authResult = await this.authService.authorize({
      actor: {
        id: actorId,
        role: actorRole,
        hospitalId: hospitalId,
      },
      action: DomainAction.PATIENT_LONGITUDINAL_HISTORY_READ,
      resource: {
        patientId: patientId,
        hospitalId: hospitalId,
      },
    });

    // Shadow Mode Logging could also happen here if we wrap this in the route,
    // but the engine itself executes the logic. If denied, we block.
    if (authResult.decision === AuthorizationDecision.DENY) {
      throw new Error(`Unauthorized: ${authResult.reason}`);
    }

    // The current authoritative source for patient history is the patientRecord table.
    // We formalize this data-access boundary here rather than directly in UI components.
    const records = await this.prisma.patientRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      patientId,
      authorizedVia: authResult.decision,
      auditLogId: authResult.auditLogId,
      records: records,
    };
  }
}
