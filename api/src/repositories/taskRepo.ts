import { prisma } from '../config/db';
import { Prisma, TaskStatus } from '@prisma/client';

export interface TaskListFilter {
  status?: TaskStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assigneeId?: string;
  search?: string;
  overdue?: boolean;
  sort?: string;
  order?: 'asc' | 'desc';
}

export const taskRepo = {
  create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ data });
  },
  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  },
  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.task.delete({ where: { id } });
  },
  maxPosition(projectId: string, status: TaskStatus) {
    return prisma.task.aggregate({ where: { projectId, status }, _max: { position: true } });
  },
  list(projectId: string, skip: number, limit: number, f: TaskListFilter) {
    const where: Prisma.TaskWhereInput = { projectId };
    if (f.status) where.status = f.status;
    if (f.priority) where.priority = f.priority;
    if (f.assigneeId) where.assigneeId = f.assigneeId;
    if (f.search) {
      where.OR = [
        { title: { contains: f.search, mode: 'insensitive' } },
        { description: { contains: f.search, mode: 'insensitive' } },
      ];
    }
    if (f.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'DONE' };
    }
    const allowedSort = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'position', 'title'];
    const sort = allowedSort.includes(f.sort ?? '') ? (f.sort as string) : 'position';
    const order = f.order ?? 'asc';
    return Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sort]: order }],
        include: { assignee: { select: { id: true, name: true, email: true } } },
      }),
      prisma.task.count({ where }),
    ]);
  },
  statsForUserProjects(projectIds: string[], userId: string, isAdmin: boolean) {
    const scope: Prisma.TaskWhereInput = isAdmin
      ? projectIds.length
        ? { projectId: { in: projectIds } }
        : {}
      : { projectId: { in: projectIds } };
    void userId;
    return Promise.all([
      prisma.task.groupBy({ by: ['status'], where: scope, _count: { _all: true } }),
      prisma.task.count({ where: { ...scope, dueDate: { lt: new Date() }, status: { not: 'DONE' } } }),
      prisma.task.count({ where: scope }),
    ]);
  },
};
