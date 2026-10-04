import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { taskController } from '../controllers/taskController';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { projectCreateSchema, projectUpdateSchema, addMemberSchema, taskCreateSchema } from '../schemas';

const router = Router();
router.use(requireAuth);

router.get('/', projectController.list);
router.post('/', validateBody(projectCreateSchema), projectController.create);
router.get('/:id', projectController.get);
router.put('/:id', validateBody(projectUpdateSchema), projectController.update);
router.delete('/:id', projectController.remove);
router.post('/:id/members', validateBody(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

// nested tasks
router.get('/:projectId/tasks', taskController.list);
router.post('/:projectId/tasks', validateBody(taskCreateSchema), taskController.create);

export default router;
