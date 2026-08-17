import { UserRole } from '@haspataal/types';
import { Request, Response, NextFunction } from 'express';

import { requireAuth } from './auth';
import { Permission } from './authorization/permission';
import { hasPermission } from './authorization/policy';
import { requireRole as checkRole } from './authorization/requireRole';

export function createAuthMiddleware(sessionName = 'session') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await requireAuth(sessionName);
      (req as any).user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized', success: false });
    }
  };
}

export function createRoleMiddleware(role: UserRole | UserRole[], sessionName = 'session') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await checkRole(role, sessionName);
      (req as any).user = user;
      next();
    } catch {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions', success: false });
    }
  };
}

/**
 * Express middleware to enforce fine-grained permissions.
 * Reads from the central Policy Matrix.
 */
export function withPermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await requireAuth('session');

      if (!hasPermission(user.role, permission)) {
        return res.status(403).json({ error: 'Forbidden', success: false });
      }

      (req as any).user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Unauthorized', success: false });
    }
  };
}

// Express middleware for tenant context
export function tenantContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const hospitalId = (req as any).user?.hospitalId;
  if (hospitalId) {
    res.locals.hospitalId = hospitalId;
  }
  next();
}
