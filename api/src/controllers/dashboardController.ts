import { Request, Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { asyncHandler } from '../utils/asyncHandler';

export const dashboardController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.summary(req.user!.id, req.user!.role);
    res.json(data);
  }),
};
