import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid Authorization header'));
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role as AuthUser['role'] };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

export function requireRole(...roles: Array<'ADMIN' | 'MEMBER'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient permissions'));
    return next();
  };
}
