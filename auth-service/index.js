const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); // Re-use the root env
const { validateEnv } = require('../scripts/validate-env');
validateEnv();

const app = express();
app.use(express.json());
app.use(cors());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { logger } = require('@haspataal/logger');
const bcrypt = require('bcryptjs');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis = new Redis(REDIS_URL);

const PORT = process.env.AUTH_SERVICE_PORT || 4001;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev_only';

const { register, Counter } = require('prom-client');

// --- METRICS ---
const loginAttempts = new Counter({
  name: 'haspataal_auth_login_attempts_total',
  help: 'Total login attempts in auth-service',
  labelNames: ['role', 'success'],
});
register.registerMetric(loginAttempts);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// --- HEALTH ---
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
    service: 'auth-service',
    checks,
  });
});

app.post('/oauth/token', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    let user = null;
    let role = null;
    let hospitalId = null;

    // 1. Try Patient
    user = await prisma.patient.findUnique({ where: { email } });
    if (user) role = 'patient';

    // 2. Try Doctor
    if (!user) {
      user = await prisma.doctorMaster.findUnique({ where: { email } });
      if (user) role = 'doctor';
    }

    // 3. Try Hospital Admin
    if (!user) {
      user = await prisma.hospitalAdmin.findUnique({ where: { email } });
      if (user) {
        role = 'hospital_admin';
        hospitalId = user.hospitalId;
      }
    }

    // 4. Try Staff
    if (!user) {
      user = await prisma.staff.findUnique({ where: { mobile: email } }); // Staff uses mobile as identifier in schema
      if (user) {
        role = 'staff';
        hospitalId = user.hospitalId;
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate Password
    if (!isValid) {
      loginAttempts.inc({ role, success: 'false' });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT Payload
    const payload = {
      userId: user.id,
      email: user.email || user.mobile,
      role: role,
      hospitalId: hospitalId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

    loginAttempts.inc({ role, success: 'true' });
    res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400,
      user: {
        id: user.id,
        name: user.name || user.fullName,
        role: role,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Authentication failed');
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/auth/logout', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.decode(token);
    if (!decoded) return res.status(400).json({ error: 'Invalid token' });

    // Calculate remaining TTL for the token
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      // Blacklist the token in Redis until it naturally expires
      await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, '[Auth Service] Running');
  logger.info('[Auth Service] Ready to process JWTs for api.haspataal.com');
});
