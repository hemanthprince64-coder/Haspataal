# Secrets Management Strategy for Haspataal

To achieve "Enterprise-Ready" status, Haspataal must move away from static `.env` files in production.

## 1. Current State (Risky)
- Secrets are stored in `.env` files on the production server.
- Risk: Files can be accidentally leaked, backed up insecurely, or accessed by unauthorized users on the server.

## 2. Target State (Secure)
We recommend integrating a dedicated **Secrets Vault** (e.g., Doppler, AWS Secrets Manager, or HashiCorp Vault).

### Key Benefits
- **Centralized Control**: Rotate database passwords or API keys in one place.
- **Environment Injector**: Secrets are injected into the process memory at runtime, never touching the disk.
- **Audit Trails**: Track who accessed which secret and when.

### Implementation Pattern (Doppler Example)
1.  Remove all sensitive keys from `.env.production`.
2.  Install the Doppler CLI on the production server.
3.  Update the `docker-compose.yml` or deployment script:
    ```bash
    doppler run -- docker compose up -d
    ```

## 3. Mandatory Secrets to Move
- `DATABASE_URL` / `SUPABASE_SECRET_KEY`
- `NEXTAUTH_SECRET`
- `REDIS_URL`
- `SMS_GATEWAY_API_KEY`
- `EMAIL_SERVICE_API_KEY`
