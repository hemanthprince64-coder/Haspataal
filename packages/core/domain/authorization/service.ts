import { PrismaClient, RelationshipStatus } from '@prisma/client';

import {
  AuthorizeRequest,
  AuthorizationResult,
  AuthorizationDecision,
  DomainAction,
} from './types';

export class AuthorizationService {
  constructor(private prisma: PrismaClient) {}

  async authorize(req: AuthorizeRequest): Promise<AuthorizationResult> {
    const { actor, action, resource } = req;
    let result: AuthorizationResult;

    switch (action) {
      case DomainAction.PATIENT_LONGITUDINAL_HISTORY_READ:
      case DomainAction.PATIENT_SAFETY_SUMMARY_READ:
        result = await this.authorizeClinicalRead(actor, resource);
        break;

      case DomainAction.IDENTITY_MERGE_EXECUTE:
      case DomainAction.IDENTITY_MERGE_APPROVE:
      case DomainAction.IDENTITY_MERGE_REVIEW:
        result = this.authorizeIdentityMerge(actor, action);
        break;

      case DomainAction.CLINICAL_DISCHARGE_DECISION:
      case DomainAction.LAMA_DOCUMENT:
        result = await this.authorizeStrictClinicalDecision(actor, resource);
        break;

      case DomainAction.DISCHARGE_PROCESS_MUTATION:
      case DomainAction.LAMA_INITIATE:
      case DomainAction.LAMA_WITHDRAW:
      case DomainAction.ABSENCE_SUSPECT:
      case DomainAction.ABSENCE_RESOLVE:
      case DomainAction.DEPARTURE_CONFIRM_STANDARD:
      case DomainAction.DEPARTURE_CONFIRM_LAMA:
      case DomainAction.DEPARTURE_CONFIRM_WITHOUT_NOTICE:
        result = await this.authorizeOperationalMutation(actor, resource, action);
        break;

      case DomainAction.ORDER_CREATE:
      case DomainAction.ORDER_CANCEL:
      case DomainAction.ORDER_COMPLETE:
      case DomainAction.ORDER_OVERRIDE_CDS:
      case DomainAction.ORDER_EXECUTION_UPDATE:
        result = this.authorizePhase5Order(actor, action);
        break;

      default:
        result = {
          decision: AuthorizationDecision.DENY,
          reason: `Action ${action} not supported yet in centralized authorization engine.`,
        };
    }

    // Return the authorization decision without writing to AuditLog or Outbox for every evaluation.
    // Durable audit is reserved for security-significant actions (e.g., Break Glass activation, Transfer of Care)
    // Operational telemetry for ordinary DENYs should use standard application logs.

    if (result.decision === AuthorizationDecision.DENY) {
      console.warn(
        JSON.stringify({
          event: 'authorization_decision_denied',
          actorId: actor.id,
          action: action,
          resourceId: resource.patientId,
          reason: result.reason,
        }),
      );
    }

    return result;
  }

  private async authorizeClinicalRead(
    actor: AuthorizeRequest['actor'],
    resource: AuthorizeRequest['resource'],
  ): Promise<AuthorizationResult> {
    if (!resource.patientId) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Patient context missing for clinical read.',
      };
    }

    // 1. Check for active DoctorPatientRelationship (Covers PRIMARY, CO_TREATING, CONSULTING via DoctorPatientRelationship)
    if (actor.role === 'DOCTOR') {
      const activeRel = await this.prisma.doctorPatientRelationship.findFirst({
        where: {
          patientId: resource.patientId,
          doctorId: actor.id,
          status: RelationshipStatus.ACTIVE,
        },
      });

      if (activeRel) {
        return {
          decision: AuthorizationDecision.ALLOW,
          reason: `Authorized via ACTIVE care relationship (ID: ${activeRel.id})`,
        };
      }
    }

    // 1b. Check for Care Team access (Co-treating, Consulting, Resident, Nurse)
    // Requires an ACTIVE CareResponsibility explicitly assigning this actor to the patient.
    const activeResponsibility = await this.prisma.careResponsibility.findFirst({
      where: {
        patientId: resource.patientId,
        doctorId: actor.id, // Using doctorId field generically for assigned care team member
        status: 'ACTIVE',
      },
    });

    if (activeResponsibility) {
      // For nurses/residents, this ensures legitimate patient-level assignment.
      return {
        decision: AuthorizationDecision.ALLOW,
        reason: `Authorized via ACTIVE CareResponsibility assignment (ID: ${activeResponsibility.id})`,
      };
    }

    // 2. Check for active Break Glass override
    const activeOverride = await this.prisma.breakGlassActivation.findFirst({
      where: {
        actorId: actor.id,
        patientId: resource.patientId,
        status: 'ACTIVE',
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: { activatedAt: 'desc' },
    });

    if (activeOverride) {
      return {
        decision: AuthorizationDecision.BREAK_GLASS,
        reason: `Authorized via BREAK_GLASS emergency override (ID: ${activeOverride.id})`,
        auditLogId: activeOverride.id, // Linking to the activation id
      };
    }

    // 3. Check for Post-Care Followup if applicable

    // Default Deny
    return {
      decision: AuthorizationDecision.DENY,
      reason: 'No active clinical relationship or break glass access found.',
    };
  }

  private authorizeIdentityMerge(
    actor: AuthorizeRequest['actor'],
    action: DomainAction,
  ): AuthorizationResult {
    let requiredPermission = 'module:IDENTITY:action:REVIEW';
    if (action === DomainAction.IDENTITY_MERGE_EXECUTE)
      requiredPermission = 'module:IDENTITY:action:EXECUTE';
    if (action === DomainAction.IDENTITY_MERGE_APPROVE)
      requiredPermission = 'module:IDENTITY:action:APPROVE';

    if (!actor.permissions?.includes(requiredPermission)) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: `Actor lacks explicit ${requiredPermission} capability.`,
      };
    }

    if (actor.hospitalId) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Tenant-scoped actors cannot possess platform merge authority.',
      };
    }

    return {
      decision: AuthorizationDecision.ALLOW,
      reason: 'Platform identity authority verified.',
    };
  }

  private async authorizeStrictClinicalDecision(
    actor: AuthorizeRequest['actor'],
    resource: AuthorizeRequest['resource'],
  ): Promise<AuthorizationResult> {
    if (!resource.patientId) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Patient context missing for strict clinical decision.',
      };
    }

    if (actor.role === 'DOCTOR') {
      const activeRel = await this.prisma.doctorPatientRelationship.findFirst({
        where: {
          patientId: resource.patientId,
          doctorId: actor.id,
          status: RelationshipStatus.ACTIVE,
        },
      });
      if (activeRel) {
        return {
          decision: AuthorizationDecision.ALLOW,
          reason: 'Authorized via ACTIVE care relationship',
        };
      }
    }

    return {
      decision: AuthorizationDecision.DENY,
      reason:
        'Strict clinical decision requires active treating relationship. Break glass is insufficient.',
    };
  }

  private async authorizeOperationalMutation(
    actor: AuthorizeRequest['actor'],
    resource: AuthorizeRequest['resource'],
    action: DomainAction,
  ): Promise<AuthorizationResult> {
    if (!resource.patientId) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Patient context missing for operational mutation.',
      };
    }

    if (actor.role === 'SECURITY' && action === DomainAction.DEPARTURE_CONFIRM_WITHOUT_NOTICE) {
      return {
        decision: AuthorizationDecision.DENY,
        reason:
          'Security may report observation but cannot authoritatively mutate Admission state.',
      };
    }

    // Check for assigned Care Responsibility
    const activeResponsibility = await this.prisma.careResponsibility.findFirst({
      where: {
        patientId: resource.patientId,
        doctorId: actor.id,
        status: 'ACTIVE',
      },
    });

    if (activeResponsibility) {
      return {
        decision: AuthorizationDecision.ALLOW,
        reason: 'Authorized via ACTIVE CareResponsibility assignment',
      };
    }

    // Check for active treating relationship
    if (actor.role === 'DOCTOR') {
      const activeRel = await this.prisma.doctorPatientRelationship.findFirst({
        where: {
          patientId: resource.patientId,
          doctorId: actor.id,
          status: RelationshipStatus.ACTIVE,
        },
      });
      if (activeRel) {
        return {
          decision: AuthorizationDecision.ALLOW,
          reason: 'Authorized via ACTIVE care relationship',
        };
      }
    }

    // Explicit generic role deny
    if (actor.role === 'ADMIN' || actor.role === 'NURSE' || actor.role === 'DOCTOR') {
      return {
        decision: AuthorizationDecision.DENY,
        reason:
          'Generic role without active patient/ward assignment is insufficient for operational mutation.',
      };
    }

    return {
      decision: AuthorizationDecision.DENY,
      reason: 'No active clinical or operational assignment found.',
    };
  }

  private async authorizePhase5Order(
    actor: AuthorizeRequest['actor'],
    action: DomainAction,
  ): Promise<AuthorizationResult> {
    if (action === DomainAction.ORDER_CREATE) {
      if (actor.role === 'DOCTOR' || actor.role === 'NURSE') {
        return {
          decision: AuthorizationDecision.ALLOW,
          reason: 'Authorized clinical role for order creation.',
        };
      }
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Only authorized clinical roles can create orders.',
      };
    }

    if (action === DomainAction.ORDER_CANCEL) {
      if (!actor.permissions?.includes('module:ORDER:action:CANCEL') && actor.role !== 'DOCTOR') {
        return {
          decision: AuthorizationDecision.DENY,
          reason: 'Actor lacks order cancellation capability.',
        };
      }
      return {
        decision: AuthorizationDecision.ALLOW,
        reason: 'Authorized to cancel orders.',
      };
    }

    // Default for execution updates or override
    return {
      decision: AuthorizationDecision.ALLOW,
      reason: 'Authorized for order execution tasks.',
    };
  }
}
