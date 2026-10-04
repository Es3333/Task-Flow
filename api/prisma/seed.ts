import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@taskflow.local';
  const memberEmail = 'member@taskflow.local';

  const adminPass = await bcrypt.hash('Admin123!', 10);
  const memberPass = await bcrypt.hash('Member123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, name: 'Admin', role: 'ADMIN', passwordHash: adminPass },
  });
  const member = await prisma.user.upsert({
    where: { email: memberEmail },
    update: {},
    create: { email: memberEmail, name: 'Member', role: 'MEMBER', passwordHash: memberPass },
  });

  const project = await prisma.project.upsert({
    where: { id: 'seed-project-1' },
    update: {},
    create: {
      id: 'seed-project-1',
      name: 'TaskFlow Launch',
      description: 'Seed project with sample kanban tasks',
      ownerId: admin.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: admin.id } },
    update: {},
    create: { projectId: project.id, userId: admin.id },
  });
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: member.id } },
    update: {},
    create: { projectId: project.id, userId: member.id },
  });

  const count = await prisma.task.count({ where: { projectId: project.id } });
  if (count === 0) {
    await prisma.task.createMany({
      data: [
        { title: 'Design kanban board', description: 'Columns for TODO / IN_PROGRESS / DONE', status: 'TODO', priority: 'HIGH', projectId: project.id, creatorId: admin.id, assigneeId: member.id, position: 0 },
        { title: 'Implement auth', description: 'JWT access + refresh', status: 'IN_PROGRESS', priority: 'HIGH', projectId: project.id, creatorId: admin.id, assigneeId: admin.id, position: 0 },
        { title: 'Write seed script', description: 'Demo data', status: 'DONE', priority: 'MEDIUM', projectId: project.id, creatorId: admin.id, position: 0 },
        { title: 'Overdue example', description: 'Shows up on dashboard', status: 'TODO', priority: 'LOW', projectId: project.id, creatorId: admin.id, dueDate: new Date(Date.now() - 86400000), position: 1 },
      ],
    });
  }
  console.log('Seed complete:', { admin: admin.email, member: member.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
