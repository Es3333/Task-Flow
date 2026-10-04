import { prisma } from '../config/db';

export const projectRepo = {
  create(data: { name: string; description?: string | null; ownerId: string }) {
    return prisma.project.create({ data });
  },
  addMember(projectId: string, userId: string) {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: {},
      create: { projectId, userId },
    });
  },
  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });
  },
  isMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({ where: { projectId_userId: { projectId, userId } } });
  },
  isOwner(projectId: string, userId: string) {
    return prisma.project.findFirst({ where: { id: projectId, ownerId: userId } });
  },
  update(id: string, data: { name?: string; description?: string | null }) {
    return prisma.project.update({ where: { id }, data });
  },
  remove(id: string) {
    return prisma.project.delete({ where: { id } });
  },
  removeMember(projectId: string, userId: string) {
    return prisma.projectMember.deleteMany({ where: { projectId, userId } });
  },
  listForUser(userId: string, isAdmin: boolean, skip: number, limit: number, search?: string) {
    const where = isAdmin
      ? search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : {}
      : {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        };
    return Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true, members: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);
  },
};
