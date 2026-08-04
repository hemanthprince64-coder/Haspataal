---\nversion: 2.0\nowner: Haspataal Engineering\nlast_updated: 2026-08-04\nstatus: Active\n---\n
# Security & Compliance

## 1. Secrets Management
- The `.env.example` file must only contain placeholder strings. Never real values, not even bcrypt hashes.
- External API keys (Razorpay, WhatsApp) MUST be stored encrypted in the database using the `ENCRYPTION_KEY` AES-256 variable.

## 2. PHI Protection (Logging)
- **NEVER** use `console.log` for patient data; it violates PHI compliance.
- Always use `@haspataal/logger`. It is configured to automatically redact sensitive fields (`password`, `token`, `secret`, `authorization`, `otp`).

## 3. Cryptography & Hashing
- Always use Bcrypt for admin and doctor credentials.
- Do not pad or synthesize encryption keys if they fall short of 32 characters; throw an error instead.

## 4. Sentry Error Scrubbing
- Mandatory `beforeSend` hook in Sentry recursively scrubs PHI (passwords, tokens, medicalHistory) before reporting.

## 5. Rate Limiting
- Atomic Lua-backed sliding window rate limiter in `lib/rate-limit.ts` using `ioredis`. 
- Wrap critical Server Actions (`loginHospital`, `requestOtp`) using the `withRateLimit` HOC.
