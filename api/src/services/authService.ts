import { userRepo } from '../repositories/userRepo';
import { refreshRepo } from '../repositories/refreshRepo';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccess, signRefresh, verifyRefresh, hashToken, refreshExpiryDate } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

function toPublicUser(u: { id: string; email: string; name: string; role: string }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export const authService = {
  async register(input: { name: string; email: string; password: string; role?: 'ADMIN' | 'MEMBER' }) {
    const existing = await userRepo.findByEmail(input.email.toLowerCase());
    if (existing) throw ApiError.conflict('Email already registered');

    // Bootstrap: first user becomes ADMIN. Otherwise only existing ADMIN can create ADMINs —
    // for simplicity, public registration forces MEMBER unless no admins exist.
    const adminCount = await userRepo.countAdmins();
    const role = adminCount === 0 ? 'ADMIN' : 'MEMBER';

    const user = await userRepo.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash: await hashPassword(input.password),
      role: role as 'ADMIN' | 'MEMBER',
    });
    const accessToken = signAccess({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefresh(user.id);
    await refreshRepo.create({ tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiryDate() });
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email.toLowerCase());
    if (!user) throw ApiError.unauthorized('Invalid credentials');
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw ApiError.unauthorized('Invalid credentials');
    const accessToken = signAccess({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefresh(user.id);
    await refreshRepo.create({ tokenHash: hashToken(refreshToken), userId: user.id, expiresAt: refreshExpiryDate() });
    return { user: toPublicUser(user), accessToken, refreshToken };
  },

  async refresh(token: string) {
    let sub: string;
    try {
      sub = verifyRefresh(token).sub;
    } catch {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const stored = await refreshRepo.findByHash(hashToken(token));
    if (!stored || stored.revoked || stored.expiresAt < new Date() || stored.userId !== sub) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    const user = await userRepo.findById(sub);
    if (!user) throw ApiError.unauthorized('Invalid refresh token');
    // rotate
    await refreshRepo.revokeByHash(hashToken(token));
    const accessToken = signAccess({ sub: user.id, email: user.email, role: user.role });
    const newRefresh = signRefresh(user.id);
    await refreshRepo.create({ tokenHash: hashToken(newRefresh), userId: user.id, expiresAt: refreshExpiryDate() });
    return { user: toPublicUser(user), accessToken, refreshToken: newRefresh };
  },

  async logout(token: string) {
    if (!token) return;
    await refreshRepo.revokeByHash(hashToken(token));
  },

  async me(userId: string) {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  },
};
