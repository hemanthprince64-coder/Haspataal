# Unified Search & Discovery Platform - Definition of Done

## Must Haves

### Code
- [ ] All TypeScript compiles without errors
- [ ] ESLint passes with 0 errors
- [ ] Unit test coverage > 85%
- [ ] Integration test coverage > 80%
- [ ] E2E test coverage > 70%

### Architecture
- [ ] Clean separation: domain → application → infrastructure
- [ ] Event-driven indexing implemented
- [ ] SearchIndexProvider interface with PostgresFtsProvider
- [ ] RLS policies in place for all tables

### Features
- [ ] Global search API endpoints
- [ ] Autocomplete API
- [ ] Search filters and facets
- [ ] Query parsing and sanitization
- [ ] Ranking engine implemented
- [ ] Synonym support

### Security
- [ ] All searches respect hospital boundaries
- [ ] Patient access enforced
- [ ] Search logs scrubbed of PHI
- [ ] No cross-tenant data leaks

### Performance
- [ ] p95 search latency < 100ms (100 concurrent)
- [ ] p95 autocomplete < 50ms
- [ ] Index lag < 500ms

### Documentation
- [ ] API OpenAPI spec
- [ ] Architecture decisions documented
- [ ] RLS policy documentation
- [ ] Admin operation guide

## Nice to Haves

- [ ] OpenSearch provider ready
- [ ] AI-powered query expansion
- [ ] Search analytics dashboard
- [ ] Query popularity tracking
- [ ] Zero-result query suggestions

## Sign-offs Required

- [ ] Search Architect
- [ ] Security Lead
- [ ] Clinical Lead
- [ ] QA Lead