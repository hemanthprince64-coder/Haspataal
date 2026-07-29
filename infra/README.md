# Infrastructure & Deployment (`infra/`)

This directory is the central location for all infrastructure-as-code, deployment configuration, and operational scripts for the Haspataal platform.

*Note: For the duration of the MVP development phase, core Docker and Nginx files remain in the repository root to avoid disrupting existing development workflows. They will be migrated here post-MVP.*

## Directory Structure

### `sql/`
Contains standalone SQL migration scripts, index optimization scripts, Row Level Security (RLS) audits, and baseline schemas.
- **SQL Migrations**: Managed via Supabase and Prisma. Standalone SQL scripts (like `baseline.sql` or `optimize_indexes.sql`) are stored here.
- **RLS Policies**: Security scripts to enforce multi-tenant isolation (`enable_rls_*.sql`).

## Deferred Migrations (Post-MVP)

Once the MVP phase is complete, the following configurations will be moved into this directory:

### Docker Layout
- `docker-compose.yml`, `docker-compose.prod.yml`, and environment-specific overrides.
- `Dockerfile` definitions for all microservices.

### Nginx Configuration
- `nginx.conf` and `nginx.dev.conf` configurations for the API Gateway proxy.

### Monitoring
- Future configurations for Prometheus, Grafana, or Datadog will be housed here (`infra/monitoring/`).

### Deployment Flow
- The deployment architecture relies on strict immutability. Post-MVP, CI/CD pipeline definitions (e.g., GitHub Actions, Makefile scripts) will reference the configurations within this folder exclusively.
