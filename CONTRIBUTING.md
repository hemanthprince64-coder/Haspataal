# Contributing to Haspataal

Welcome to Haspataal! This guide will help you get started with contributing to our healthcare platform.

<<<<<<< Updated upstream
## Setup

- This is a Turborepo monorepo.
- Use `npm run dev` from the root to start all services.

## Commit Message Convention

Haspataal uses **Conventional Commits** to enforce readable history and automated changelogs. All commits are validated via a Husky `commit-msg` hook.
=======
## Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js**: 18.0.0 or higher
- **npm**: 10.0.0 or higher
- **Docker Desktop**: Required for local database and services
- **Git**: For version control

## Local Development Setup

We use a containerized development environment to ensure parity across team members.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/haspataal/haspataal.git
   cd haspataal
   ```

2. **Setup Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```

3. **One-Command Setup**:
   ```bash
   docker compose up -d
   ```
   *This command starts:*
   - **PostgreSQL**: Primary database for all apps.
   - **Redis**: For background jobs and caching.
   - **Nginx**: Load balancer and reverse proxy.
   - **Auth Service**: Backend authentication microservice.
   - **API Gateway**: Unified entry point for all services.

4. **Install Dependencies & Generate Client**:
   ```bash
   npm install
   npx prisma generate
   ```

5. **Start Turborepo**:
   ```bash
   npm run dev
   ```

## Commit Message Convention
>>>>>>> Stashed changes

Haspataal follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Commits are validated via Husky.

<<<<<<< Updated upstream
### Quick Example

`feat(patient): add MedChat AI triage component`
=======
### Haspataal-Specific Examples:
- `feat(patient): add ABHA health ID linking flow`
- `fix(hospital): correct bcrypt comparison in login service`
- `security(auth): add rate limiting to registration endpoints`
- `refactor(db): extract appointment repository from services.ts`
- `test(booking): add integration test for double-booking prevention`
- `docs(api): update documentation for patient registration`
- `chore(deps): bump next.js version to 16.3.0`
- `infra(ci): update github actions workflow for security scans`
- `feat(admin): implement audit logs for hospital verification`
- `fix(gateway): resolve CORS issues for mobile app requests`
>>>>>>> Stashed changes

## Branch Naming Policy
- **Features**: `feature/HMS-{ticket}-{short-description}` (e.g., `feature/HMS-123-abha-linking`)
- **Bug Fixes**: `fix/HMS-{ticket}-{description}` (e.g., `fix/HMS-456-login-crash`)

<<<<<<< Updated upstream
## Pull Requests

All pull requests must use our tailored template which checks for:

1. **Schema Changes** (Migrations, Enum renames)
2. **Breaking Changes**
3. **Security Implications** (RLS, Auth)
4. **Test Coverage**
=======
## Pull Request Process
1. Create a branch from `main`.
2. Ensure all tests pass locally.
3. Submit a PR using our [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
4. **Approval Requirement**: All PRs require at least **2 approvals** from senior engineers before merging.
5. All CI status checks (Quality, Test, Security) must pass.
>>>>>>> Stashed changes

## Testing
- **Run all tests**: `npx vitest`
- **Run with coverage**: `npx vitest --coverage`
- **Verbose output**: `npx vitest run --reporter=verbose`
- **Targeted tests**: `npx vitest apps/patient-portal`

## Database Migrations
Never modify `prisma/schema.prisma` without creating a migration.
```bash
npx prisma migrate dev --name <short_description>
```

## Troubleshooting
- **Port Conflicts**: Ensure ports 3000, 3001, 5432, and 6379 are free.
- **Docker Issues**: If the database fails to start, try `docker compose down -v` to clear volumes.
- **Type Errors**: If types seem outdated, run `npx prisma generate` to refresh the Prisma client.
