const fs = require('fs');
let content = fs.readFileSync('packages/core/domain/authorization/types.ts', 'utf8');
const insertion = `
  // Phase 5B.6 Referral Actions
  REFERRAL_CREATE = 'REFERRAL_CREATE',
  REFERRAL_SEND = 'REFERRAL_SEND',
  REFERRAL_ACCEPT = 'REFERRAL_ACCEPT',
  REFERRAL_DECLINE = 'REFERRAL_DECLINE',
  REFERRAL_COMPLETE = 'REFERRAL_COMPLETE',
  REFERRAL_CANCEL = 'REFERRAL_CANCEL',
  CARE_TRANSFER_REQUEST = 'CARE_TRANSFER_REQUEST',
  CARE_TRANSFER_EXECUTE = 'CARE_TRANSFER_EXECUTE',
  CONSULTATION_COMPLETE = 'CONSULTATION_COMPLETE',
}`;

content = content.replace(
  "  TRANSFUSION_REACTION = 'TRANSFUSION_REACTION',\n}",
  "  TRANSFUSION_REACTION = 'TRANSFUSION_REACTION'," + insertion,
);
fs.writeFileSync('packages/core/domain/authorization/types.ts', content);
console.log('Added referral DomainActions');
