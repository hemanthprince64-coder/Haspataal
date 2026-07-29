# Query Engine - Complete Specification

## Query Types

### Natural Search
```
Input: "john cardiology appointment last month"
Processing:
  1. Parse tokens: ["john", "cardiology", "appointment", "last", "month"]
  2. Identify entities: john→patient, cardiology→specialty
  3. Identify intent: appointment search
  4. Identify temporal: last month
Output: Ranked results for patient appointments in cardiology

Query Pattern: Free-form text → semantic tokens
```

### Partial Match
```
Input: "joh"
Processing: ILIKE '%joh%' on title fields
Output: john-smith, john-doe, johnson-physician
```

### Typo Tolerance
```
Input: "patiend"
Processing: 
  1. Levenshtein distance calculation (≤2)
  2. Edit distance score: patient (distance=1)
  3. Boost close matches
Output: patients ranked higher than unrelated terms
```

### Synonyms
```
Input: "htn"
Processing:
  1. Lookup synonym map: ht n → hypertension
  2. Expand query: "htn hypertension"
  3. Include both in search
Output: Results containing either "htn" or "hypertension"

Synonym Sources:
  - Clinical abbreviations (WHO/MOHFW mappings)
  - Hospital-specific synonyms
  - User-defined synonyms
```

## Search Features

### Autocomplete
```
Endpoint: GET /api/search/autocomplete?q=joh
Response:
  - Completion threshold: 3+ chars
  - Max suggestions: 10
  - Cache: 60 seconds
  - Boost: Recent queries first
```

### Suggestions
```
Endpoint: GET /api/search/suggestions?q=john diabetes
Response:
  - "Did you mean: 'cardiology'" (if low results)
  - "Related: 'Hypertension'" (synonym-based)
  - "Popular: 'Medication Refill'" (trending)
```

### Recent Searches
```
Endpoint: GET /api/search/recent?limit=10
Storage: Redis sorted set by timestamp
TTL: 30 days
Privacy: Per-user basis
```

### Saved Searches
```
Endpoint: GET /api/search/bookmarks
Storage: PostgreSQL search_bookmarks table
Fields:
  - id, user_id, name, query, filters, created_at
Use: One-click search for complex queries
```

## Advanced Search

### Boolean Search
```
Operators: AND, OR, NOT (uppercase)
Examples:
  - "diabetes AND medication" → Both terms required
  - "diabetes OR hypertension" → Either term
  - "medication NOT expired" → Exclude expired
Parsing: Convert to tsquery with PostgreSQL operators
```

### Date Range
```
Input: "appointment from 2024-01 to 2024-06"
Processing:
  1. Parse date expressions
  2. Convert to ISO range
  3. Apply WHERE clause: created_at BETWEEN [from, to]
```

### Sorting
```
Options:
  - relevance (default)
  - created_at (ascending/descending)
  - updated_at (ascending/descending)
  - name (alphabetical)
SQL ORDER BY based on sort parameter
```

### Pagination
```
Method: Cursor-based (not offset)
Parameters:
  - limit: 20 (default), max 100
  - cursor: base64-encoded position
Response:
  - results: []
  - nextCursor: string
  - total: integer (if requested)
```

## Query Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Query Engine Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│ Query Input                                                 │
│      ↓                                                      │
│ QueryParser                                                 │
│  - Parse text → tokens                                      │
│  - Extract filters                                          │
│  - Identify temporal expressions                              │
│  - Detect boolean operators                                 │
│      ↓                                                      │
│ SynonymExpander                                             │
│  - Lookup synonyms                                          │
│  - Expand query                                             │
│  - Cache expansion rules                                   │
│      ↓                                                      │
│ RankingEngine                                               │
│  - Calculate relevance score                                │
│  - Apply boosts                                           │
│  - Apply decay rules                                        │
│      ↓                                                      │
│ FilterApplier                                               │
│  - Hospital scope                                           │
│  - Role permissions                                         │
│  - Date range                                               │
│  - Status filters                                           │
│      ↓                                                      │
│ ResultFormatter                                             │
│  - Highlight matches                                        │
│  - Add metadata                                           │
│  - Apply pagination                                         │
└─────────────────────────────────────────────────────────────┘
```

## Query Context

### Hospital Scoped Search
```
Rule: All queries filtered by SET LOCAL hospitable.current_hospital_id
Exception: Super-admin queries (flag to bypass)
```

### Role Based Search
```
Rules Engine:
  - Patient: Can only see own entity_id in filter
  - Doctor: Can see patients via doctor_patient_relationship
  - Staff: Can see department-scoped entities
  - Admin: Full hospital scope
  - Super: All hospitals
```

### Search History
```
Storage: search_logs table
Fields: user_id, query, entity_types, result_count, latency_ms, timestamp, hospital_id
Analytics: Trending queries, zero-results, popular entities
```

### Search Sessions
```
Session ID: UUID per search session
Tracking: Related queries in session
Timeout: 30 minutes
Use: Context-aware suggestions
```

## Query DSL

```typescript
interface SearchQueryDSL {
  text: string;                    // "john diabetes"
  types?: string[];                // ["patient", "appointment"]
  filters?: {
    hospitalId?: string;
    dateRange?: { from: string; to: string };
    status?: string[];
    department?: string[];
    specialty?: string[];
  };
  facets?: string[];               // ["status", "department"]
  sort?: 'relevance' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
  limit?: number;                  // default 20
  cursor?: string;                 // pagination
  highlight?: boolean;             // default true
  synonyms?: boolean;              // default true
}
```

## Error Handling

| Error Type | HTTP Code | Message |
|------------|-----------|---------|
| Missing query | 400 | "Query parameter 'q' required" |
| Invalid filter | 400 | "Invalid filter: {filter}" |
| Unauthorized | 401 | "Authentication required" |
| Forbidden | 403 | "Insufficient permissions" |
| Too many requests | 429 | "Rate limit exceeded" |
| Server error | 500 | "Search service unavailable" |