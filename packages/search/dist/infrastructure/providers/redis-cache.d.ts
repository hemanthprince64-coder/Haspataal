import { SearchQuery, SearchResponse, EntityType } from '../../domain/types';
import { SearchIndexProvider, SearchDocument, AutocompleteOptions, AutocompleteResult, IndexHealth } from './index-provider';
export declare class RedisCacheDecorator implements SearchIndexProvider {
    private delegate;
    private redis;
    constructor(delegate: SearchIndexProvider, redisUrl: string);
    search(query: SearchQuery): Promise<SearchResponse>;
    index(document: SearchDocument): Promise<void>;
    delete(entityId: string, entityType: EntityType): Promise<void>;
    autocomplete(text: string, options: AutocompleteOptions): Promise<AutocompleteResult>;
    health(): Promise<IndexHealth>;
}
//# sourceMappingURL=redis-cache.d.ts.map