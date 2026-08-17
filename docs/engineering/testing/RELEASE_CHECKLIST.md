# Haspataal Production Release Checklist

## 1. Pre-Deployment (Infrastructure & Environment)
- [ ] **DNS & Routing**: Ensure `haspataal.com` is routed from the legacy WordPress/LiteSpeed setup to the Next.js deployment.
- [ ] **Environment Variables**: Verify all required secrets (e.g. `NEXTAUTH_SECRET`, DB connection strings) are injected in the production environment.
- [ ] **Redis**: Ensure Redis is running, and the application is connected properly.
- [ ] **Postgres**: Run migrations and ensure database schemas are up to date (`npm run db:deploy`).

## 2. CI/CD & Build Validation
- [ ] **Automated Tests**: Confirm all CI pipelines (`test`, `test:integration`, `test:e2e`) pass successfully.
- [ ] **Bundle Sizes**: Validate application bundle sizes using `@next/bundle-analyzer` to ensure no major regressions.
- [ ] **Lint & Type Check**: Ensure `npm run lint` and `npm run type-check` are error-free.

## 3. Application Security & Configurations
- [ ] **Security Headers**: Verify `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Cross-Origin-Resource-Policy` are correctly applied on all frontend apps (`patient-portal`, `hospital-hms`, `admin-panel`, `marketing`).
- [ ] **Authentication**: Confirm NextAuth is properly configured without any fallback dummy secrets.

## 4. Performance & Observability
- [ ] **Core Web Vitals (CWV)**: Run Lighthouse on the 3 core apps and capture a baseline score.
- [ ] **Fonts**: Confirm that fonts are loaded via `next/font/google` and not third-party CDNs to prevent FOUT.

## 5. Post-Deployment (Smoke Tests)
- [ ] **Marketing Site**: Verify the landing page loads and is navigable.
- [ ] **Patient Portal**: Test user authentication, doctor search, and appointment booking flows.
- [ ] **Hospital HMS**: Verify hospital registration and admission (IPD) workflows.
- [ ] **Admin Panel**: Ensure RBAC access and basic administrative capabilities function properly.

## 6. Final Production UX Checklist
- [ ] Dead Menu removed
- [ ] Medication layout responsive
- [ ] Tablet History accessible
- [ ] `100dvh` verified
- [ ] Touch targets ≥44 px
- [ ] OfflineBanner layering verified
- [ ] Motion-safe animations verified
- [ ] Labels associated correctly
- [ ] Diagnostic badges include icons
- [ ] PACS hint displayed appropriately
- [ ] Full clinician workflow tested
- [ ] Axe accessibility scan passes
- [ ] Cross-browser smoke test passes
- [ ] Responsive testing on 320 px, 375 px, 768 px, 1024 px completed
