import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { ConflictError, NotFoundError } from '../utils/errors.js';

export class ProfileService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) throw new NotFoundError('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.profile,
    };
  }

  async updateProfile(userId: string, data: {
    name?: string; avatarUrl?: string; language?: string; currency?: string;
  }) {
    const updates: Prisma.UserUpdateInput = {};
    if (data.name) updates.name = data.name;

    const profileUpdates: Prisma.ProfileUpdateInput = {};
    if (data.avatarUrl !== undefined) profileUpdates.avatarUrl = data.avatarUrl || null;
    if (data.language) profileUpdates.language = data.language;
    if (data.currency) profileUpdates.currency = data.currency as Prisma.ProfileUpdateInput['currency'];

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        profile: { update: profileUpdates },
      },
      include: { profile: true },
    });
  }

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { message: 'Account deleted successfully' };
  }

  async getSavedDestinations(userId: string) {
    return prisma.savedDestination.findMany({
      where: { userId },
      include: { city: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveDestination(userId: string, cityId: string) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city) throw new NotFoundError('City not found');

    try {
      return await prisma.savedDestination.create({
        data: { userId, cityId },
        include: { city: true },
      });
    } catch {
      throw new ConflictError('Destination already saved', 'ALREADY_SAVED');
    }
  }

  async removeSavedDestination(userId: string, cityId: string) {
    await prisma.savedDestination.deleteMany({ where: { userId, cityId } });
    return { message: 'Destination removed' };
  }
}

export const profileService = new ProfileService();
