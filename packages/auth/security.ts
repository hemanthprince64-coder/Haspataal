import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET') return next();

  const token = req.headers['x-csrf-token'] as string;
  const cookieToken = req.cookies?.csrf_token;

  if (
    !token ||
    !cookieToken ||
    !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(cookieToken))
  ) {
    return res.status(403).json({ error: 'Invalid CSRF token', success: false });
  }

  next();
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;",
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}

// Middleware to set security headers and CSRF cookie
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.cookies?.csrf_token) {
    res.cookie('csrf_token', generateCsrfToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  securityHeadersMiddleware(req, res, next);
}
