const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); // Re-use the root env

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.AUTH_SERVICE_PORT || 4001;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev_only';

// Mock DB logic (In Phase 2, this will connect to the Prisma client in root)
// We are establishing the microservice routing structure first.
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'auth-service' });
});

app.post('/oauth/token', async (req, res) => {
    const { email, password } = req.body;

    // TODO: Connect to Prisma Patient/Doctor/Admin models
    // For scaffolding, we validate a mock login to distribute the JWT structure

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock Payload matching Haspataal schema expectations
    const payload = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        email: email,
        role: email.includes('admin') ? 'super_admin' : (email.includes('doctor') ? 'doctor' : 'patient'),
        hospitalId: email.includes('hospital') ? 'hospital-uuid-1234' : null
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 86400,
        user: payload
    });
});

app.listen(PORT, () => {
    console.log(`[Auth Service] Running on port ${PORT}`);
    console.log(`[Auth Service] Ready to process JWTs for api.haspataal.com`);
});
