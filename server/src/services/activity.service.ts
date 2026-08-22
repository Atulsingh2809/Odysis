import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { requireTripPermission } from './authorization.service.js';

export class ActivityService {
  async search(params: {
    page: number; limit: number; search?: string; cityId?: string;
    category?: string; minCost?: number; maxCost?: number;
    minDuration?: number; maxDuration?: number;
    sortBy: string; sortOrder: 'asc' | 'desc';
  }) {
    const where: Prisma.ActivityWhereInput = {
      ...(params.search && { name: { contains: params.search, mode: 'insensitive' } }),
      ...(params.cityId && { cityId: params.cityId }),
      ...(params.category && { category: params.category as Prisma.EnumActivityCategoryFilter['equals'] }),
      ...(params.minCost !== undefined || params.maxCost !== undefined
        ? {
            estimatedCost: {
              ...(params.minCost !== undefined && { gte: params.minCost }),
              ...(params.maxCost !== undefined && { lte: params.maxCost }),
            },
          }
        : {}),
      ...(params.minDuration !== undefined || params.maxDuration !== undefined
        ? {
            durationMinutes: {
              ...(params.minDuration !== undefined && { gte: params.minDuration }),
              ...(params.maxDuration !== undefined && { lte: params.maxDuration }),
            },
          }
        : {}),
    };

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: { city: { select: { id: true, name: true, country: true } } },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return { activities, pagination: { page: params.page, limit: params.limit, total } };
  }

  async getById(id: string) {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { city: true },
    });
    if (!activity) throw new NotFoundError('Activity not found', 'ACTIVITY_NOT_FOUND');
    return activity;
  }

  async addToStop(stopId: string, userId: string, data: {
    activityId: string; scheduledTime?: string; scheduledDate?: Date; notes?: string;
  }) {
    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundError('Stop not found', 'STOP_NOT_FOUND');
    await requireTripPermission(stop.tripId, userId, 'write');

    const maxOrder = await prisma.stopActivity.aggregate({
      where: { stopId },
      _max: { orderIndex: true },
    });

    return prisma.stopActivity.create({
      data: {
        stopId,
        activityId: data.activityId,
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
        scheduledTime: data.scheduledTime,
        scheduledDate: data.scheduledDate,
        notes: data.notes,
      },
      include: { activity: true },
    });
  }

  async removeFromStop(stopActivityId: string, userId: string) {
    const sa = await prisma.stopActivity.findUnique({
      where: { id: stopActivityId },
      include: { stop: true },
    });
    if (!sa) throw new NotFoundError('Stop activity not found', 'STOP_ACTIVITY_NOT_FOUND');
    await requireTripPermission(sa.stop.tripId, userId, 'write');

    await prisma.$transaction(async (tx) => {
      await tx.stopActivity.delete({ where: { id: stopActivityId } });
      const remaining = await tx.stopActivity.findMany({
        where: { stopId: sa.stopId },
        orderBy: { orderIndex: 'asc' },
      });
      for (let i = 0; i < remaining.length; i++) {
        await tx.stopActivity.update({
          where: { id: remaining[i].id },
          data: { orderIndex: i },
        });
      }
    });

    return { message: 'Activity removed from stop' };
  }

  async reorder(tripId: string, userId: string, orderedIds: string[]) {
    await requireTripPermission(tripId, userId, 'write');

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.stopActivity.update({
          where: { id },
          data: { orderIndex: index },
        }),
      ),
    );

    return { message: 'Activities reordered' };
  }

  async updateStopActivity(stopActivityId: string, userId: string, data: {
    scheduledTime?: string; scheduledDate?: Date; notes?: string;
  }) {
    const sa = await prisma.stopActivity.findUnique({
      where: { id: stopActivityId },
      include: { stop: true },
    });
    if (!sa) throw new NotFoundError('Stop activity not found');
    await requireTripPermission(sa.stop.tripId, userId, 'write');

    return prisma.stopActivity.update({
      where: { id: stopActivityId },
      data,
      include: { activity: true },
    });
  }
}

export const activityService = new ActivityService();
