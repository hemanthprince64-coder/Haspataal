import { SearchQuery, SearchResponse, EntityType } from '../../domain/types';
export interface SearchIndexProvider {
    search(query: SearchQuery): Promise<SearchResponse>;
    index(document: SearchDocument, tx?: any): Promise<void>;
    delete(entityId: string, entityType: EntityType, tx?: any): Promise<void>;
    autocomplete(text: string, options: AutocompleteOptions): Promise<AutocompleteResult>;
    health(): Promise<IndexHealth>;
}
export interface SearchDocument {
    id?: string;
    entityType: string;
    entityId: string;
    hospitalId?: string;
    title: string;
    content?: string;
    metadata?: Record<string, any>;
}
export interface AutocompleteOptions {
    types?: string[];
    limit?: number;
    hospitalId?: string;
}
export interface AutocompleteResult {
    suggestions: Array<{
        text: string;
        entityType: string;
        entityId: string;
    }>;
    tookMs: number;
}
export interface IndexHealth {
    status: 'healthy' | 'degraded' | 'error';
    documentCount: number;
    indexSizeBytes: number;
    queueDepth: number;
    lastIndexedAt?: Date;
}
//# sourceMappingURL=index-provider.d.ts.map