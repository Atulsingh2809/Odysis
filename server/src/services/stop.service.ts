import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { requireTripPermission } from './authorization.service.js';

export class StopService {
  async list(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'read');
    return prisma.tripStop.findMany({
      where: { tripId },
      include: {
        city: true,
        activities: {
          include: { activity: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async create(tripId: string, userId: string, data: {
    cityId: string; arrivalDate?: Date; departureDate?: Date;
    arrivalTime?: string; departureTime?: string; notes?: string;
  }) {
    await requireTripPermission(tripId, userId, 'write');

    const maxOrder = await prisma.tripStop.aggregate({
      where: { tripId },
      _max: { orderIndex: true },
    });

    return prisma.tripStop.create({
      data: {
        tripId,
        cityId: data.cityId,
        orderIndex: (maxOrder._max.orderIndex ?? -1) + 1,
        arrivalDate: data.arrivalDate,
        departureDate: data.departureDate,
        arrivalTime: data.arrivalTime,
        departureTime: data.departureTime,
        notes: data.notes,
      },
      include: { city: true, activities: { include: { activity: true } } },
    });
  }

  async update(stopId: string, userId: string, data: Partial<{
    cityId: string; arrivalDate?: Date; departureDate?: Date;
    arrivalTime?: string; departureTime?: string; notes?: string;
  }>) {
    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundError('Stop not found', 'STOP_NOT_FOUND');
    await requireTripPermission(stop.tripId, userId, 'write');

    return prisma.tripStop.update({
      where: { id: stopId },
      data,
      include: { city: true, activities: { include: { activity: true } } },
    });
  }

  async delete(stopId: string, userId: string) {
    const stop = await prisma.tripStop.findUnique({ where: { id: stopId } });
    if (!stop) throw new NotFoundError('Stop not found', 'STOP_NOT_FOUND');
    await requireTripPermission(stop.tripId, userId, 'write');

    await prisma.$transaction(async (tx) => {
      await tx.tripStop.delete({ where: { id: stopId } });
      const remaining = await tx.tripStop.findMany({
        where: { tripId: stop.tripId },
        orderBy: { orderIndex: 'asc' },
      });
      for (let i = 0; i < remaining.length; i++) {
        await tx.tripStop.update({
          where: { id: remaining[i].id },
          data: { orderIndex: i },
        });
      }
    });

    return { message: 'Stop deleted' };
  }

  async reorder(tripId: string, userId: string, orderedIds: string[]) {
    await requireTripPermission(tripId, userId, 'write');

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.tripStop.update({
          where: { id, tripId },
          data: { orderIndex: index },
        }),
      ),
    );

    return this.list(tripId, userId);
  }
}

export const stopService = new StopService();
