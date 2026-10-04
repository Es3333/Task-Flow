import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  email: string;
  role: string;
}

export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn } as jwt.SignOptions);
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function signRefresh(userId: string): string {
  // jti guarantees uniqueness: without it, two tokens minted in the same
  // second are byte-identical (JWT iat has 1s resolution) and would collide
  // on the stored token hash.
  return jwt.sign({ sub: userId, type: 'refresh', jti: crypto.randomUUID() }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyRefresh(token: string): { sub: string } {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as { sub: string; type?: string };
  if (decoded.type !== 'refresh') throw new Error('Invalid refresh token type');
  return { sub: decoded.sub };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshExpiryDate(): Date {
  // parse 7d / 24h / 60m roughly; default 7 days
  const raw = env.jwtRefreshExpiresIn;
  const m = raw.match(/^(\d+)([smhd])$/);
  const now = Date.now();
  if (!m) return new Date(now + 7 * 24 * 3600 * 1000);
  const n = parseInt(m[1], 10);
  const unit = m[2];
  const mult = unit === 's' ? 1000 : unit === 'm' ? 60000 : unit === 'h' ? 3600000 : 86400000;
  return new Date(now + n * mult);
}
