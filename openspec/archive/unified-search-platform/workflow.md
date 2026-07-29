# Unified Search & Discovery Platform - Workflow & Operations

## Search Workflow

```mermaid
sequenceDiagram
    participant User
    participant SearchAPI
    participant SearchService
    participant IndexProvider
    participant PostgreSQL

    User->>SearchAPI: GET /api/search?q=john&types=patient,doctor
    SearchAPI->>SearchService: search(query, filters, facets)
    SearchService->>SearchService: parseQuery()
    SearchService->>SearchService: expandSynonyms()
    SearchService->>SearchService: buildFilters()
    SearchService->>IndexProvider: search(query, filters)
    IndexProvider->>PostgreSQL: SELECT * FROM searchable_entities WHERE searchVector @@ to_tsquery()
    PostgreSQL-->>IndexProvider: ranked results
    IndexProvider-->>SearchService: raw results
    SearchService->>SearchService: applyRanking()
    SearchService->>SearchService: applyFacets()
    SearchService-->>SearchAPI: { results, facets, total, latency }
    SearchAPI-->>User: JSON response
```

## Indexing Workflow

```mermaid
sequenceDiagram
    participant Module
    participant EventBus
    participant IndexingWorker
    participant DocumentBuilder
    participant IndexProvider
    participant PostgreSQL

    Module->>EventBus: EntityCreated/Updated/Deleted
    EventBus->>IndexingWorker: IndexingRequested event
    IndexingWorker->>DocumentBuilder: buildDocument(entity)
    DocumentBuilder-->>IndexingWorker: SearchDocument
    IndexingWorker->>IndexProvider: index(document)
    IndexProvider->>PostgreSQL: UPSERT searchable_entities
    PostgreSQL-->>IndexProvider: success
    IndexProvider-->>IndexingWorker: result
    IndexingWorker-->>EventBus: DocumentIndexed event
```

## Reindex Workflow

```mermaid
flowchart TD
    A[Manual Trigger / Nightly Schedule] --> B{Full or Incremental?}
    B -->|Full| C[Scan All Searchable Tables]
    B -->|Incremental| D[Scan Updated Since Last Reindex]
    C --> E[Batch Process 1000 rows]
    D --> E
    E --> F[Build Documents]
    F --> G[Bulk Upsert to Index]
    G --> H{More Batches?}
    H -->|Yes| E
    H -->|No| I[Update Reindex Timestamp]
    I --> J[Log Completion]
```

## Autocomplete Workflow

```mermaid
sequenceDiagram
    participant User
    participant SearchAPI
    participant AutocompleteService
    participant IndexProvider

    User->>SearchAPI: GET /api/search/autocomplete?q=joh
    SearchAPI->>AutocompleteService: getSuggestions("joh", limit=10)
    AutocompleteService->>IndexProvider: prefixSearch("joh")
    IndexProvider->>IndexProvider: SELECT title FROM searchable_entities WHERE title ILIKE 'joh%' LIMIT 10
    IndexProvider-->>AutocompleteService: suggestions
    AutocompleteService-->>SearchAPI: [{text, type, count}]
    SearchAPI-->>User: JSON response
```

## Synonym Management Workflow

```mermaid
flowchart TD
    A[Admin Adds Synonym] --> B{Validate}
    B -->|Valid| C[Store in search_synonyms]
    B -->|Invalid| D[Return Error]
    C --> E[Publish SynonymUpdated Event]
    E --> F[Workers Reload Synonym Cache]
    F --> G[Query Expansion Active]
    
    H[Query Received] --> I[Expand with Synonyms]
    I --> J[Execute Expanded Query]
    J --> K[Return Results]
```

## Error Handling

| Scenario | Handling |
|----------|----------|
| IndexProvider unavailable | Fallback to cached results, queue for retry |
| Document build failure | Log error, dead letter queue, alert |
| Synonym expansion timeout | Skip expansion, search original query |
| Rank calculation error | Use default ranking, log for review |
| RLS policy violation | Deny query, log security event |

## Performance Targets

| Operation | Target | Measurement |
|----------|--------|-------------|
| Search query | p95 < 100ms | Percentile from SearchLog |
| Autocomplete | p95 < 50ms | Percentile from SearchLog |
| Index write | < 200ms | BullMQ job duration |
| Full reindex (1M docs) | < 30 min | Job duration |
| Synonym reload | < 5s | Worker reload time |

## Monitoring & Alerts

| Metric | Alert Threshold |
|--------|-----------------|
| Search latency p95 | > 200ms for 5 min |
| Index lag | > 5 min |
| Zero-result rate | > 20% for 10 min |
| Indexing queue depth | > 10,000 |
| Error rate | > 1% for 5 min |