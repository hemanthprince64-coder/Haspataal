import { normalizeLegacyOutbox } from '@haspataal/platform-contracts';
import { PrismaClient } from '@prisma/client';

import {
  outboxConsumerRegistry,
  executeWithPrismaTxIdempotency,
} from '../workers/consumer-registry';

const prisma = new PrismaClient();

function parsePayload(raw: unknown): any {
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function main() {
  const args = process.argv.slice(2);
  const consumerArg = args.find((a) => a.startsWith('--consumer='))?.split('=')[1];
  const fromArg = args.find((a) => a.startsWith('--from='))?.split('=')[1];

  if (!consumerArg) {
    console.error(
      'Usage: npx ts-node scripts/replay-events.ts --consumer=Timeline [--from=2024-01-01]',
    );
    process.exit(1);
  }

  const allConsumers = outboxConsumerRegistry.getAllConsumers();
  const targetConsumer = allConsumers.find((c) => c.consumerName === consumerArg);

  if (!targetConsumer) {
    console.error(
      `Consumer '${consumerArg}' not found in registry. Valid consumers: ${allConsumers.map((c) => c.consumerName).join(', ')}`,
    );
    process.exit(1);
  }

  const fromDate = fromArg ? new Date(fromArg) : new Date(0);

  console.log(`Starting replay for consumer '${consumerArg}' from ${fromDate.toISOString()}...`);

  // Force checkpoint status
  await prisma.$executeRaw`
    INSERT INTO projection_checkpoint (consumer_name, last_replayed_at, status)
    VALUES (${consumerArg}, NOW(), 'REPLAYING')
    ON CONFLICT (consumer_name) DO UPDATE SET status = 'REPLAYING'
  `;

  let lastProcessedId = null;
  let batchSize = 100;
  let processedCount = 0;

  while (true) {
    const events: any[] = await prisma.outboxEvent.findMany({
      where: {
        createdAt: { gte: fromDate },
      },
      orderBy: { createdAt: 'asc' },
      take: batchSize,
      ...(lastProcessedId ? { cursor: { id: lastProcessedId }, skip: 1 } : {}),
    });

    if (events.length === 0) break;

    for (const record of events) {
      const payload = parsePayload(record.payload);
      const envelope = normalizeLegacyOutbox(record as any);
      const effectiveEventType = payload?.eventName ?? record.eventType;

      if (targetConsumer.supportedEvents().includes(effectiveEventType)) {
        await executeWithPrismaTxIdempotency(record.id, targetConsumer.consumerName, async (tx) => {
          await targetConsumer.handle(envelope, tx);
        });
        processedCount++;
      }
      lastProcessedId = record.id;
    }

    console.log(`Processed batch... Total so far: ${processedCount}`);
  }

  await prisma.$executeRaw`
    UPDATE projection_checkpoint
    SET status = 'ACTIVE', last_replayed_at = NOW(), last_event_id = ${lastProcessedId}
    WHERE consumer_name = ${consumerArg}
  `;

  console.log(`Replay complete. Total events processed for '${consumerArg}': ${processedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
