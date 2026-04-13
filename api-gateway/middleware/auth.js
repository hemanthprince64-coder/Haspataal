const jwt = require('jsonwebtoken');
const { redis } = require('../lib/cache');
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback_secret_for_dev_only';

/**
 * RBAC Middleware — verifies JWT and injects user context
 * Enforces: role, hospitalId, and userId into req.user
 */
const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Missing Bearer token' });
    }

    const token = authHeader.split(' ')[1];
    try {
        // 1. Check Redis Blacklist
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({ error: 'Unauthorized: Token has been revoked' });
        }

        // 2. Verify JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};

/**
 * Role Guard — ensures a minimum role is present
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            error: `Forbidden: Requires one of [${roles.join(', ')}]`,
            yourRole: req.user?.role || 'unauthenticated'
        });
    }
    next();
};

/**
 * Hospital Tenant Guard — enforces hospital_id isolation (RLS at application layer)
 * Denies cross-tenant access even for authenticated users.
 */
const requireHospitalTenant = (req, res, next) => {
    const hospitalId = req.params.id || req.body.hospitalId;
    if (!hospitalId) return next(); // Some routes don't need it

    // Admins and super_admins bypass tenant isolation
    if (['super_admin', 'admin'].includes(req.user?.role)) return next();

    if (req.user?.hospitalId !== hospitalId) {
        return res.status(403).json({
            error: 'Forbidden: Cross-tenant data access denied',
            reason: 'hospital_id isolation enforced by RLS policy'
        });
    }
    next();
};

module.exports = { requireAuth, requireRole, requireHospitalTenant };
