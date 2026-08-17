import { test, expect } from '@playwright/test';

test.describe('Phase 1 Health Checks', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('Doctor registration GET returns list', async ({ request }) => {
    const response = await request.get('/api/doctors');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('Patient registration GET returns list', async ({ request }) => {
    const response = await request.get('/api/patients');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('Document upload GET requires doctorId', async ({ request }) => {
    const response = await request.get('/api/doctors/documents');
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('doctorId');
  });

  test('Education GET requires doctorId', async ({ request }) => {
    const response = await request.get('/api/doctors/education');
    expect(response.status()).toBe(400);
  });

  test('Certifications GET requires doctorId', async ({ request }) => {
    const response = await request.get('/api/doctors/certifications');
    expect(response.status()).toBe(400);
  });

  test('Hospital invitation GET requires doctorId', async ({ request }) => {
    const response = await request.get('/api/hospital/doctors/invite');
    expect(response.status()).toBe(400);
  });
});

test.describe('Phase 1 Integration Tests', () => {
  test('Doctor registration flow - send OTP', async ({ request }) => {
    const response = await request.post('/api/doctors', {
      data: { mobile: '9999999999', action: 'send_otp' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('Doctor registration requires valid mobile', async ({ request }) => {
    const response = await request.post('/api/doctors', {
      data: { mobile: 'invalid', action: 'send_otp' },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('Phase 2 Discovery Tests', () => {
  test('Doctor search returns list', async ({ request }) => {
    const response = await request.get('/api/doctors/search');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('Doctor search with specialty filter', async ({ request }) => {
    const response = await request.get('/api/doctors/search?specialty=Cardiology&limit=5');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('Doctor search with city filter', async ({ request }) => {
    const response = await request.get('/api/doctors/search?city=Mumbai');
    expect(response.status()).toBe(200);
  });

  test('Availability check requires parameters', async ({ request }) => {
    const response = await request.get('/api/doctors/availability');
    expect(response.status()).toBe(400);
  });
});
