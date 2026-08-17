export { IdentityService } from './lib/service';
export { getCanonicalPatientIdFromSession, legacyFindPatientByVerifiedMobile } from './lib/adapters';
export { hashSecret, verifySecret } from './lib/cryptography';
export { PatientAliasCreated, PatientAliasesMerged } from './lib/events';
export { normalizePhone, normalizeEmail } from './lib/normalization';