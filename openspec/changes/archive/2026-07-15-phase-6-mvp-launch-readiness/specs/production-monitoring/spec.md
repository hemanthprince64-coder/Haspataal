## ADDED Requirements

### Requirement: OpenTelemetry distributed tracing
The platform SHALL export distributed traces via OpenTelemetry for all service-to-service calls and database queries.

#### Scenario: Distributed trace visibility
- **WHEN** request flows through gateway → auth → core → database
- **THEN** complete trace is visible in observability backend

### Requirement: Prometheus metrics
All services SHALL expose Prometheus metrics endpoint (`/metrics`) with standard HTTP metrics, business metrics, and queue metrics.

#### Scenario: Prometheus metrics endpoint
- **WHEN** Prometheus scrapes `/metrics` endpoint
- **THEN** all required metrics are present with correct labels

### Requirement: Grafana dashboards
Grafana dashboards SHALL be provided for: API latency, error rates, queue depth, consumer lag, database performance, and system resources.

#### Scenario: Dashboard availability
- **WHEN** operations team accesses Grafana
- **THEN** dashboards for all key metrics are available and populated

### Requirement: Structured logs
All services SHALL emit structured JSON logs with correlation IDs, service name, log level, timestamp, and PHI-redacted fields.

#### Scenario: Structured log format
- **WHEN** service emits log
- **THEN** log contains correlation_id, service, level, timestamp in JSON format

### Requirement: Health endpoints
All services SHALL expose `/api/health` endpoint returning health status, dependencies status, and version.

#### Scenario: Health check
- **WHEN** load balancer probes `/api/health`
- **THEN** endpoint returns 200 with dependency status

### Requirement: Readiness probes
Services SHALL expose readiness endpoint that verifies database connectivity, Redis connectivity, and required dependencies.

#### Scenario: Readiness probe
- **WHEN** Kubernetes readiness probe checks endpoint
- **THEN** endpoint returns 200 only when all dependencies are healthy

### Requirement: Liveness probes
Services SHALL expose liveness endpoint that verifies the service process is running and not deadlocked.

#### Scenario: Liveness probe
- **WHEN** Kubernetes liveness probe checks endpoint
- **THEN** endpoint returns 200 if process is alive

### Requirement: Consumer lag metrics
BullMQ consumer lag SHALL be exported as Prometheus metric with queue name and consumer name labels.

#### Scenario: Consumer lag metric
- **WHEN** consumer falls behind by 50 messages
- **THEN** `bullmq_consumer_lag` metric shows value 50

### Requirement: Queue metrics
Queue depth, processing rate, failure rate, and wait time SHALL be exported as Prometheus metrics.

#### Scenario: Queue metrics
- **WHEN** 100 jobs are queued
- **THEN** `bullmq_queue_depth` metric shows value 100

### Requirement: Authorization metrics
Authorization decisions (allow/deny/break-glass) SHALL be counted and exported as Prometheus metrics by role and action.

#### Scenario: Authorization metrics
- **WHEN** 10 authorization checks result in 7 allows and 3 denials
- **THEN** `haspataal_authz_decisions_total` metric shows correct counts

### Requirement: Database metrics
Database connection pool utilization, query latency, and error rates SHALL be exported as Prometheus metrics.

#### Scenario: Database metrics
- **WHEN** database connection pool is at 80% capacity
- **THEN** `db_connection_pool_utilization` metric shows 0.8

### Requirement: Alert rules
Alert rules SHALL be defined for: high error rate (>5%), high latency (P95 >500ms), consumer lag (>10s), database connection exhaustion, disk usage (>80%), and memory pressure.

#### Scenario: Alert firing
- **WHEN** API error rate exceeds 5% for 2 minutes
- **THEN** alert fires and notification is sent to on-call
