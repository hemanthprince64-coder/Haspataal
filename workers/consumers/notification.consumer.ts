import { NotificationCommandHandler } from '@haspataal/notify';
import { EventConsumer, CanonicalEventEnvelope, EventType } from '@haspataal/platform-contracts';
import { Prisma } from '@prisma/client';

const notificationHandler = new NotificationCommandHandler();

export class NotificationConsumer implements EventConsumer {
  public readonly consumerName = 'Notification';

  supportedEvents(): EventType[] {
    return ['SEND_NOTIFICATION_COMMAND'];
  }

  async handle(envelope: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    const payload = envelope.payload as any;

    // Distinguish intent from delivery for replay safety
    // This executes inside executeWithPrismaTxIdempotency, so it will only run once.
    // If we're replaying events, the ledger will already have 'COMPLETED' for this eventId,
    // so this handle() method won't even be invoked.
    // So we can safely prepare the DB intent here.

    const res = await notificationHandler.handleSendNotificationPrepareDb(payload, { tx });

    // In a pure outbox consumer, side-effects like BullMQ dispatch should ideally be handled
    // by a separate process watching the notification table, OR by a post-commit hook.
    // For Phase 4 backward compatibility, since we are inside a tx, we dispatch immediately.
    // If the tx rolls back, the BullMQ job might fire but find no DB record, which it should handle gracefully.

    // We defer the dispatch to run after the current tick to increase the chance the tx commits first,
    // though a transactional outbox specifically for notifications would be better long-term.
    setImmediate(() => {
      notificationHandler
        .handleSendNotificationDispatch(res.queueName, res.notificationId, payload?.priority)
        .catch((err) => {
          console.error('Failed to dispatch notification', err);
        });
    });
  }
}
