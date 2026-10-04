import dotenv from 'dotenv';
dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required('DATABASE_URL', 'postgresql://taskflow:taskflow_dev_password@localhost:5432/taskflow?schema=public'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'change-me-access-secret-min-32-chars-dev-only'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'change-me-refresh-secret-min-32-chars-dev-only'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  rateWindowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS ?? '900000', 10),
  rateMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '50', 10),
};
