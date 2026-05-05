import { Registry, Counter, Histogram, Gauge } from 'prom-client';

// Create a Registry which registers the metrics
const register = new Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'haspataal-core',
});

// haspataal_appointments_created_total (counter, labels: status, hospitalId)
export const appointmentsCreatedCounter = new Counter({
  name: 'haspataal_appointments_created_total',
  help: 'Total number of appointments created',
  labelNames: ['status', 'hospitalId'],
  registers: [register],
});

// haspataal_hospital_registrations_total (counter)
export const hospitalRegistrationsCounter = new Counter({
  name: 'haspataal_hospital_registrations_total',
  help: 'Total number of hospital registrations',
  registers: [register],
});

// haspataal_login_attempts_total (counter, labels: role, success)
export const loginAttemptsCounter = new Counter({
  name: 'haspataal_login_attempts_total',
  help: 'Total number of login attempts',
  labelNames: ['role', 'success'],
  registers: [register],
});

// haspataal_api_request_duration_seconds (histogram, labels: route, method, statusCode)
export const httpRequestDurationMicroseconds = new Histogram({
  name: 'haspataal_api_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route', 'method', 'statusCode'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 0.1 to 10 seconds
  registers: [register],
});

// haspataal_active_bookings_gauge (gauge)
export const activeBookingsGauge = new Gauge({
  name: 'haspataal_active_bookings_gauge',
  help: 'Number of currently active bookings',
  registers: [register],
});

export default register;
