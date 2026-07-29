# Unified Search & Discovery Platform - Testing Strategy

## Unit Tests

### Query Parsing
- Parse simple terms
- Parse quoted phrases
- Parse boolean operators (AND, OR, NOT)
- Parse field filters (type:patient, status:active)
- Synonym expansion edge cases

### Ranking
- TextRank calculation
- RecencyRank decay
- FrequencyRank log scaling
- AuthorityRank weighting
- Combined score formula

### Filtering
- Entity type filter
- Date range filter
- Status filter
- Hospital isolation filter
- Compound filter combinations

### Document Building
- Patient document fields
- Doctor document fields
- Appointment document fields
- Bill document fields

## Integration Tests

### Search Flow
- Search with no filters returns all matching types
- Search with type filter returns only that type
- Search with hospital isolation respects RLS
- Zero-result queries return empty array
- Large result sets paginated correctly

### Indexing Flow
- EntityCreated event → document indexed
- EntityUpdated event → document re-indexed
- EntityDeleted event → document removed
- Synonym changes appear in search

### Performance Tests
- 100 concurrent searches < 200ms avg
- 10K document bulk index < 30s
- Autocomplete response < 50ms

## End-to-End Tests

### User Flows
- Patient searches own appointment
- Doctor searches patient by name
- Admin searches hospital-wide
- Universal search from mobile
- Search with typo tolerance

### Security Tests
- Cross-tenant search blocked
- Unauthorized access denied
- PHI scrubbed from logs

## Test Data Setup

```typescript
// Test factories
const patientFactory = (overrides = {}) => ({
  id: 'patient-1',
  name: 'Test Patient',
  phone: '9876543210',
  ...overrides,
});

const doctorFactory = (overrides = {}) => ({
  id: 'doctor-1',
  name: 'Dr. Test',
  specialty: 'Cardiology',
  ...overrides,
});
```

## Load Testing

| Scenario | Users | Target |
|----------|-------|--------|
| Light load | 10 | p95 < 50ms |
| Medium load | 100 | p95 < 100ms |
| Heavy load | 1000 | Error rate < 1% |

## Test Commands
```bash
npm run test:search -- --coverage
npm run test:search:perf
npm run test:search:e2e
```