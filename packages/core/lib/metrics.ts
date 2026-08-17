import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export const registry = new Registry();

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry],
});

export const authzDecisionsTotal = new Counter({
  name: 'haspataal_authz_decisions_total',
  help: 'Total authorization decisions',
  labelNames: ['role', 'action', 'decision'],
  registers: [registry],
});

export const bullmqQueueDepth = new Gauge({
  name: 'bullmq_queue_depth',
  help: 'Current depth of BullMQ queues',
  labelNames: ['queue_name'],
  registers: [registry],
});

export const bullmqConsumerLag = new Gauge({
  name: 'bullmq_consumer_lag',
  help: 'Consumer lag in messages',
  labelNames: ['queue_name', 'consumer_name'],
  registers: [registry],
});

export const bullmqProcessingRate = new Gauge({
  name: 'bullmq_processing_rate',
  help: 'Processing rate in messages per second',
  labelNames: ['queue_name'],
  registers: [registry],
});

export const bullmqFailureRate = new Gauge({
  name: 'bullmq_failure_rate',
  help: 'Failure rate as percentage',
  labelNames: ['queue_name'],
  registers: [registry],
});

export const bullmqWaitTime = new Histogram({
  name: 'bullmq_wait_time_seconds',
  help: 'Job wait time in seconds',
  labelNames: ['queue_name'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60],
  registers: [registry],
});

export const dbConnectionPoolUtilization = new Gauge({
  name: 'db_connection_pool_utilization',
  help: 'Database connection pool utilization (0-1)',
  labelNames: ['pool_name'],
  registers: [registry],
});

export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [registry],
});

export const dbErrorsTotal = new Counter({
  name: 'db_errors_total',
  help: 'Total database errors',
  labelNames: ['operation', 'table', 'error_type'],
  registers: [registry],
});

export const outboxEventsTotal = new Counter({
  name: 'outbox_events_total',
  help: 'Total outbox events by status',
  labelNames: ['status'],
  registers: [registry],
});

export const outboxProcessingDuration = new Histogram({
  name: 'outbox_processing_duration_seconds',
  help: 'Outbox event processing duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [registry],
});

export const appointmentsCreatedCounter = new Counter({
  name: 'appointments_created_total',
  help: 'Total appointments created',
  labelNames: ['status', 'hospitalId'],
  registers: [registry],
});

export const hospitalRegistrationsCounter = new Counter({
  name: 'hospital_registrations_total',
  help: 'Total hospitals registered',
  labelNames: ['status'],
  registers: [registry],
});
