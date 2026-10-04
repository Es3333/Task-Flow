import { taskRepo } from '../repositories/taskRepo';
import { projectService } from './projectService';
import { ApiError } from '../utils/ApiError';
import { paginatedResponse, parsePagination } from '../utils/pagination';
import { TaskStatus } from '@prisma/client';

export const taskService = {
  async list(userId: string, role: string, projectId: string, query: Record<string, unknown>) {
    const ok = await projectService.canAccess(userId, role, projectId);
    if (!ok) throw ApiError.forbidden('Not a project member');
    const { page, limit, skip } = parsePagination(query as { page?: unknown; limit?: unknown });
    const filter = {
      status: query.status as TaskStatus | undefined,
      priority: query.priority as 'LOW' | 'MEDIUM' | 'HIGH' | undefined,
      assigneeId: query.assigneeId as string | undefined,
      search: query.search as string | undefined,
      overdue: query.overdue === 'true' || query.overdue === true,
      sort: query.sort as string | undefined,
      order: (query.order as 'asc' | 'desc' | undefined) ?? 'asc',
    };
    const [rows, total] = await taskRepo.list(projectId, skip, limit, filter);
    return paginatedResponse(rows, total, page, limit);
  },

  async create(
    userId: string,
    role: string,
    projectId: string,
    input: { title: string; description?: string | null; status?: TaskStatus; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; dueDate?: string | null; assigneeId?: string | null }
  ) {
    const ok = await projectService.canAccess(userId, role, projectId);
    if (!ok) throw ApiError.forbidden('Not a project member');
    const status = input.status ?? 'TODO';
    const max = await taskRepo.maxPosition(projectId, status);
    return taskRepo.create({
      title: input.title,
      description: input.description ?? null,
      status,
      priority: input.priority ?? 'MEDIUM',
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      assigneeId: input.assigneeId ?? null,
      projectId,
      creatorId: userId,
      position: (max._max.position ?? -1) + 1,
    });
  },

  async get(userId: string, role: string, id: string) {
    const task = await taskRepo.findById(id);
    if (!task) throw ApiError.notFound('Task not found');
    const ok = await projectService.canAccess(userId, role, task.projectId);
    if (!ok) throw ApiError.forbidden('Not a project member');
    return task;
  },

  async update(
    userId: string,
    role: string,
    id: string,
    input: { title?: string; description?: string | null; status?: TaskStatus; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; dueDate?: string | null; assigneeId?: string | null; position?: number }
  ) {
    const existing = await taskRepo.findById(id);
    if (!existing) throw ApiError.notFound('Task not found');
    const ok = await projectService.canAccess(userId, role, existing.projectId);
    if (!ok) throw ApiError.forbidden('Not a project member');
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.assigneeId !== undefined) data.assigneeId = input.assigneeId;
    if (input.position !== undefined) data.position = input.position;
    // if status changed without explicit position, append to end
    if (input.status && input.status !== existing.status && input.position === undefined) {
      const max = await taskRepo.maxPosition(existing.projectId, input.status);
      data.position = (max._max.position ?? -1) + 1;
    }
    return taskRepo.update(id, data as never);
  },

  async remove(userId: string, role: string, id: string) {
    const existing = await taskRepo.findById(id);
    if (!existing) throw ApiError.notFound('Task not found');
    const ok = await projectService.canAccess(userId, role, existing.projectId);
    if (!ok) throw ApiError.forbidden('Not a project member');
    await taskRepo.remove(id);
  },
};
