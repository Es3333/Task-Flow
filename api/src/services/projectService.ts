import { projectRepo } from '../repositories/projectRepo';
import { userRepo } from '../repositories/userRepo';
import { ApiError } from '../utils/ApiError';
import { paginatedResponse, parsePagination } from '../utils/pagination';

export const projectService = {
  async create(ownerId: string, input: { name: string; description?: string | null }) {
    const project = await projectRepo.create({ ...input, ownerId });
    await projectRepo.addMember(project.id, ownerId);
    return projectRepo.findById(project.id);
  },

  async list(userId: string, role: string, query: Record<string, unknown>) {
    const { page, limit, skip } = parsePagination(query as { page?: unknown; limit?: unknown });
    const search = typeof query.search === 'string' ? query.search : undefined;
    const [rows, total] = await projectRepo.listForUser(userId, role === 'ADMIN', skip, limit, search);
    return paginatedResponse(rows, total, page, limit);
  },

  async get(userId: string, role: string, id: string) {
    const project = await projectRepo.findById(id);
    if (!project) throw ApiError.notFound('Project not found');
    if (role !== 'ADMIN') {
      const member = await projectRepo.isMember(id, userId);
      const owner = await projectRepo.isOwner(id, userId);
      if (!member && !owner) throw ApiError.forbidden('Not a project member');
    }
    return project;
  },

  async canAccess(userId: string, role: string, projectId: string): Promise<boolean> {
    if (role === 'ADMIN') {
      const p = await projectRepo.findById(projectId);
      return !!p;
    }
    const member = await projectRepo.isMember(projectId, userId);
    if (member) return true;
    const owner = await projectRepo.isOwner(projectId, userId);
    return !!owner;
  },

  async update(userId: string, role: string, id: string, input: { name?: string; description?: string | null }) {
    const project = await projectRepo.findById(id);
    if (!project) throw ApiError.notFound('Project not found');
    if (role !== 'ADMIN' && project.ownerId !== userId) throw ApiError.forbidden('Only owner can update project');
    return projectRepo.update(id, input);
  },

  async remove(userId: string, role: string, id: string) {
    const project = await projectRepo.findById(id);
    if (!project) throw ApiError.notFound('Project not found');
    if (role !== 'ADMIN' && project.ownerId !== userId) throw ApiError.forbidden('Only owner can delete project');
    await projectRepo.remove(id);
  },

  async addMember(userId: string, role: string, projectId: string, payload: { email?: string; userId?: string }) {
    const project = await projectRepo.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    if (role !== 'ADMIN' && project.ownerId !== userId) throw ApiError.forbidden('Only owner can manage members');
    let targetId = payload.userId;
    if (!targetId && payload.email) {
      const u = await userRepo.findByEmail(payload.email.toLowerCase());
      if (!u) throw ApiError.notFound('User not found');
      targetId = u.id;
    }
    if (!targetId) throw ApiError.badRequest('Provide email or userId');
    await projectRepo.addMember(projectId, targetId);
    return projectRepo.findById(projectId);
  },

  async removeMember(userId: string, role: string, projectId: string, memberId: string) {
    const project = await projectRepo.findById(projectId);
    if (!project) throw ApiError.notFound('Project not found');
    if (role !== 'ADMIN' && project.ownerId !== userId) throw ApiError.forbidden('Only owner can manage members');
    if (memberId === project.ownerId) throw ApiError.badRequest('Cannot remove project owner');
    await projectRepo.removeMember(projectId, memberId);
  },
};
