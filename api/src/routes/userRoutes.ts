import { Router } from 'express';
import { userController } from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
router.use(requireAuth, requireRole('ADMIN'));
router.get('/', userController.list);

export default router;
