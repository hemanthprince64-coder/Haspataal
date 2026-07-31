'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.logger = void 0;
// ============================================================
// API Gateway — Hardened Express gateway with:
//   - jose JWT validation at the edge
//   - Per-role rate limiting
//   - Pino structured logging
//   - Request correlation IDs (X-Request-ID)
//   - Route-prefix proxying
// ============================================================
const middleware_1 = require('@haspataal/auth/middleware');
const db_1 = require('@haspataal/db');
const cors_1 = __importDefault(require('cors'));
const crypto_1 = require('crypto');
const express_1 = __importDefault(require('express'));
const jose_1 = require('jose');
const pino_1 = __importDefault(require('pino'));
// ── Logger ───────────────────────────────────────────────────
exports.logger = (0, pino_1.default)({
  name: 'api-gateway',
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
// ── Config ───────────────────────────────────────────────────
const PORT = process.env.API_GATEWAY_PORT || 4002;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET || NEXTAUTH_SECRET.length < 32) {
  throw new Error('NEXTAUTH_SECRET must be set and >= 32 chars');
}
const JWT_SECRET = new TextEncoder().encode(NEXTAUTH_SECRET);
const RATE_LIMITS = {
  PATIENT: 60,
  DOCTOR: 120,
  HOSPITAL_ADMIN: 200,
  AGENT: 60,
  SUPER_ADMIN: -1, // unlimited
  PLATFORM_ADMIN: -1,
  default: 60,
};
// ── Prisma ───────────────────────────────────────────────────
// Using @haspataal/db singleton (imported above)
// ── Redis (optional, graceful fallback) ──────────────────────
let redis = null;
try {
  const Redis = require('ioredis');
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  redis.on('error', () => {
    /* ignore build-time connection errors */
  });
  redis.connect().catch(() => {
    exports.logger.warn('Redis not available — rate limiting disabled');
    redis = null;
  });
} catch {
  exports.logger.warn('ioredis not installed — rate limiting disabled');
}
// ── App ──────────────────────────────────────────────────────
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(
  (0, cors_1.default)({
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
// ── Security Middleware ────────────────────────────────────────
app.use(middleware_1.securityHeaders);
app.use(middleware_1.csrfMiddleware);
app.use((req, res, next) => {
  if (!req.cookies?.csrf_token) {
    (0, middleware_1.setCsrfCookie)(res);
  }
  next();
});
// ── Middleware: Correlation ID ────────────────────────────────
app.use((req, res, next) => {
  const correlationId = req.headers['x-request-id'] || (0, crypto_1.randomUUID)();
  req.correlationId = correlationId;
  res.setHeader('X-Request-ID', correlationId);
  // Attach child logger with correlation context
  req.log = exports.logger.child({ correlationId, method: req.method, path: req.path });
  req.log.info('Incoming request');
  next();
});
// ── Middleware: JWT Validation ────────────────────────────────
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing Bearer token',
      code: 'AUTH_MISSING',
    });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Check Redis blacklist (if available)
    if (redis) {
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
        req.log.warn('Blacklisted token used');
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Token has been revoked',
          code: 'AUTH_REVOKED',
        });
      }
    }
    // Verify JWT using jose (consistent with root app's auth strategy)
    const { payload } = await (0, jose_1.jwtVerify)(token, JWT_SECRET);
    req.user = payload;
    req.log = req.log.child({ userId: payload.sub || payload.id, role: payload.role });
    next();
  } catch (e) {
    req.log.warn({ error: e.message }, 'JWT verification failed');
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired token',
      code: 'AUTH_INVALID',
    });
  }
};
// ── Middleware: Role Guard ────────────────────────────────────
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      req.log.warn(
        { requiredRoles: roles, actualRole: req.user?.role },
        'Insufficient permissions',
      );
      return res.status(403).json({
        success: false,
        error: `Forbidden: Requires one of [${roles.join(', ')}]`,
        code: 'ROLE_DENIED',
        yourRole: req.user?.role || 'unauthenticated',
      });
    }
    next();
  };
// ── Middleware: Per-Role Rate Limiter ─────────────────────────
const rateLimiter = async (req, res, next) => {
  if (!redis) return next(); // Fail open if Redis unavailable
  const role = req.user?.role || 'default';
  const limit = RATE_LIMITS[role] ?? RATE_LIMITS.default;
  // Unlimited roles skip rate limiting
  if (limit === -1) return next();
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const windowKey = Math.floor(Date.now() / 60000); // 1-minute windows
  const redisKey = `ratelimit:${role}:${ip}:${windowKey}`;
  try {
    const multi = redis.multi();
    multi.incr(redisKey);
    multi.expire(redisKey, 65);
    const results = await multi.exec();
    const currentCount = results?.[0]?.[1] || 0;
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentCount));
    res.setHeader('X-RateLimit-Reset', (windowKey + 1) * 60);
    if (currentCount > limit) {
      req.log.warn({ role, count: currentCount, limit }, 'Rate limit exceeded');
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        code: 'RATE_LIMITED',
        retryAfter: 60,
      });
    }
  } catch (error) {
    req.log.error({ error }, 'Rate limiting error — failing open');
  }
  next();
};
// ── Middleware: Hospital Tenant Guard ─────────────────────────
const requireHospitalTenant = (req, res, next) => {
  const hospitalId = req.params.id || req.body.hospitalId;
  if (!hospitalId) return next();
  // Super admins bypass tenant isolation
  if (['super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user?.role)) {
    return next();
  }
  if (req.user?.hospitalId !== hospitalId) {
    req.log.warn(
      { requestedHospital: hospitalId, userHospital: req.user?.hospitalId },
      'Cross-tenant access denied',
    );
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Cross-tenant data access denied',
      code: 'TENANT_ISOLATION',
    });
  }
  next();
};
// ============================================================
// ROUTES
// ============================================================
// ── Health Check (Public) ────────────────────────────────────
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'api-gateway',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  };
  // Check dependencies
  try {
    await db_1.prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch {
    health.database = 'disconnected';
    health.status = 'degraded';
  }
  health.redis = redis ? 'connected' : 'disconnected';
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json({ success: true, data: health });
});
// ── Doctor Discovery (Public, rate-limited) ──────────────────
app.get('/v1/search/doctors', rateLimiter, async (req, res) => {
  const { city, specialty, limit = '20' } = req.query;
  const take = Math.min(parseInt(limit), 100);
  try {
    const where = {};
    if (city) where.city = city;
    const doctors = await db_1.prisma.doctorMaster.findMany({
      where,
      take,
      orderBy: { createdAt: 'desc' },
      include: { registration: true },
    });
    res.json({
      success: true,
      data: doctors,
      meta: {
        cursor: doctors.length > 0 ? doctors[doctors.length - 1].id : null,
        hasMore: doctors.length === take,
        query: { city, specialty },
      },
    });
  } catch (error) {
    req.log.error({ error }, 'Doctor search failed');
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctors',
      code: 'INTERNAL_ERROR',
    });
  }
});
// ── Appointments (Auth + Rate Limited + CSRF) ─────────────────
app.post(
  '/v1/appointments',
  middleware_1.csrfProtection,
  requireAuth,
  rateLimiter,
  async (req, res) => {
    const { doctorId, hospitalId, scheduledAt, notes, slot } = req.body;
    if (!doctorId || !scheduledAt || !slot) {
      return res.status(400).json({
        success: false,
        error: 'doctorId, scheduledAt, and slot are required',
        code: 'VALIDATION_ERROR',
      });
    }
    try {
      const existing = await db_1.prisma.appointment.findFirst({
        where: {
          doctorId,
          date: new Date(scheduledAt),
          slot,
          status: { in: ['BOOKED', 'CONFIRMED'] },
        },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Slot already booked',
          code: 'SLOT_UNAVAILABLE',
        });
      }
      const appointment = await db_1.prisma.appointment.create({
        data: {
          patientId: req.user.sub || req.user.userId,
          doctorId,
          hospitalId,
          date: new Date(scheduledAt),
          slot,
          notes,
          status: 'AWAITING_PAYMENT',
        },
      });
      req.log.info({ appointmentId: appointment.id }, 'Appointment created');
      res.status(201).json({ success: true, data: appointment });
    } catch (error) {
      req.log.error({ error: error.message }, 'Booking failed');
      res.status(500).json({
        success: false,
        error: 'Failed to book appointment',
        code: 'INTERNAL_ERROR',
      });
    }
  },
);
app.patch(
  '/v1/appointments/:id/status',
  middleware_1.csrfProtection,
  requireAuth,
  rateLimiter,
  async (req, res) => {
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
      const appointment = await db_1.prisma.appointment.update({
        where: { id: req.params.id },
        data: { status },
      });
      req.log.info({ appointmentId: req.params.id, newStatus: status }, 'Status updated');
      res.json({ success: true, data: appointment });
    } catch {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
        code: 'NOT_FOUND',
      });
    }
  },
);
// ── Hospital Endpoints (RBAC + Tenant Isolation) ─────────────
app.get(
  '/v1/hospitals/:id/patients',
  requireAuth,
  requireRole('hospital_admin', 'HOSPITAL_ADMIN', 'super_admin', 'SUPER_ADMIN'),
  requireHospitalTenant,
  rateLimiter,
  async (req, res) => {
    const { limit = '20' } = req.query;
    const take = Math.min(parseInt(limit), 100);
    try {
      const patients = await db_1.prisma.appointment.findMany({
        where: { hospitalId: req.params.id },
        distinct: ['patientId'],
        take,
        orderBy: { date: 'desc' },
        include: { patient: true },
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
      req.log.error({ error }, 'Patient fetch failed');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch patients',
        code: 'INTERNAL_ERROR',
      });
    }
  },
);
app.get(
  '/v1/hospitals/:id/doctors',
  requireAuth,
  requireRole('hospital_admin', 'HOSPITAL_ADMIN', 'doctor', 'DOCTOR', 'super_admin', 'SUPER_ADMIN'),
  requireHospitalTenant,
  rateLimiter,
  async (req, res) => {
    try {
      const affiliations = await db_1.prisma.doctorHospitalAffiliation.findMany({
        where: { hospitalId: req.params.id },
        include: { doctor: true },
      });
      res.json({
        success: true,
        data: affiliations.map((a) => a.doctor),
      });
    } catch (error) {
      req.log.error({ error }, 'Doctor fetch failed');
      res.status(500).json({
        success: false,
        error: 'Failed to fetch doctors',
        code: 'INTERNAL_ERROR',
      });
    }
  },
);
// ── Escalation Alert Routes (authz verified inline; worker runs in separate process) ───────────────────────────
// :id = escalation alert UUID
app.get(
  '/v1/escalations',
  requireAuth,
  requireRole('doctor', 'DOCTOR', 'hospital_admin', 'HOSPITAL_ADMIN', 'super_admin', 'SUPER_ADMIN'),
  rateLimiter,
  async (req, res) => {
    try {
      const userId = req.user?.sub || req.user?.userId;
      const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
      const acknowledged = req.query.acknowledged === 'true';
      // Scope by doctor if not super-admin
      const isSuper = ['super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user?.role);
      const where = { isAcknowledged: acknowledged };
      if (!isSuper) {
        where.doctorId = userId;
      }
      const alerts = await db_1.prisma.escalationAlert.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { name: true, phone: true } },
          hospital: { select: { displayName: true } },
        },
      });
      res.json({ success: true, data: alerts, meta: { count: alerts.length, acknowledged } });
    } catch (error) {
      req.log.error({ error: error.message }, 'Escalation list failed');
      res
        .status(500)
        .json({ success: false, error: 'Failed to fetch escalations', code: 'INTERNAL_ERROR' });
    }
  },
);
// PATCH /v1/escalations/:id/acknowledge — doctor marks alert as reviewed
app.patch(
  '/v1/escalations/:id/acknowledge',
  middleware_1.csrfProtection,
  requireAuth,
  requireRole('doctor', 'DOCTOR', 'hospital_admin', 'HOSPITAL_ADMIN', 'super_admin', 'SUPER_ADMIN'),
  rateLimiter,
  async (req, res) => {
    const alertId = req.params.id;
    try {
      // Verify ownership unless super-admin
      const isSuper = ['super_admin', 'SUPER_ADMIN', 'PLATFORM_ADMIN'].includes(req.user?.role);
      if (!isSuper) {
        const existing = await db_1.prisma.escalationAlert.findFirst({
          where: { id: alertId, doctorId: req.user?.sub || req.user?.userId },
        });
        if (!existing) {
          return res.status(403).json({
            success: false,
            error: 'Escalation not found or not assigned to you',
            code: 'NOT_FOUND',
          });
        }
      }
      await db_1.prisma.escalationAlert.update({
        where: { id: alertId },
        data: { isAcknowledged: true, acknowledgedAt: new Date() },
      });
      res.status(204).send();
    } catch {
      res.status(404).json({
        success: false,
        error: 'Escalation not found',
        code: 'NOT_FOUND',
      });
    }
  },
);
// ── Error Handler ────────────────────────────────────────────
app.use((err, req, res, _next) => {
  const correlationId = req.correlationId || 'unknown';
  exports.logger.error({ correlationId, error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    correlationId,
  });
});
// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  exports.logger.info({ port: PORT }, `API Gateway v2.0 started`);
  exports.logger.info('Features: jose JWT | per-role rate limits | Pino logging | correlation IDs');
});
exports.default = app;
