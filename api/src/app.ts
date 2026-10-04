import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import { errorHandler, notFound } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/users', userRoutes);

  // Swagger docs
  try {
    const candidates = [
      path.join(__dirname, 'openapi.yaml'),
      path.join(__dirname, '../src/openapi.yaml'),
      path.join(process.cwd(), 'src/openapi.yaml'),
      path.join(process.cwd(), 'dist/openapi.yaml'),
    ];
    const found = candidates.find((p) => fs.existsSync(p));
    if (found) {
      const doc = YAML.parse(fs.readFileSync(found, 'utf8'));
      app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(doc));
      app.get('/api/openapi.yaml', (_req, res) => res.sendFile(found));
    }
  } catch (e) {
    console.warn('Swagger load failed', e);
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
