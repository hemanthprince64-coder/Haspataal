import { z } from 'zod';
import { createPlatformCommandSchema, PlatformCommand } from '@haspataal/platform-contracts';
import { SearchService } from './application/services/search-service';

/**
 * Payload schema for indexing a document.
 */
export const IndexDocumentPayloadSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  hospitalId: z.string().optional(),
  title: z.string(),
  content: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});
export type IndexDocumentPayload = z.infer<typeof IndexDocumentPayloadSchema>;

/**
 * Payload schema for deleting a document.
 */
export const DeleteDocumentPayloadSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
});
export type DeleteDocumentPayload = z.infer<typeof DeleteDocumentPayloadSchema>;

export const IndexDocumentCommandSchema = createPlatformCommandSchema(IndexDocumentPayloadSchema);
export const DeleteDocumentCommandSchema = createPlatformCommandSchema(DeleteDocumentPayloadSchema);

/**
 * Validates and routes incoming Search commands from the inbox/bus.
 */
export class SearchCommandHandler {
  constructor(private searchService: SearchService) {}

  async handleIndexDocument(rawCommand: unknown): Promise<void> {
    const command = IndexDocumentCommandSchema.parse(rawCommand) as PlatformCommand<IndexDocumentPayload>;
    const payload = command.payload;
    await this.searchService.index({
      entityType: payload.entityType,
      entityId: payload.entityId,
      hospitalId: payload.hospitalId,
      title: payload.title,
      content: payload.content,
      metadata: payload.metadata,
    });
  }

  async handleDeleteDocument(rawCommand: unknown): Promise<void> {
    const command = DeleteDocumentCommandSchema.parse(rawCommand) as PlatformCommand<DeleteDocumentPayload>;
    const payload = command.payload;
    await this.searchService.delete(payload.entityId, payload.entityType as any);
  }
}

