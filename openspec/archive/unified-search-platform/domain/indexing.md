# Search Indexing Architecture - Production Specification

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       SEARCH INDEXING PLATFORM                   │
├─────────────────────────────────────────────────────────────────┤
│  INDEX PROVIDER ABSTRACTION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │  SearchIndexProvider (Interface)                            │ │
│  │  ┌────────────────────┐  ┌──────────────────────────────┐   │ │
│  │  │ PostgreSQLFtS      │  │ OpenSearchProvider            │   │ │
│  │  │ (Current)        │  │ (Future)                    │   │ │
│  │  │                  │  │                             │   │ │
│  │  │ • tsvector       │  │ • Standard analyzer         │   │ │
│  │  │ • GIN index      │  │ • BM25 ranking              │   │ │
│  │  │ • Similarity     │  │ • Synonym graph              │   │ │
│  │  └──────────────────┘  │ • KNN vectors (future)      │   │ │
│  │                        └──────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  INDEXING ORCHESTRATOR                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │ Document    │  │ Event       │  │ Batch       │          │ │
│  │  │ Builder     │  │ Consumer    │  │ Processor   │          │ │
│  │  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘          │ │
│  └─────────┼─────────┼─────────┼────────└────────────────────────┘ │
├─────────┼─────────┼─────────┼────────────────────────────────────┤
│  EVENT SOURCES                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Entity DB   │  │ Timeline    │  │ Journey     │              │
│  │ Events      │  │ Engine      │  │ Engine      │              │
│  └─────┬───────┘  └─────┬───────┘  └─────┬───────┘              │
├─────────┼─────────┼─────────┼────────────────────────────────────┤
│  INDEX LAYER                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ PostgreSQL searchable_entities table                          │ │
│  │ Columns: id, type, title, content, tsvector, metadata, ...  │ │
│  │ Indexes: GIN(tsvector), B-tree(hospital_id), Hash(type)      │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  CACHE LAYER                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Redis: hot queries, autocomplete, synonym cache             │ │
│  │ TTL: autocomplete 60s, hot queries 300s, synonyms 3600s    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Indexer Component

### SearchIndexProvider Interface
```typescript
interface SearchIndexProvider {
  // Core operations
  search(query: SearchQuery): Promise<SearchResult>;
  index(doc: SearchDocument): Promise<void>;
  delete(entityId: string, entityType: string): Promise<void>;
  
  // Bulk operations
  bulkIndex(docs: SearchDocument[]): Promise<BulkResult>;
  bulkDelete(ids: string[]): Promise<BulkResult>;
  
  // Autocomplete
  autocomplete(text: string, options: AutocompleteOptions): Promise<string[]>;
  
  // Health/status
  health(): Promise<IndexHealth>;
  stats(): Promise<IndexStats>;
  
  // Synonyms
  addSynonym(term: string, synonyms: string[]): Promise<void>;
  removeSynonym(term: string): Promise<void>;
  getSynonyms(): Promise<Map<string, string[]>>;
}
```

### PostgreSQLFtS Provider (Current)
```typescript
class PostgresFtsProvider implements SearchIndexProvider {
  private pool: Pool;
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const sql = `
      SELECT *, ts_rank_cd(search_vector, plainto_tsquery($1)) as rank
      FROM searchable_entities
      WHERE search_vector @@ plainto_tsquery($1)
      ${query.filters ? this.buildFilters(query.filters) : ''}
      ORDER BY rank DESC
      LIMIT $2 OFFSET $3
    `;
    return this.pool.query(sql, [query.text, query.limit, query.offset]);
  }
  
  async index(doc: SearchDocument): Promise<void> {
    const sql = `
      INSERT INTO searchable_entities (
        id, entity_type, entity_id, hospital_id,
        title, content, metadata, search_vector
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 
        setweight(to_tsvector('english', $5), 'A') ||
        setweight(to_tsvector('english', $6), 'B')
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        metadata = EXCLUDED.metadata,
        search_vector = EXCLUDED.search_vector,
        updated_at = NOW()
    `;
    await this.pool.query(sql, this.extractParams(doc));
  }
}
```

### OpenSearchProvider (Future)
```typescript
class OpenSearchProvider implements SearchIndexProvider {
  private client: Client;
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const response = await this.client.search({
      index: 'haspataal-search',
      body: {
        query: {
          multi_match: {
            query: query.text,
            fields: ['title^2', 'content', 'metadata.*'],
          }
        },
        filter: this.buildFilters(query.filters),
        highlight: { fields: { title: {}, content: {} } }
      }
    });
    return this.formatResponse(response);
  }
}
```

## Index Workers Architecture

### Worker Types

| Worker | Queue | Concurrency | Purpose |
|--------|-------|-------------|---------|
| Indexer | `search-index` | 10 | Real-time document indexing |
| Reindexer | `search-reindex` | 5 | Full table reindex |
| AutocompleteCache | `search-autocomplete-cache` | 5 | Cache autocomplete terms |
| SynonymSync | `search-synonym-sync` | 2 | Sync synonyms to cache |
| StatsRecorder | `search-stats` | 5 | Record search metrics |

### Worker Configuration
```typescript
// packages/search/src/workers/indexer.ts
export const indexerWorker = new Worker(
  'search-index',
  async (job: Job<IndexJob>) => {
    const { entityType, entityId, operation } = job.data;
    
    switch (operation) {
      case 'CREATE':
      case 'UPDATE':
        const doc = await DocumentBuilder.build(entityType, entityId);
        await provider.index(doc);
        break;
      case 'DELETE':
        await provider.delete(entityId, entityType);
        break;
    }
  },
  {
    connection: redis,
    concurrency: 10,
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  }
);
```

## Background Sync Architecture

### Event-Driven Updates
```
Entity Change → Prisma Middleware → IndexRequested Event → Queue → Worker → Index Provider
```

### Prisma Middleware Hook
```typescript
// packages/search/src/middleware.ts
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (['create', 'update', 'delete'].includes(params.action)) {
    const searchableTypes = ['patient', 'doctor', 'appointment', 'journey', ...];
    if (searchableTypes.includes(params.model.toLowerCase())) {
      await queue.add('search-index', {
        operation: params.action.toUpperCase(),
        entityType: params.model.toLowerCase(),
        entityId: result.id,
      });
    }
  }
  
  return result;
});
```

## Incremental Indexing

### Strategy
- **Trigger**: Entity INSERT/UPDATE/DELETE
- **Process**: Single document upsert/delete
- **Latency Target**: < 200ms end-to-end

### Implementation
```typescript
// Incremental indexer
async incrementalIndex(change: EntityChangeEvent) {
  const doc = await this.buildDocument(change.entityType, change.entityId);
  
  if (change.operation === 'DELETE') {
    await this.provider.delete(change.entityId, change.entityType);
  } else {
    doc.searchVector = this.buildTsVector(doc);
    await this.provider.upsert(doc);
  }
}
```

## Bulk Indexing

### Strategy
- **Batch Size**: 100 documents per transaction
- **Parallelism**: 5 concurrent workers
- **Backpressure**: Queue depth threshold alerts

### Implementation
```typescript
// packages/search/src/services/ReindexService.ts
async reindexEntity(entityType: string, batchSize = 100) {
  const total = await this.getCount(entityType);
  const batches = Math.ceil(total / batchSize);
  
  for (let i = 0; i < batches; i++) {
    await queue.add('search-reindex-batch', {
      entityType,
      offset: i * batchSize,
      limit: batchSize,
    });
  }
}
```

## Index Rebuild

### Full Rebuild Process
```
1. Disable RLS (reindex_mode = true)
2. Create temp table with new schema
3. Populate with transformed documents
4. Atomic swap (DROP + RENAME)
5. Re-enable RLS
6. Queue stats refresh
```

### Rebuild Command
```typescript
// npm run search:reindex -- --entity=patient
async fullReindex(entityType: string) {
  const tempTable = `searchable_entities_${entityType}_temp`;
  
  // Create temp table
  await sql`CREATE TABLE ${sql(tempTable)} (LIKE searchable_entities INCLUDING ALL)`;
  
  // Populate
  await this.populateTempTable(tempTable, entityType);
  
  // Swap
  await sql`DROP TABLE searchable_entities_${entityType}`;
  await sql`ALTER TABLE ${sql(tempTable)} RENAME TO searchable_entities_${entityType}`;
}
```

## Real-Time Updates

### Update Flow
```
1. Entity updated
2. Prisma middleware fires
3. IndexRequested event queued (TTL: 30s)
4. Indexer worker picks up
5. Document rebuilt
6. Index upserted
7. Cache invalidated
8. Stats updated
```

### Cache Invalidation
```typescript
// Invalidate autocomplete cache on entity updates
async invalidateAutocompleteCache(entityType: string) {
  const pattern = `autocomplete:${entityType}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

## Soft Delete Handling

### Strategy
- **Field**: `deleted_at TIMESTAMP NULL` in `searchable_entities`
- **Filter**: Always add `deleted_at IS NULL` to queries
- **Cleanup**: Nightly hard delete for permanent removal

### Implementation
```sql
-- Soft delete trigger
UPDATE searchable_entities 
SET deleted_at = NOW(), 
    visibility = FALSE 
WHERE entity_id = $1 AND entity_type = $2;

-- Query filter
SELECT * FROM searchable_entities 
WHERE search_vector @@ to_tsquery($query)
AND deleted_at IS NULL;
```

## Cache Strategy

### Layers

| Layer | Provider | TTL | Purpose |
|-------|----------|-----|---------|
| Hot Queries | Redis | 300s | Popular queries cache |
| Autocomplete | Redis | 60s | Type-ahead suggestions |
| Synonyms | Redis | 3600s | Synonym expansion cache |
| Facets | Redis | 600s | Facet counts cache |
| Stats | Redis | 300s | Search metrics cache |

### Cache Keys
```
hot_query:{normalized_query}
autocomplete:{entity_type}:{partial_text}
synonyms:all
facet:{entity_type}:{field}:{value}
search_stats:{date}:{hospital_id}
```

### Cache Warmup
```typescript
// On startup, warm popular queries
async warmupCache() {
  const popularQueries = await this.getPopularQueries(100);
  for (const query of popularQueries) {
    const key = `hot_query:${normalize(query)}`;
    if (!(await redis.exists(key))) {
      const results = await this.search(query);
      await redis.setex(key, 300, JSON.stringify(results));
    }
  }
}
```

## Event-Driven Updates

### Event Schema
```typescript
interface IndexingEvent {
  id: string;
  type: 'IndexRequested' | 'IndexCompleted' | 'IndexFailed';
  timestamp: Date;
  payload: {
    entityType: string;
    entityId: string;
    hospitalId?: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    source: string; // 'prisma', 'manual', 'sync'
  };
}
```

### Event Sources

| Source | Events Published |
|--------|-----------------|
| Prisma Middleware | Entity changes → IndexRequested |
| Journey Engine | Journey milestone → IndexRequested |
| Timeline Engine | Timeline event → IndexRequested |
| Notification Engine | Notification status → IndexRequested |
| Manual Trigger | Admin action → IndexRequested |

### Event Queue
```typescript
// BullMQ queue for indexing
const indexingQueue = new Queue('search-indexing', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600 },
  },
});
```

## Monitoring & Alerting

### Key Metrics
- Queue depth (`search-indexing`)
- Index lag (time from entity change to index)
- Search latency (p50, p95, p99)
- Cache hit ratio
- Error rate by entity type

### Alerts
| Metric | Threshold | Action |
|--------|-----------|--------|
| Queue depth | > 10,000 | Page on-call, scale workers |
| Index lag | > 5 min | Check worker health |
| Error rate | > 1% | Review failing entity types |
| Cache hit | < 70% | Review warmup strategy |