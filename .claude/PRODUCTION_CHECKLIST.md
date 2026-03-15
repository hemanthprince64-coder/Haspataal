# 🚀 Haspataal Production Deployment Checklist

> Run through this checklist before every production release.

## 🌐 DNS & Network
- [ ] Cloudflare A records pointing to load balancer IP for all 5 subdomains
- [ ] Wildcard SSL certificate (`*.haspataal.com`) installed via Let's Encrypt / ZeroSSL
- [ ] Nginx config tested with `nginx -t`
- [ ] All subdomain → service routing verified

## 🐳 Docker / Infrastructure  
- [ ] Run `docker compose config` to validate docker-compose.yml
- [ ] All 8 services start cleanly: `docker compose up -d`
- [ ] Redis health check passes: `docker exec haspataal-redis redis-cli ping`
- [ ] All container restart policies set to `unless-stopped`

## 🔒 Security
- [ ] `NEXTAUTH_SECRET` set to a 64-char random string
- [ ] `DATABASE_URL` uses the connection pooler (port 6543) for app, direct URL (port 5432) for migrations
- [ ] Phase 4 RLS SQL (`scripts/phase4_security_rls.sql`) executed against Supabase
- [ ] All Supabase tables have `ENABLE ROW LEVEL SECURITY`
- [ ] JWT expiry set to 1 day; refresh token mechanism planned for v2
- [ ] API keys never committed to Git (verified via `git log --diff-filter=A .env`)

## 🧪 Testing
- [ ] `node scripts/backend-health-check.js` → 18 PASS, 0 FAIL
- [ ] `npx tsx scripts/verify-stability.ts` → CORE STABILITY VERIFIED
- [ ] Doctor Portal TypeScript check: `npx tsc --noEmit` (0 errors)
- [ ] Hospital HMS TypeScript check: `npx tsc --noEmit` (0 errors)

## 📊 Monitoring
- [ ] Pino logs piped to log aggregator (e.g. Datadog or Papertrail)
- [ ] Uptime monitoring for all 5 subdomains
- [ ] Database CPU/connection alerts configured in Supabase dashboard

## 🔁 CI/CD
- [ ] GitHub Secrets set: `DATABASE_URL`, `NEXTAUTH_SECRET`, `PROD_SSH_HOST`, `PROD_SSH_USER`, `PROD_SSH_PRIVATE_KEY`, `PROD_ENV`
- [ ] GitHub Actions workflow at `.github/workflows/deploy.yml` is active
- [ ] Test by making a PR to `main` and confirm lint + build jobs pass

## 📄 SEO
- [ ] `sitemap.xml` accessible at `https://haspataal.com/sitemap.xml`
- [ ] `robots.txt` accessible at `https://haspataal.com/robots.txt`
- [ ] Google Search Console submitted with sitemap
- [ ] Core Web Vitals baseline measurement captured

## 🎉 Go-Live
- [ ] DNS propagation confirmed (use https://dnschecker.org)
- [ ] All 5 subdomains load with valid HTTPS
- [ ] Perform 1 full end-to-end test: Register patient → search doctor → book appointment
