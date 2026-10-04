import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { asyncHandler } from '../utils/asyncHandler';

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.list(req.query as Record<string, unknown>);
    res.json(result);
  }),
};
