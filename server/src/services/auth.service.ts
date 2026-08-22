import argon2 from 'argon2';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../utils/errors.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  parseExpiresIn,
} from '../utils/helpers.js';

export class AuthService {
  async signup(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email already registered', 'EMAIL_EXISTS');

    const passwordHash = await argon2.hash(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: { create: {} },
      },
      include: { profile: true },
    });

    const tokens = await this.createTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

    const tokens = await this.createTokens(user.id, user.email, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { profile: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedError('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await this.createTokens(stored.user.id, stored.user.email, stored.user.role);
    return { user: this.sanitizeUser(stored.user), ...tokens };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    const token = generateResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    if (config.isDev) {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
      console.log(`[DEV] Reset URL: ${config.clientUrl}/reset-password?token=${token}`);
    }

    return {
      message: 'If an account exists, a reset link has been sent',
      ...(config.isDev ? { devToken: token } : {}),
    };
  }

  async resetPassword(token: string, password: string) {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new ValidationError('Invalid or expired reset token', 'INVALID_RESET_TOKEN');
    }

    const passwordHash = await argon2.hash(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return this.sanitizeUser(user);
  }

  private async createTokens(userId: string, email: string, role: string) {
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: parseExpiresIn(config.jwt.refreshExpiresIn),
      },
    });

    const accessToken = generateAccessToken({ userId, email, role });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
    profile: { avatarUrl: string | null; language: string; currency: string } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
    };
  }
}

export const authService = new AuthService();
