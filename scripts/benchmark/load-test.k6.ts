import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  scenarios: {
    opd_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '60s',
    },
    ipd_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '30s', target: 0 },
      ],
    },
    pharmacy_load: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: 's',
      duration: '60s',
      preAllocatedVUs: 20,
    },
    lab_order_load: {
      executor: 'constant-vus',
      vus: 30,
      duration: '60s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
let authToken = '';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/hospital/auth/login`, {
    username: __ENV.TEST_USERNAME || 'test',
    password: __ENV.TEST_PASSWORD || 'test',
  });

  if (loginRes.status === 200) {
    const body = loginRes.json();
    authToken = body.token || body.accessToken || '';
  }

  return { authToken };
}

export default function (data) {
  const headers = data.authToken ? { Authorization: `Bearer ${data.authToken}` } : {};

  const endpoints = [
    { method: 'GET', url: `${BASE_URL}/api/health`, name: 'Health' },
    { method: 'GET', url: `${BASE_URL}/api/patient/slots`, name: 'Slots' },
    { method: 'GET', url: `${BASE_URL}/api/hospital/ipd/beds`, name: 'Beds' },
    { method: 'GET', url: `${BASE_URL}/api/hospital/diagnostics/pricing`, name: 'Pricing' },
    { method: 'GET', url: `${BASE_URL}/api/hospital/pharmacy/stock`, name: 'Pharmacy' },
  ];

  for (const ep of endpoints) {
    const res = http.request(ep.method, ep.url, null, { headers });
    check(res, {
      [`${ep.name} status is 200`]: (r) => r.status === 200,
      [`${ep.name} duration < 500ms`]: (r) => r.timings.duration < 500,
    });
    sleep(0.1);
  }
}

export function teardown(data) {
  console.log('Load test completed');
}
