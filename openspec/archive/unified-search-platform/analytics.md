# Search Analytics - Complete Specification

## Metrics to Track

### Core Search Metrics
| Metric | Description | Collection |
|--------|-----------|----------|
| `search_total` | Total searches executed | Counter |
| `search_errors` | Failed searches | Counter |
| `search_zero_results` | Searches with 0 results | Counter |
| `search_avg_latency` | Average response time | Histogram (p50, p95, p99) |
| `search_ttr` | Time to first result | Histogram |

### Entity-Specific Metrics
| Metric | Description |
|--------|-------------|
| `searches_patient` | Patient searches executed |
| `searches_doctor` | Doctor searches executed |
| `searches_hospital` | Hospital searches executed |
| `searches_medicine` | Medicine searches executed |
| `searches_journey` | Care journey searches executed |
| `searches_bill` | Bill searches executed |
| `searches_lab` | Lab order searches executed |
| `searches_radiology` | Radiology searches executed |

### User Behavior Metrics
| Metric | Description |
|--------|-------------|
| `search_ctr` | Click-through rate on results |
| `search_click_position` | Average click position (1-indexed) |
| `search_abandon_rate` | Searches with no clicks |
| `search_refinement_rate` | Searches followed by refined query |

### Performance Metrics
| Metric | Target | Alert Threshold |
|--------|--------|---------------|
| `indexed_docs_total` | Growing | |
| `index_lag_seconds` | < 300s | > 600s |
| `queue_depth` | < 1000 | > 10000 |
| `cache_hit_ratio` | > 70% | < 50% |

## Dashboards

### Admin Search Analytics Dashboard
```typescript
<Dashboard name="Search Analytics">
  <Grid columns={4}>
    <KPI title="Total Searches Today" value={todayCount} />
    <KPI title="Avg. Latency" value={`${avgLatency}ms`} trend={latencyTrend} />
    <KPI title="Zero Results Rate" value={`${zeroRate}%`} trend={zeroTrend} />
    <KPI title="Click Through Rate" value={`${ctr}%`} trend={ctrTrend} />
  </Grid>

  <Tabs>
    <Tab label="Popular Queries">
      <Table data={popularQueries}>
        <Column field="query" label="Query" />
        <Column field="count" label="Count" />
        <Column field="change" label="Change %" />
      </Table>
    </Tab>
    
    <Tab label="Entity Performance">
      <BarChart data={entityMetrics}>
        <Bar field="searches" label="Volume" />
        <Bar field="avgLatency" label="Avg Latency" />
        <Bar field="ctr" label="CTR" />
      </BarChart>
    </Tab>
    
    <Tab label="Trend Analysis">
      <LineChart data={trends}>
        <Line field="volume" label="Volume" />
        <Line field="latency" label="Latency" />
      </LineChart>
    </Tab>
  </Tabs>
</Dashboard>
```

### Entity-Specific Dashboards

#### Patient Search Dashboard
```
Metrics:
- total_searches: 12,050
- avg_rank_position: 1.8
- zero_results_rate: 2.1%
- most_common_filters: [status: active, age_group: adult]
- top_queries: ["diabetes", "hypertension", "follow up"]
- ctr_by_time: { morning: 72%, afternoon: 65%, evening: 58% }
```

#### Doctor Search Dashboard
```
Metrics:
- total_searches: 8,420
- avg_rank_position: 2.3
- appointment_type_filter: 65%
- specialty_filter: 45%
- ctr: 78%
```

#### Journey Search Dashboard
```
Metrics:
- total_searches: 1,230
- active_journeys_searched: 890
- milestone_completion_correlation: 0.75
- avg_completion_time_saved: 2.3 days
```

### Admin Operations Dashboard
```typescript
<Dashboard name="Search Operations">
  <Grid columns={3}>
    <KPI title="Index Size" value="2.4GB" />
    <KPI title="Document Count" value="1.2M" />
    <KPI title="Queue Depth" value={queueDepth} />
  </Grid>

  <Alerts>
    <Alert if={indexLag > 600} severity="critical">
      Index lag exceeds threshold
    </Alert>
    <Alert if={cacheHit < 0.5} severity="warning">
      Cache performance degraded
    </Alert>
  </Alerts>

  <Logs>
    <LogTable data={indexLogs} />
  </Logs>
</Dashboard>
```

## ADMIN.md Updates

```markdown
# Search Platform Administration

## Monitoring
- Search volume: Check Grafana dashboard
- Latency alerts: PagerDuty on > 200ms p95
- Zero-result alerts: Slack on > 15% rate
- Index lag alerts: Ops on > 5 min

## Operations
### Reindex Commands
```bash
# Full reindex
npm run search:reindex -- --full

# Entity-specific reindex
npm run search:reindex -- --entity=patient

# Check status
npm run search:status
```

### Cache Management
```bash
# Clear autocomplete cache
redis-cli KEYS "autocomplete:*" | xargs redis-cli DEL

# Reload synonyms
npm run search:synonyms:refresh
```

## Troubleshooting
| Symptom | Check | Action |
|---------|-------|--------|
| Slow searches | `search_avg_latency` | Scale worker pools |
| Zero results | `search_zero_results` | Check indexer |
| Wrong results | Review ranking logs | Adjust weights |
```

## OpenSpec Analytics Events

```typescript
// Events published to analytics stream
interface SearchMetricsEvent {
  type: 'SEARCH_EXECUTED';
  query: string;
  types: string[];
  userId: string;
  hospitalId: string;
  latencyMs: number;
  resultCount: number;
  clicked: boolean;
  clickedPosition?: number;
  timestamp: string;
}

interface IndexMetricsEvent {
  type: 'INDEX_OPERATION';
  entityType: string;
  entityId: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  durationMs: number;
  success: boolean;
  timestamp: string;
}

interface RankingMetricsEvent {
  type: 'RANKING_CALCULATED';
  query: string;
  entityType: string;
  entityId: string;
  scores: Record<string, number>;
  finalScore: number;
  boost: number;
  rank: number;
  timestamp: string;
}
```

## Business KPIs

### Clinical Outcomes
| KPI | Formula | Target |
|-----|---------|--------|
| Care Journey Completion | journeys_completed / journeys_started | > 85% |
| Appointment Efficiency | avg_search_time_to_book | < 60s |
| Clinical Discovery | avg_relevant_results / total_results | > 90% |

### Operational Metrics
| KPI | Formula | Target |
|-----|---------|--------|
| Staff Productivity | searches_per_hour / staff_count | < 50 |
| System Cost | index_size_gb * 0.02 | < $500/month |
| User Satisfaction | (positive_feedback / total) | > 95% |