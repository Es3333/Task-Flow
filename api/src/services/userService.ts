import { userRepo } from '../repositories/userRepo';
import { paginatedResponse, parsePagination } from '../utils/pagination';

export const userService = {
  async list(query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query as { page?: unknown; limit?: unknown });
    const [rows, total] = await userRepo.list(page, limit, skip);
    return paginatedResponse(rows, total, page, limit);
  },
};
