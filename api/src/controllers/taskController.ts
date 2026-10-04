import { Request, Response } from 'express';
import { taskService } from '../services/taskService';
import { asyncHandler } from '../utils/asyncHandler';

export const taskController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await taskService.list(req.user!.id, req.user!.role, req.params.projectId, req.query as Record<string, unknown>);
    res.json(result);
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.create(req.user!.id, req.user!.role, req.params.projectId, req.body);
    res.status(201).json(task);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.get(req.user!.id, req.user!.role, req.params.id);
    res.json(task);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.update(req.user!.id, req.user!.role, req.params.id, req.body);
    res.json(task);
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await taskService.remove(req.user!.id, req.user!.role, req.params.id);
    res.status(204).send();
  }),
};
