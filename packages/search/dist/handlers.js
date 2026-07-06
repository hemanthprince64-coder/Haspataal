import { z } from 'zod';
import { createPlatformCommandSchema } from '@haspataal/platform-contracts';
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
/**
 * Payload schema for deleting a document.
 */
export const DeleteDocumentPayloadSchema = z.object({
    entityType: z.string(),
    entityId: z.string(),
});
export const IndexDocumentCommandSchema = createPlatformCommandSchema(IndexDocumentPayloadSchema);
export const DeleteDocumentCommandSchema = createPlatformCommandSchema(DeleteDocumentPayloadSchema);
/**
 * Validates and routes incoming Search commands from the inbox/bus.
 */
export class SearchCommandHandler {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async handleIndexDocument(rawCommand) {
        const command = IndexDocumentCommandSchema.parse(rawCommand);
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
    async handleDeleteDocument(rawCommand) {
        const command = DeleteDocumentCommandSchema.parse(rawCommand);
        const payload = command.payload;
        await this.searchService.delete(payload.entityId, payload.entityType);
    }
}
