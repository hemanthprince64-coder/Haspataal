# Unified Search & Discovery Platform - Future Extensibility

## Roadmap

### Phase 1 - Launch (PostgreSQL FTS)
- Core search API
- Event-driven indexing
- PostgreSQL Full-Text Search
- Basic ranking

### Phase 2 - Enhancement
- OpenSearch provider
- Semantic search (embeddings)
- AI-powered query suggestions
- Advanced facets
- Search analytics

### Phase 3 - Advanced Features
- Cross-database search
- Predictive search (ML)
- Voice search
- Image search
- Multi-language support

## Migration Path: PostgreSQL → OpenSearch

### Abstraction Layer
```typescript
interface SearchIndexProvider {
  search(query: SearchQuery): Promise<SearchResult[]>;
  index(document: SearchDocument): Promise<void>;
  delete(entityId: string): Promise<void>;
  autocomplete(text: string, limit: number): Promise<string[]>;
  health(): Promise<IndexHealth>;
}

// PostgreSQL implementation
class PostgresFtsProvider implements SearchIndexProvider {}

// OpenSearch implementation
class OpenSearchProvider implements SearchIndexProvider {}
```

Migration requires zero code changes - just swap the provider.

## Extension Patterns

### Adding New Entity Types
1. Create entity mapper in `infrastructure/persistence/`
2. Register mapper in `SearchDocumentBuilder`
3. Add RLS policy for entity table
4. Update `SearchableEntityType` enum

### Adding New Filters/Facets
1. Define filter in `domain/value-objects/SearchFilter.ts`
2. Implement in `application/services/FilterService.ts`
3. Add to API query schema

### Adding New Synonyms
1. Admin UI add synonym
2. No code change required
3. Workers auto-reload within 30 seconds

## Multi-Tenancy Evolution

### Current: RLS in PostgreSQL
- `hospital_id` column on every indexed table
- `SET LOCAL hospitable.current_hospital_id` for queries

### Future: Index-per-Tenant
- Optional: separate index per hospital
- Same API, different backend routing

## Performance Scaling

### Horizontal Scaling
- Read replicas for search queries
- Worker sharding by entity type
- Redis cache per hospital

### Caching Strategy
- Hot queries cached 5 minutes
- Autocomplete cached 1 minute
- Synonym cache invalidated on change

## AI Enhancement Integration

### Query Intent Classification
- Classify: "find patient" vs "find bill"
- Boost relevant entity types

### Semantic Search
- Embedding model: med-embed-7b
- Vector similarity search
- Hybrid text + semantic ranking

### Smart Suggestions
- Analyze zero-result queries
- Suggest filters
- Suggest synonyms