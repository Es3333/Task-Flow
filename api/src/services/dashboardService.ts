import { prisma } from '../config/db';
import { taskRepo } from '../repositories/taskRepo';

export const dashboardService = {
  async summary(userId: string, role: string) {
    const isAdmin = role === 'ADMIN';
    let projectIds: string[] = [];
    if (!isAdmin) {
      const memberships = await prisma.projectMember.findMany({ where: { userId }, select: { projectId: true } });
      const owned = await prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } });
      projectIds = [...new Set([...memberships.map((m) => m.projectId), ...owned.map((o) => o.id)])];
    } else {
      const all = await prisma.project.findMany({ select: { id: true } });
      projectIds = all.map((p) => p.id);
    }
    const [byStatus, overdue, total] = await taskRepo.statsForUserProjects(projectIds, userId, isAdmin);
    const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    for (const g of byStatus) counts[g.status] = g._count._all;
    return {
      totalProjects: projectIds.length,
      totalTasks: total,
      byStatus: counts,
      overdue,
    };
  },
};
