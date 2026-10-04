import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { registerSchema, loginSchema, refreshSchema } from '../schemas';
import { env } from '../config/env';

const router = Router();

const authLimiter = rateLimit({
  windowMs: env.rateWindowMs,
  max: env.rateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, try again later' } },
});

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;
