import { prisma } from '../config/db';
import { Role } from '@prisma/client';

export const userRepo = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: { email: string; name: string; passwordHash: string; role: Role }) {
    return prisma.user.create({ data });
  },
  list(page: number, limit: number, skip: number) {
    return Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);
  },
  countAdmins() {
    return prisma.user.count({ where: { role: 'ADMIN' } });
  },
};
