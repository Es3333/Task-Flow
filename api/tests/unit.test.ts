import { parsePagination, paginatedResponse } from '../src/utils/pagination';
import { registerSchema, taskCreateSchema } from '../src/schemas';
import { signAccess, verifyAccess, signRefresh, verifyRefresh, hashToken } from '../src/utils/jwt';
import { hashPassword, comparePassword } from '../src/utils/password';

describe('pagination', () => {
  it('defaults to page 1 limit 20', () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 20, skip: 0 });
  });
  it('clamps invalid values and caps limit at 100', () => {
    expect(parsePagination({ page: '-3', limit: '500' })).toEqual({ page: 1, limit: 100, skip: 0 });
    expect(parsePagination({ page: '2', limit: '10' })).toEqual({ page: 2, limit: 10, skip: 10 });
  });
  it('builds paginated response shape', () => {
    const r = paginatedResponse([1, 2], 45, 2, 20);
    expect(r.pagination).toEqual({ page: 2, limit: 20, total: 45, totalPages: 3 });
  });
});

describe('zod validation', () => {
  it('rejects invalid register payload', () => {
    const r = registerSchema.safeParse({ email: 'not-an-email', password: 'short', name: 'x' });
    expect(r.success).toBe(false);
  });
  it('accepts valid task payload', () => {
    const r = taskCreateSchema.safeParse({ title: 'Build kanban' });
    expect(r.success).toBe(true);
  });
});

describe('jwt utils', () => {
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'test-access-secret-min-32-chars-xxxx';
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret-min-32-chars-xxx';
  it('signs and verifies access tokens', () => {
    const t = signAccess({ sub: 'u1', email: 'a@b.c', role: 'MEMBER' });
    const p = verifyAccess(t);
    expect(p.sub).toBe('u1');
  });
  it('signs and verifies refresh tokens and hashes deterministically', () => {
    const t = signRefresh('u1');
    expect(verifyRefresh(t).sub).toBe('u1');
    expect(hashToken(t)).toBe(hashToken(t));
  });
});

describe('password utils', () => {
  it('hashes and compares', async () => {
    const h = await hashPassword('Secret123!');
    expect(await comparePassword('Secret123!', h)).toBe(true);
    expect(await comparePassword('wrong', h)).toBe(false);
  });
});
