import { SearchQuery, SearchResponse, EntityType } from '../../domain/types';
import { SearchIndexProvider } from '../../infrastructure/providers/index-provider';
export declare class SearchService {
    private provider;
    constructor(provider: SearchIndexProvider);
    search(query: SearchQuery): Promise<SearchResponse>;
    autocomplete(text: string, limit?: number, types?: string[], hospitalId?: string): Promise<import("../..").AutocompleteResult>;
    health(): Promise<import("../..").IndexHealth>;
    index(document: {
        entityType: string;
        entityId: string;
        hospitalId?: string;
        title: string;
        content?: string;
        metadata?: Record<string, any>;
    }, tx?: any): Promise<void>;
    delete(entityId: string, entityType: EntityType, tx?: any): Promise<void>;
}
//# sourceMappingURL=search-service.d.ts.map