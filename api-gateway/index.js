const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

// Real RBAC middleware (Phase 4 — wired in health check auto-fix)
const { requireAuth, requireRole, requireHospitalTenant } = require('./middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('@haspataal/logger');

const { apiLimiter, strictLimiter } = require('./middleware/rate-limit');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'https://haspataal.com',
      'https://doctor.haspataal.com',
      'https://hospital.haspataal.com',
      'https://admin.haspataal.com',
    ],
    credentials: true,
  }),
);

// Apply general rate limiter to all requests
app.use(apiLimiter);

const PORT = process.env.API_GATEWAY_PORT || 4002;

const { register, Counter, Histogram } = require('prom-client');

// --- METRICS ---
const requestDuration = new Histogram({
  name: 'haspataal_api_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['route', 'method', 'statusCode'],
});
register.registerMetric(requestDuration);

const appointmentsCreated = new Counter({
  name: 'haspataal_appointments_created_total',
  help: 'Total appointments created',
  labelNames: ['status', 'hospitalId'],
});
register.registerMetric(appointmentsCreated);

// Middleware to track request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    requestDuration.observe({ route, method: req.method, statusCode: res.statusCode }, duration);
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// ============================================================
// HEALTH CHECK (Structured)
// ============================================================
app.get('/health', async (req, res) => {
  const timestamp = new Date().toISOString();
  const checks = {};
  let overallStatus = 'healthy';

  // DB Check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up' };
  } catch (err) {
    checks.database = { status: 'down' };
    overallStatus = 'unhealthy';
  }

  // Redis Check
  const { redis } = require('./lib/cache');
  try {
    const ping = await redis.ping();
    checks.redis = { status: ping === 'PONG' ? 'up' : 'down' };
    if (ping !== 'PONG') overallStatus = 'degraded';
  } catch (err) {
    checks.redis = { status: 'down' };
    overallStatus = 'degraded';
  }

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;
  res.status(statusCode).json({
    status: overallStatus,
    timestamp,
    service: 'api-gateway',
    checks,
  });
});

const { cacheAside, redlock } = require('./lib/cache');

// ============================================================
// DOCTOR DISCOVERY (Public — SEO powered)
// ============================================================
app.get('/v1/search/doctors', strictLimiter, async (req, res) => {
  const { city, specialty, cursor, limit = '20' } = req.query;
  const cacheKey = `search:doctors:${city || 'all'}:${specialty || 'all'}:${cursor || 'start'}:${limit}`;

  try {
    const results = await cacheAside(
      cacheKey,
      async () => {
        const take = Math.min(parseInt(limit), 100);

        const where = {};
        if (city) where.city = city;
        // Note: In schema, specialty might be part of DoctorProfessionalHistory or a separate relation.
        // For now, filtering by city in DoctorMaster.

        const doctors = await prisma.doctorMaster.findMany({
          where,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            registration: true,
          },
        });

        return {
          data: doctors,
          meta: {
            cursor: doctors.length > 0 ? doctors[doctors.length - 1].id : null,
            hasMore: doctors.length === take,
            query: { city, specialty },
          },
        };
      },
      300,
    ); // Cache for 5 minutes

    res.json({
      success: true,
      ...results,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
  }
});

// ============================================================
// APPOINTMENTS (Auth Required)
// ============================================================
app.post('/v1/appointments', requireAuth, async (req, res) => {
  const { doctorId, hospitalId, scheduledAt, notes, slot } = req.body;

  if (!doctorId || !scheduledAt || !slot) {
    return res.status(400).json({
      success: false,
      error: 'doctorId, scheduledAt, and slot are required',
      code: 'VALIDATION_ERROR',
    });
  }

  const lockKey = `lock:slot:${doctorId}:${scheduledAt}:${slot}`;
  let lock;

  try {
    // Attempt to acquire distributed lock for 10 seconds
    lock = await redlock.acquire([lockKey], 10000);

    // Check if appointment already exists in DB
    const existing = await prisma.appointment.findUnique({
      where: {
        doctorId_date_slot: {
          doctorId,
          date: new Date(scheduledAt),
          slot,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Slot already booked',
        code: 'SLOT_UNAVAILABLE',
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.userId,
        doctorId,
        hospitalId,
        date: new Date(scheduledAt),
        slot,
        notes,
        status: 'BOOKED',
      },
    });

    appointmentsCreated.inc({ status: 'BOOKED', hospitalId });

    res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    logger.error({ error }, 'Booking failure');
    res.status(error.name === 'ExecutionError' ? 409 : 500).json({
      success: false,
      error:
        error.name === 'ExecutionError'
          ? 'Another booking is in progress for this slot'
          : 'Failed to book appointment',
      code: error.name === 'ExecutionError' ? 'CONCURRENCY_ERROR' : 'INTERNAL_ERROR',
    });
  } finally {
    if (lock) await lock.release();
  }
});

app.patch('/v1/appointments/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Status must be one of: ${validStatuses.join(', ')}`,
      code: 'VALIDATION_ERROR',
    });
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Appointment not found' });
  }
});

// ============================================================
// HOSPITAL (Hospital Admin — RLS enforced)
// ============================================================
app.get(
  '/v1/hospitals/:id/patients',
  requireAuth,
  requireRole('hospital_admin', 'super_admin'),
  requireHospitalTenant,
  async (req, res) => {
    const { cursor, limit = '20' } = req.query;
    const take = Math.min(parseInt(limit), 100);

    try {
      // Fetch appointments/patients scoped to this hospital
      const patients = await prisma.appointment.findMany({
        where: { hospitalId: req.params.id },
        distinct: ['patientId'],
        take,
        orderBy: { date: 'desc' },
        include: {
          patient: true,
        },
      });

      res.json({
        success: true,
        data: patients.map((p) => p.patient),
        meta: {
          cursor: patients.length > 0 ? patients[patients.length - 1].id : null,
          hasMore: patients.length === take,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch patients' });
    }
  },
);

app.get(
  '/v1/hospitals/:id/doctors',
  requireAuth,
  requireRole('hospital_admin', 'doctor', 'super_admin'),
  requireHospitalTenant,
  async (req, res) => {
    try {
      const affiliations = await prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId: req.params.id },
        include: {
          doctor: true,
        },
      });
      res.json({ success: true, data: affiliations.map((a) => a.doctor) });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
  },
);

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  logger.error({ err, path: req.path }, 'Internal server error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, '[API Gateway] Running');
  logger.info('[API Gateway] RBAC middleware: ACTIVE');
  logger.info('[API Gateway] Multi-tenant isolation: ACTIVE');
});
