import { UserRole } from '@haspataal/types';
import { Request, Response, NextFunction } from 'express';

import { requireAuth, requireRole as checkRole } from './auth';

interface PermissionCheck {
  role?: UserRole | UserRole[];
  module?: string;
  action?: string;
  permissions?: string[];
}

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

export function withPermission(check: PermissionCheck) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await requireAuth('session');

      if (check.role) {
        const roles = Array.isArray(check.role) ? check.role : [check.role];
        if (!roles.includes(user.role as UserRole)) {
          return res.status(403).json({ error: 'Forbidden', success: false });
        }
      }

      if (check.module && check.action) {
        const hasPermission =
          check.permissions?.includes(`${check.module}:${check.action}`) ?? true;
        if (!hasPermission) {
          return res.status(403).json({ error: 'Forbidden', success: false });
        }
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
