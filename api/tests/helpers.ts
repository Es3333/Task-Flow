import { PrismaClient } from '@prisma/client';

export function canRunIntegration(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function checkDb(prisma: PrismaClient): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export const uniqueEmail = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`;
