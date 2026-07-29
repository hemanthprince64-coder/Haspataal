# Deployment & Infrastructure

## Overview
Infrastructure documentation covering system architecture, Docker configuration, CI/CD pipeline, monitoring, logging, tracing, health checks, backups, restore procedures, disaster recovery, scaling, feature flags, release process, rollback, and production checklist.

## Architecture

### System Overview
```
Internet → API Gateway → Load Balancer → Next.js Apps (Containers) → PostgreSQL/Redis
                                      ↓
                              BullMQ Workers
                                      ↓
                              Supabase Storage
```

### Components
- **API Gateway**: Nginx/OpenResty
- **Applications**: Next.js 15 (patient-portal, hospital-hms, admin-panel)
- **Database**: PostgreSQL 15 with Supabase
- **Cache/Queue**: Redis 7 (Upstash/Self-hosted)
- **Storage**: Supabase S3-compatible
- **Workers**: BullMQ queue processors
- **Discovery Queue**: Search index refresh, availability computation

## Docker Configuration

### Base Images
- **Application**: node:18-alpine
- **Worker**: node:18-alpine
- **Database**: postgres:15-alpine
- **Redis**: redis:7-alpine

### Multi-stage Build
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json turbo.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage  
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```yaml
# Required
DATABASE_URL: PostgreSQL connection string
REDIS_URL: Redis connection string
NEXTAUTH_SECRET: JWT signing secret
NEXTAUTH_URL: Application URL

# Optional
SENTRY_DSN: Error tracking
LOG_LEVEL: debug/info/warn/error
```

## CI/CD Pipeline

### GitHub Actions Workflows

#### Lint & Test
```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
  test:
    runs-on: ubuntu-latest
    services:
      postgres: { image: postgres:15 }
      redis: { image: redis:7 }
    steps:
      - uses: actions/checkout@v4
      - run: npm run test
```

#### Build & Deploy
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t haspataal/app .
      - run: docker push registry.haspataal.com
```

### Blue-Green Deployment
- **Strategy**: Two environments (blue/green)
- **Switch**: DNS/Traffic routing
- **Rollback**: Instant switch back
- **Testing**: Promote only after health checks

## Monitoring

### Health Checks
| Endpoint | Purpose |
|----------|---------|
| GET /api/health | Application health |
| GET /api/health/db | Database connectivity |
| GET /api/health/redis | Redis connectivity |
| GET /api/health/storage | Storage accessibility |

### Metrics
- **Prometheus**: Request counts, latencies, errors
- **Grafana**: Dashboards for all services
- **AlertManager**: Alert routing and deduplication

### SLA Monitoring
- 99.9% uptime target
- 200ms p95 latency target
- 99% success rate target

## Logging

### Log Levels
- **Error**: System errors
- **Warn**: Warning conditions
- **Info**: General operations
- **Debug**: Development only

### Log Format
```json
{
  "timestamp": "2026-06-29T21:00:00Z",
  "level": "info",
  "service": "hospital-hms",
  "traceId": "uuid",
  "userId": "uuid",
  "action": "PATIENT_CREATE",
  "message": "Patient registered successfully"
}
```

### Central Logging
- **Provider**: ELK Stack or Loki
- **Retention**: 90 days hot, 2 years cold
- **Search**: Kibana/Grafana

## Tracing

### Trace ID Propagation
- Generated at API Gateway
- Passed via `x-trace-id` header
- Logged with every operation
- Linked to user/session

### Span Tracking
```
Gateway → Booking API → BullMQ Queue → Notification Service → WhatsApp API
```

### Correlation
- All logs include trace ID
- Distributed tracing enabled
- Performance bottleneck identification

## Backups

### Database Backups
- **Frequency**: Daily full, hourly incremental
- **Storage**: Encrypted S3 bucket
- **Retention**: 30 days
- **Testing**: Weekly restore tests

### Application Backups
- **Code**: Git repository
- **Config**: Environment variable snapshots
- **Certificates**: PKI backup

### Storage Backups
- **Files**: Cross-region replication
- **Documents**: Versioned storage
- **Audit**: Immutable backups

## Restore Procedures

### Database Restore
```bash
# 1. Stop application
docker-compose stop app

# 2. Restore from backup
pg_restore --dbname=$DATABASE_URL backup.sql

# 3. Verify data
npm run db:verify

# 4. Start application
docker-compose start app
```

### Point-in-Time Recovery
- WAL archive maintained
- Recovery to specific timestamp
- Tested monthly

## Disaster Recovery

### RTO/RPO
- **RTO**: 30 minutes (critical systems)
- **RPO**: 1 hour (data loss window)

### DR Sites
- **Primary**: AWS ap-south-1
- **Secondary**: AWS us-east-1
- **Failover**: Automated with 5-minute detection

### Runbook
# DR-001: Database Failure
1. Alert triggered
2. Check primary connectivity
3. Promote read replica if available
4. Update connection strings
5. Resume operations

## Scaling

### Horizontal Scaling
- **App Servers**: Auto-scaling groups
- **Workers**: Queue-based scaling
- **Database**: Read replicas

### Vertical Scaling
- **CPU/Memory**: Instance size upgrades
- **Database**: Shared to dedicated

### Caching
- **Redis**: Session, rate limit, cache
- **CDN**: Static assets
- **Browser**: SWR caching

## Feature Flags

### Configuration
| Flag | Default | Purpose |
|------|---------|---------|
| ai_assistant | false | Enable AI features |
| teleconsultation | true | Video calls |
| emergency_access | true | ER overrides |
| new_booking_flow | false | Beta booking UI |

### Tenant Scoping
- Global defaults
- Hospital overrides
- Doctor overrides
- Gradual rollout

## Release Process

### Pre-deployment
- [ ] Code review completed
- [ ] Tests passing (unit/integration/e2e)
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Migration tested

### Deployment
1. Merge to main
2. CI/CD builds and deploys to staging
3. Smoke tests on staging
4. Deploy to production (blue-green)
5. Health checks
6. Monitor for 30 minutes

### Post-deployment
- [ ] Verify all endpoints
- [ ] Check error rates
- [ ] Confirm metrics
- [ ] Update changelog

## Rollback

### Automated Rollback
- Health check failure → rollback
- Error rate > 5% → rollback
- Latency > 2x baseline → rollback

### Manual Rollback
```bash
# Switch traffic back
terraform apply -var="active_environment=blue"

# Or promote previous version
git revert --no-commit HEAD
git commit -m "Revert to previous version"
```

## Production Checklist

### Before Go-Live
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Database migrations applied
- [ ] Redis connectivity verified
- [ ] Storage buckets configured
- [ ] CDN caching enabled
- [ ] Monitoring alerts configured
- [ ] Backup schedules active
- [ ] DR tested
- [ ] Security scan passed
- [ ] Performance tested
- [ ] Load tested