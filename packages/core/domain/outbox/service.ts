export class OutboxService {
  async createEvent(tx: any, patientId: string, eventType: string, payload: any) {
    // Mock outbox insertion
    // In reality this writes to transactional outbox table via the provided Prisma transaction
    console.log(`[OUTBOX] Event created: ${eventType} for patient ${patientId}`);
  }
}
