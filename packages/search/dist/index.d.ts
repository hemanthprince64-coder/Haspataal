export { SearchService } from './application/services/search-service';
export { RankingEngine } from './application/services/ranking-engine';
export type {
  SearchIndexProvider,
  SearchDocument,
  AutocompleteResult,
  IndexHealth,
} from './infrastructure/providers/index-provider';
export { buildSearchDocument } from './infrastructure/document-builder';
export { PostgresSearchProvider } from './infrastructure/providers/postgres-provider';
export { RedisCacheDecorator } from './infrastructure/providers/redis-cache';
export * from './domain/types';
//# sourceMappingURL=index.d.ts.map
