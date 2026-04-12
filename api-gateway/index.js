const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

// Real RBAC middleware (Phase 4 — wired in health check auto-fix)
const { requireAuth, requireRole, requireHospitalTenant } = require('./middleware/auth');

const { apiLimiter, strictLimiter } = require('./middleware/rate-limit');

const app = express();
app.use(express.json());
app.use(cors({
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
    credentials: true
}));

// Apply general rate limiter to all requests
app.use(apiLimiter);

const PORT = process.env.API_GATEWAY_PORT || 4002;

// ============================================================
// HEALTH CHECK (Public)
// ============================================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'api-gateway',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        }
    });
});

const { cacheAside } = require('./lib/cache');

// ============================================================
// DOCTOR DISCOVERY (Public — SEO powered)
// ============================================================
app.get('/v1/search/doctors', strictLimiter, async (req, res) => {
    const { city, specialty, cursor, limit = '20' } = req.query;
    const cacheKey = `search:doctors:${city || 'all'}:${specialty || 'all'}:${cursor || 'start'}:${limit}`;

    try {
        const results = await cacheAside(cacheKey, async () => {
            // TODO: Wire to Prisma — prisma.doctorMaster.findMany({ where: { city, specialty }, take })
            return {
                data: [],
                meta: { cursor: null, hasMore: false, query: { city, specialty } }
            };
        }, 300); // Cache for 5 minutes

        res.json({
            success: true,
            ...results
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch doctors' });
    }
});

// ============================================================
// APPOINTMENTS (Auth Required)
// ============================================================
app.post('/v1/appointments', requireAuth, async (req, res) => {
    const { doctorId, hospitalId, scheduledAt, notes } = req.body;

    if (!doctorId || !hospitalId || !scheduledAt) {
        return res.status(400).json({
            success: false,
            error: 'doctorId, hospitalId, and scheduledAt are required',
            code: 'VALIDATION_ERROR'
        });
    }

    // TODO: Redis slot locking → Prisma transaction
    res.status(201).json({
        success: true,
        data: {
            id: 'mock-uuid-' + Date.now(),
            doctorId,
            hospitalId,
            scheduledAt,
            status: 'BOOKED'
        }
    });
});

app.patch('/v1/appointments/:id/status', requireAuth, async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            code: 'VALIDATION_ERROR'
        });
    }
    // TODO: Prisma update
    res.json({ success: true, data: { id: req.params.id, status } });
});

// ============================================================
// HOSPITAL (Hospital Admin — RLS enforced)
// ============================================================
app.get('/v1/hospitals/:id/patients',
    requireAuth,
    requireRole('hospital_admin', 'super_admin'),
    requireHospitalTenant,
    async (req, res) => {
        const { cursor, limit = '20' } = req.query;
        const take = Math.min(parseInt(limit), 100);

        // TODO: Prisma with hospital_id scoping + cursor pagination
        res.json({
            success: true,
            data: [],
            meta: { cursor: null, hasMore: false }
        });
    }
);

app.get('/v1/hospitals/:id/doctors',
    requireAuth,
    requireRole('hospital_admin', 'doctor', 'super_admin'),
    requireHospitalTenant,
    async (req, res) => {
        // TODO: Prisma - doctorHospitalAffiliation where hospitalId = req.params.id
        res.json({ success: true, data: [] });
    }
);

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error('[API Gateway Error]', err.message);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
});

app.listen(PORT, () => {
    console.log(`[API Gateway] Running on port ${PORT}`);
    console.log(`[API Gateway] RBAC middleware: ACTIVE`);
    console.log(`[API Gateway] Multi-tenant isolation: ACTIVE`);
});
