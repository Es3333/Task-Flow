import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { taskUpdateSchema } from '../schemas';

const router = Router();
router.use(requireAuth);

router.get('/:id', taskController.get);
router.put('/:id', validateBody(taskUpdateSchema), taskController.update);
router.delete('/:id', taskController.remove);

export default router;
