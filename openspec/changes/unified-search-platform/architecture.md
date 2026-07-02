# Unified Search & Discovery Platform - Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Unified Search & Discovery Platform         │
├─────────────────────────────────────────────────────────────────┤
│  API Layer                                                         │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Search API  │ │ Autocomplete │ │ Suggestions │ │ Health API  │  │
│  └──────┬──────┘ └──────┬───────┘ └─────┬──────┘ └─────┬──────┘  │
├─────────┼────────────────┼───────────────┼─────────────┼──────────┤
│  Search Service Layer                                          │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Query Parser│ │ Rank Engine  │ │ Filter Eng. │ │ Facet Eng.  │  │
│  └──────┬──────┘ └──────┬───────┘ └─────┬──────┘ └─────┬──────┘  │
├─────────┼────────────────┼───────────────┼─────────────┼──────────┤
│  Index Abstraction Layer                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │           SearchIndexProvider (Interface)                   │ │
│  │  ┌──────────────────┐        ┌──────────────────────────┐  │ │
│  │  │ PostgreSQL FTS   │        │ OpenSearch/Elasticsearch │  │ │
│  │  │ (Launch Provider)│        │ (Future Provider)        │  │ │
│  │  └──────────────────┘        └──────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  Indexing Layer                                                    │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Event       │ │ Document     │ │ Synonym    │ │ Reindex    │  │
│  │ Consumer    │ │ Builder      │ │ Manager    │ │ Scheduler  │  │
│  └──────┬──────┘ └──────┬───────┘ └─────┬──────┘ └─────┬──────┘  │
├─────────┼────────────────┼───────────────┼─────────────┼──────────┤
│  Data Layer (PostgreSQL with FTS / OpenSearch)                  │
│  ┌─────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Searchable  │ │ tsvector     │ │ GIN Index  │ │ RLS        │  │
│  │ Tables      │ │ Columns      │ │            │ │ Policies   │  │
│  └─────────────┘ └──────────────┘ └────────────┘ └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
packages/search/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Main exports
│   ├── types.ts                    # TypeScript interfaces
│   ├── config.ts                   # Configuration
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── SearchableEntity.ts
│   │   │   ├── SearchResult.ts
│   │   │   ├── SearchQuery.ts
│   │   │   ├── SearchFacet.ts
│   │   │   ├── AutocompleteSuggestion.ts
│   │   │   └── Synonym.ts
│   │   ├── value-objects/
│   │   │   ├── SearchRank.ts
│   │   │   ├── SearchFilter.ts
│   │   │   └── SearchHighlight.ts
│   │   └── events/
│   │       ├── IndexingRequested.ts
│   │       ├── DocumentIndexed.ts
│   │       └── ReindexCompleted.ts
│   │
│   ├── application/
│   │   ├── services/
│   │   │   ├── SearchService.ts
│   │   │   ├── AutocompleteService.ts
│   │   │   ├── SuggestionService.ts
│   │   │   ├── IndexingService.ts
│   │   │   ├── RankingService.ts
│   │   │   ├── FilterService.ts
│   │   │   └── FacetService.ts
│   │   ├── queries/
│   │   │   ├── SearchQueryHandler.ts
│   │   │   └── AutocompleteQueryHandler.ts
│   │   └── commands/
│   │       ├── IndexDocumentCommand.ts
│   │       ├── ReindexEntityCommand.ts
│   │       └── ManageSynonymCommand.ts
│   │
│   ├── infrastructure/
│   │   ├── index-providers/
│   │   │   ├── SearchIndexProvider.ts       # Interface
│   │   │   ├── PostgresFtsProvider.ts       # Launch implementation
│   │   │   └── OpenSearchProvider.ts        # Future implementation
│   │   ├── repositories/
│   │   │   ├── SynonymRepository.ts
│   │   │   └── SearchLogRepository.ts
│   │   ├── event-handlers/
│   │   │   ├── EntityCreatedHandler.ts
│   │   │   ├── EntityUpdatedHandler.ts
│   │   │   └── EntityDeletedHandler.ts
│   │   └── persistence/
│   │       ├── SearchDocumentBuilder.ts
│   │       └── SearchDocumentMapper.ts
│   │
│   ├── interfaces/
│   │   ├── http/
│   │   │   ├── SearchController.ts
│   │   │   ├── AutocompleteController.ts
│   │   │   └── AdminController.ts
│   │   └── grpc/ (future)
│   │
│   └── workers/
│       ├── indexing-worker.ts
│       ├── reindex-scheduler.ts
│       └── synonym-sync-worker.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── scripts/
    ├── reindex-all.ts
    └── sync-synonyms.ts

packages/search-client/          # Client SDK for other modules
├── package.json
├── src/
│   ├── SearchClient.ts
│   ├── types.ts
│   └── index.ts

apps/api-gateway/
├── src/
│   ├── routes/
│   │   └── search.ts           # /api/search/*
│   └── middleware/
│       └── searchAuth.ts       # RLS enforcement

apps/admin-panel/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── search/
│   │           ├── page.tsx
│   │           ├── IndexManager.tsx
│   │           ├── SynonymManager.tsx
│   │           └── SearchAnalytics.tsx
```

## Shared Packages

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `@haspataal/search` | Core search engine | @haspataal/db, bullmq, zod |
| `@haspataal/search-client` | Client SDK for modules | @haspataal/search (types only) |
| `@haspataal/db` | Database layer | @prisma/client |
| `@haspataal/notify` | Search notifications | - |
| `@haspataal/events` | Event bus | - |

## Database Schema (Prisma)

```prisma
model SearchableEntity {
  id            String   @id @default(uuid())
  entityType    String   // Patient, Doctor, Hospital, Appointment, etc.
  entityId      String   // Original entity ID
  hospitalId    String?  @map("hospital_id")
  title         String   // Primary searchable text
  content       String?  // Full searchable content
  metadata      Json?    // Additional filterable fields
  searchVector  Unsupported("tsvector")? @map("search_vector")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([entityType])
  @@index([hospitalId])
  @@index([entityId])
  @@index([searchVector], type: Gin)
  @@map("searchable_entities")
}

model SearchSynonym {
  id          String   @id @default(uuid())
  term        String   @unique
  synonyms    String[] // Array of synonyms
  category    String?  // medical, administrative, etc.
  hospitalId  String?  @map("hospital_id")
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([hospitalId])
  @@map("search_synonyms")
}

model SearchLog {
  id          String   @id @default(uuid())
  hospitalId  String?  @map("hospital_id")
  userId      String?  @map("user_id")
  query       String
  entityTypes String[] // Filtered types
  resultCount Int      @default(0) @map("result_count")
  latencyMs   Int      @map("latency_ms")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([hospitalId])
  @@index([createdAt])
  @@map("search_logs")
}
```

## Search Strategy

### Indexing Approach
1. **Event-Driven**: Every entity change → BullMQ job → Document builder → Index provider
2. **Document Building**: Entity-specific mappers create searchable documents
3. **Synonym Expansion**: Query-time synonym expansion via PostgreSQL `tsquery` rewrite
3. **Bulk Reindex**: Scheduled nightly full reindex + on-demand manual trigger

### Document Structure
```typescript
interface SearchDocument {
  id: string;              // searchable_entities.id
  entityType: string;      // Patient, Doctor, etc.
  entityId: string;        // Original entity ID
  hospitalId: string;      // Tenant boundary
  title: string;           // Primary display (name, code, etc.)
  content: string;         // Full text for search
  metadata: {              // Filterable fields
    status?: string;
    department?: string;
    specialty?: string;
    dateRange?: { from: Date; to: Date };
    // ... entity-specific fields
  };
  searchVector: string;    // PostgreSQL tsvector
}
```

## Ranking Strategy

### Default Ranking Formula
```
Score = 0.4 * TextRank + 0.3 * RecencyRank + 0.2 * FrequencyRank + 0.1 * AuthorityRank
```

| Component | Weight | Calculation |
|-----------|--------|-------------|
| TextRank | 40% | PostgreSQL `ts_rank_cd` with cover density |
| RecencyRank | 30% | `1 / (1 + days_since_update)` |
| FrequencyRank | 20% | Log of access count (from SearchLog) |
| AuthorityRank | 10% | Entity type priority (Doctor > Patient > Bill) |

### Boosts
- Exact match boost: 2.0x
- Title match boost: 1.5x
- Prefix match boost: 1.2x
- Hospital-scoped boost: implicit via RLS

## Security Model

### Row Level Security
- All `searchable_entities` queries filtered by `hospital_id = current_setting('hospitable.current_hospital_id')`
- Patient search restricted to doctor's assigned patients
- Patient self-search restricted to own `entity_id`

### Query Enforcement
```sql
-- Every search query wrapped with
SET LOCAL hospitable.current_hospital_id = $hospitalId;
-- RLS policies enforce tenant isolation automatically
```

## Acceptance Criteria

| Criterion | Target |
|-----------|--------|
| Search latency (p95) | < 100ms |
| Autocomplete latency (p95) | < 50ms |
| Index lag (create/update) | < 500ms |
| Index lag (delete) | < 100ms |
| Zero-result rate | < 10% |
| Search relevance (manual eval) | > 85% relevant in top 5 |
| Multi-tenant isolation | Zero cross-tenant leaks in audit |
| Uptime | 99.9% |