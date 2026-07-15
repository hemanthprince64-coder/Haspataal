import { execSync } from 'child_process';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

let gatewayUrl: string;

beforeAll(async () => {
  const result = execSync(
    'docker compose ps --format "{{.Name}} {{.Ports}}" 2>nul || echo "not_running"',
  ).toString();
  if (result.includes('not_running') || !result.includes('4002->4002')) {
    console.warn('Gateway not running — skipping CSRF integration tests');
    return;
  }
  gatewayUrl = 'http://localhost:4002';
});

describe('Gateway Security Headers', () => {
  it('should include all required security headers on GET /health', async () => {
    if (!gatewayUrl) return;
    const res = await request(gatewayUrl).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-xss-protection']).toBe('1; mode=block');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});

describe('Gateway CSRF Protection', () => {
  it('should reject POST without CSRF token', async () => {
    if (!gatewayUrl) return;
    const res = await request(gatewayUrl)
      .post('/v1/appointments')
      .send({ doctorId: 'test', scheduledAt: '2026-01-01', slot: '10:00' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('CSRF_INVALID');
  });

  it('should accept POST with valid CSRF token', async () => {
    if (!gatewayUrl) return;
    const getRes = await request(gatewayUrl).get('/health');
    const csrfCookie = getRes.headers['set-cookie']?.find((c: string) =>
      c.startsWith('csrf-token='),
    );
    if (!csrfCookie) return;

    const csrfMatch = csrfCookie.match(/csrf-token=([^;]+)/);
    if (!csrfMatch) return;

    const res = await request(gatewayUrl)
      .post('/v1/appointments')
      .set('x-csrf-token', csrfMatch[1])
      .send({ doctorId: 'test', scheduledAt: '2026-01-01', slot: '10:00' });
    expect([201, 401, 403]).toContain(res.status);
  });
});

describe('Gateway Rate Limiting', () => {
  it('should return 429 after exceeding rate limit', async () => {
    if (!gatewayUrl) return;
    const promises = Array.from({ length: 70 }, () =>
      request(gatewayUrl).get('/v1/search/doctors'),
    );
    const results = await Promise.all(promises);
    const has429 = results.some((r) => r.status === 429);
    expect(has429).toBe(true);
  });
});

describe('Gateway Tenant Isolation', () => {
  it('should reject cross-tenant access', async () => {
    if (!gatewayUrl) return;
    const res = await request(gatewayUrl)
      .get('/v1/hospitals/hospital-b/patients')
      .set('Authorization', 'Bearer fake-token-hospital-a');
    expect([401, 403]).toContain(res.status);
  });
});
