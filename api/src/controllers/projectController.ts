import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { asyncHandler } from '../utils/asyncHandler';

export const projectController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.create(req.user!.id, req.body);
    res.status(201).json(project);
  }),
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await projectService.list(req.user!.id, req.user!.role, req.query as Record<string, unknown>);
    res.json(result);
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.get(req.user!.id, req.user!.role, req.params.id);
    res.json(project);
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.update(req.user!.id, req.user!.role, req.params.id, req.body);
    res.json(project);
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await projectService.remove(req.user!.id, req.user!.role, req.params.id);
    res.status(204).send();
  }),
  addMember: asyncHandler(async (req: Request, res: Response) => {
    const project = await projectService.addMember(req.user!.id, req.user!.role, req.params.id, req.body);
    res.json(project);
  }),
  removeMember: asyncHandler(async (req: Request, res: Response) => {
    await projectService.removeMember(req.user!.id, req.user!.role, req.params.id, req.params.userId);
    res.status(204).send();
  }),
};
