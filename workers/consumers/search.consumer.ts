import { EventConsumer, CanonicalEventEnvelope, EventType } from '@haspataal/platform-contracts';
import { SearchService, PostgresSearchProvider, SearchCommandHandler } from '@haspataal/search';
import { Prisma } from '@prisma/client';

const searchHandler = new SearchCommandHandler(new SearchService(new PostgresSearchProvider()));

export class SearchConsumer implements EventConsumer {
  public readonly consumerName = 'Search';

  supportedEvents(): EventType[] {
    return ['INDEX_DOCUMENT_COMMAND', 'DELETE_DOCUMENT_COMMAND'];
  }

  async handle(envelope: CanonicalEventEnvelope, tx: Prisma.TransactionClient): Promise<void> {
    const payload = envelope.payload as any;

    if (envelope.eventType === 'INDEX_DOCUMENT_COMMAND') {
      await searchHandler.handleIndexDocument(payload, { tx });
    } else if (envelope.eventType === 'DELETE_DOCUMENT_COMMAND') {
      await searchHandler.handleDeleteDocument(payload, { tx });
    }
  }
}
