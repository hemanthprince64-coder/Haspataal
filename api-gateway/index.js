const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.API_GATEWAY_PORT || 4002;
// In production this will verify signatures via JWKS or shared secret
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev_only';

// MOCK MIDDLEWARE: Verifies JWT from auth.haspataal.com
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    // JWT verification logic would go here
    // For scaffolding, we assume the token is valid if present
    req.user = { role: 'patient' };
    next();
};

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'api-gateway' });
});

// ==== CORE ROUTES (Phase 2 Scaffolding) ====

// [Public] Doctor Discovery Engine - SEO Powered
app.get('/v1/search/doctors', (req, res) => {
    const { city, specialty } = req.query;
    // TODO: Connect to Prisma db.doctorMaster.findMany()
    res.json({
        message: 'Doctor discovery active',
        query: { city, specialty },
        results: []
    });
});

// [Protected] Appointment Engine
app.post('/v1/appointments', requireAuth, (req, res) => {
    const { doctorId, hospitalId, slotTime } = req.body;
    // TODO: Connect to Redis slot locking -> Prisma transaction
    res.status(201).json({
        message: 'Appointment booked successfully',
        appointmentId: 'mock-uuid-9999'
    });
});

// [Hospital Admin] Multi-Tenant Patient Isolation
app.get('/v1/hospitals/:id/patients', requireAuth, (req, res) => {
    const hospitalId = req.params.id;
    // TODO: Prisma with RLS injected "WHERE hospital_id = req.user.hospitalId"
    res.json({
        hospitalId,
        patients: []
    });
});

app.listen(PORT, () => {
    console.log(`[API Gateway] Running on port ${PORT}`);
    console.log(`[API Gateway] Central router active for haspataal.com ecosystem`);
});
