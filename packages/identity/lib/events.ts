export enum IdentityEventType {
  PATIENT_ACCOUNT_LINKED = 'PATIENT_ACCOUNT_LINKED',
  AUTH_METHOD_VERIFIED = 'AUTH_METHOD_VERIFIED',
  IDENTITY_MERGE_REQUESTED = 'IDENTITY_MERGE_REQUESTED',
  PATIENT_ALIAS_CREATED = 'PATIENT_ALIAS_CREATED',
}

export const IdentityEvents = {
  aliasCreated: (payload: {
    aliasPatientId: string;
    canonicalPatientId: string;
    reason: string;
    actorId: string;
  }) => ({
    eventType: IdentityEventType.PATIENT_ALIAS_CREATED,
    aggregateType: 'IDENTITY',
    aggregateId: payload.canonicalPatientId,
    payload,
  }),
  mergeRequested: (payload: {
    mergeRequestId: string;
    sourcePatientIds: string[];
    targetPatientId: string;
    requesterId: string;
  }) => ({
    eventType: IdentityEventType.IDENTITY_MERGE_REQUESTED,
    aggregateType: 'IDENTITY',
    aggregateId: payload.targetPatientId,
    payload,
  }),
  accountLinked: (payload: { patientId: string; userAccountId: string }) => ({
    eventType: IdentityEventType.PATIENT_ACCOUNT_LINKED,
    aggregateType: 'IDENTITY',
    aggregateId: payload.patientId,
    payload,
  }),
  authMethodVerified: (payload: { patientId: string; authMethodId: string; authType: string }) => ({
    eventType: IdentityEventType.AUTH_METHOD_VERIFIED,
    aggregateType: 'IDENTITY',
    aggregateId: payload.patientId,
    payload,
  }),
};