import { SearchQuery, SearchResponse } from '../../domain/types';
import { SearchIndexProvider, SearchDocument, AutocompleteOptions, AutocompleteResult, IndexHealth } from './index-provider';
export declare class PostgresSearchProvider implements SearchIndexProvider {
    search(query: SearchQuery): Promise<SearchResponse>;
    index(document: SearchDocument, tx?: any): Promise<void>;
    delete(entityId: string, entityType: string, tx?: any): Promise<void>;
    autocomplete(text: string, options: AutocompleteOptions): Promise<AutocompleteResult>;
    health(): Promise<IndexHealth>;
}
//# sourceMappingURL=postgres-provider.d.ts.map