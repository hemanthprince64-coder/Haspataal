const fs = require('fs');
let content = fs.readFileSync('packages/core/domain/authorization/service.ts', 'utf8');

// Add referral case to switch statement
const insertion = `
      case DomainAction.REFERRAL_CREATE:
      case DomainAction.REFERRAL_SEND:
      case DomainAction.REFERRAL_ACCEPT:
      case DomainAction.REFERRAL_DECLINE:
      case DomainAction.REFERRAL_COMPLETE:
      case DomainAction.REFERRAL_CANCEL:
      case DomainAction.CARE_TRANSFER_REQUEST:
      case DomainAction.CARE_TRANSFER_EXECUTE:
      case DomainAction.CONSULTATION_COMPLETE:
        result = this.authorizePhase5B6Referral(actor, action);
        break;

      `;

content = content.replace(
  '      default:\n        result = {',
  insertion + 'default:\n        result = {',
);

// Add the authorization method at the end of the class
const methodCode = `

  private authorizePhase5B6Referral(
    actor: AuthorizeRequest['actor'],
    action: DomainAction,
  ): AuthorizationResult {
    const allowedRoles = ['DOCTOR', 'NURSE', 'HOSPITAL_ADMIN', 'SUPER_ADMIN'];

    if (!allowedRoles.includes(actor.role)) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: \`Role \${actor.role} is not permitted to perform referral action \${action}.\`,
      };
    }

    // Care Transfer Execute requires elevated privileges — only doctors
    if (
      action === DomainAction.CARE_TRANSFER_EXECUTE &&
      actor.role !== 'DOCTOR' &&
      actor.role !== 'HOSPITAL_ADMIN' &&
      actor.role !== 'SUPER_ADMIN'
    ) {
      return {
        decision: AuthorizationDecision.DENY,
        reason: 'Only Doctors or Administrators can execute care transfers.',
      };
    }

    return {
      decision: AuthorizationDecision.ALLOW,
      reason: \`Actor \${actor.id} (\${actor.role}) authorized for referral action \${action}.\`,
    };
  }`;

// Find the last closing brace of the class and insert before it
const lastBrace = content.lastIndexOf('\n}');
content = content.substring(0, lastBrace) + methodCode + '\n}';

fs.writeFileSync('packages/core/domain/authorization/service.ts', content);
console.log('Added referral authorization to service');
