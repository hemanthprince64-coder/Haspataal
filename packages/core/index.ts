// Outbox
export { OutboxService } from './domain/outbox/service';

// Authorization (re-exported from @haspataal/authorization for backward compatibility)
export { AuthorizationService } from '@haspataal/authorization';
export { DoctorPatientRelationshipService } from '@haspataal/authorization';
export { CareResponsibilityService } from '@haspataal/authorization';
export { TransferOfCareService } from '@haspataal/authorization';
export type { AuthorizationContext, AuthorizationDecision, CareResponsibility, DoctorPatientRelationship, TransferOfCare, DomainAction, AuthorizeRequest, AuthorizationResult, ActorContext, ResourceContext } from '@haspataal/authorization';

// History
export * from './domain/history/patientHistoryService';

// Alerts
export { AlertService } from '@haspataal/alerts';

// Referral
export * from '@haspataal/referral';

// Scheduling
export { BookAppointmentUseCase } from '@haspataal/scheduling';
export { Appointment } from '@haspataal/scheduling';
export { IAppointmentRepository } from '@haspataal/scheduling';
export { PrismaAppointmentRepository } from '@haspataal/scheduling';

export { DispenseService } from '@haspataal/pharmacy';
export { ExecutionService } from '@haspataal/pharmacy';
export { InventoryService } from '@haspataal/pharmacy';
export { MARService } from '@haspataal/pharmacy';
export { VerificationService } from '@haspataal/pharmacy';
export { PharmacyConsumer } from '@haspataal/pharmacy';

// Laboratory
export * from '@haspataal/laboratory';

// Identity
export * from '@haspataal/identity';

// Procedure
export * from '@haspataal/procedure';

// Radiology
export * from '@haspataal/radiology';

// Blood Bank
export * from '@haspataal/bloodbank';
