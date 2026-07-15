export class OutboxService {
  constructor(private readonly prisma: any = null) {}

  async createEvent(tx: any, patientId: string, eventType: string, payload: any) {
    if (tx.outboxEvent) {
      await tx.outboxEvent.create({
        data: {
          aggregateId: patientId,
          aggregateType: 'PATIENT',
          eventType,
          payload,
        },
      });
    }
    console.log(`[OUTBOX] Event created: ${eventType} for patient ${patientId}`);
  }
}
