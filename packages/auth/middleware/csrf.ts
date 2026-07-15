import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const CSRF_HEADER = 'x-csrf-token';
const CSRF_COOKIE = 'csrf-token';
const CSRF_SECRET =
  process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET || 'csrf-secret-change-in-production';

function signToken(payload: Record<string, unknown>): string {
  return crypto.createHmac('sha256', CSRF_SECRET).update(JSON.stringify(payload)).digest('hex');
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER.toLowerCase()] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token',
      code: 'CSRF_INVALID',
    });
  }

  next();
}

export function generateCsrfToken(): string {
  const payload = {
    value: crypto.randomBytes(32).toString('hex'),
    ts: Date.now(),
  };
  return signToken(payload);
}

export function setCsrfCookie(res: Response) {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.[CSRF_COOKIE]) {
    setCsrfCookie(res);
  }
  next();
}
