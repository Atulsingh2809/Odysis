import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { requireTripPermission, getUserTripIds } from './authorization.service.js';
import { generateShareToken } from '../utils/helpers.js';

export class TripService {
  async list(userId: string, params: {
    page: number; limit: number; search?: string; status?: string;
    sortBy: string; sortOrder: 'asc' | 'desc';
  }) {
    const tripIds = await getUserTripIds(userId);
    const where: Prisma.TripWhereInput = {
      id: { in: tripIds },
      ...(params.search && { name: { contains: params.search } }),
      ...(params.status && { status: params.status }),
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          stops: { include: { city: true } },
          budget: true,
          _count: { select: { stops: true } },
        },
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      trips: trips.map((t) => this.formatTripListItem(t)),
      pagination: { page: params.page, limit: params.limit, total },
    };
  }

  async getById(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'read');
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: { activity: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        budget: true,
        expenses: { orderBy: { date: 'asc' } },
        collaborators: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    if (!trip) throw new NotFoundError('Trip not found', 'TRIP_NOT_FOUND');
    return trip;
  }

  async create(userId: string, data: {
    name: string; startDate: Date; endDate: Date;
    description?: string; coverImageUrl?: string; currency: string; status?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          description: data.description,
          coverImageUrl: data.coverImageUrl || null,
          currency: data.currency,
          status: data.status ?? 'DRAFT',
        },
        include: { stops: true, budget: true },
      });

      await tx.tripCollaborator.create({
        data: { tripId: trip.id, userId, role: 'OWNER' },
      });

      return trip;
    });
  }

  async update(tripId: string, userId: string, data: Partial<{
    name: string; startDate: Date; endDate: Date;
    description?: string; coverImageUrl?: string; currency: string; status?: string;
  }>) {
    await requireTripPermission(tripId, userId, 'write');
    return prisma.trip.update({
      where: { id: tripId },
      data: {
        ...data,
        coverImageUrl: data.coverImageUrl === '' ? null : data.coverImageUrl,
        currency: data.currency,
      },
      include: { stops: { include: { city: true } }, budget: true },
    });
  }

  async delete(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'admin');
    await prisma.trip.delete({ where: { id: tripId } });
    return { message: 'Trip deleted successfully' };
  }

  async duplicate(tripId: string, userId: string) {
    const original = await this.getById(tripId, userId);
    return this.cloneTripRecord(original, userId);
  }

  async enableShare(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'admin');
    const shareToken = generateShareToken();
    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: { shareToken, isPublic: true },
    });
    return { shareToken: trip.shareToken, shareUrl: `/shared/${trip.shareToken}` };
  }

  async disableShare(tripId: string, userId: string) {
    await requireTripPermission(tripId, userId, 'admin');
    await prisma.trip.update({
      where: { id: tripId },
      data: { shareToken: null, isPublic: false },
    });
    return { message: 'Sharing disabled' };
  }

  async getPublic(token: string) {
    const trip = await prisma.trip.findFirst({
      where: { shareToken: token, isPublic: true },
      include: {
        stops: {
          include: {
            city: true,
            activities: {
              include: { activity: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        budget: true,
      },
    });
    if (!trip) throw new NotFoundError('Shared trip not found', 'SHARED_NOT_FOUND');

    return {
      name: trip.name,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImageUrl: trip.coverImageUrl,
      currency: trip.currency,
      stops: trip.stops,
      budget: trip.budget,
    };
  }

  async copyFromShare(token: string, userId: string) {
    const original = await prisma.trip.findFirst({
      where: { shareToken: token, isPublic: true },
      include: {
        stops: {
          include: { activities: true },
          orderBy: { orderIndex: 'asc' },
        },
        budget: true,
        expenses: true,
      },
    });
    if (!original) throw new NotFoundError('Shared trip not found', 'SHARED_NOT_FOUND');
    return this.cloneTripRecord(original, userId);
  }

  private async cloneTripRecord(
    original: {
      name: string;
      description: string | null;
      startDate: Date;
      endDate: Date;
      coverImageUrl: string | null;
      currency: string;
      budget: { totalAmount: unknown; currency: string } | null;
      stops: {
        cityId: string;
        orderIndex: number;
        arrivalDate: Date | null;
        departureDate: Date | null;
        arrivalTime: string | null;
        departureTime: string | null;
        notes: string | null;
        activities: {
          activityId: string;
          orderIndex: number;
          scheduledTime: string | null;
          scheduledDate: Date | null;
          notes: string | null;
        }[];
      }[];
      expenses: {
        category: string;
        amount: unknown;
        currency: string;
        description: string | null;
        date: Date;
      }[];
    },
    userId: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const newTrip = await tx.trip.create({
        data: {
          userId,
          name: `${original.name} (Copy)`,
          description: original.description,
          startDate: original.startDate,
          endDate: original.endDate,
          coverImageUrl: original.coverImageUrl,
          status: 'DRAFT',
          currency: original.currency,
        },
      });

      await tx.tripCollaborator.create({
        data: { tripId: newTrip.id, userId, role: 'OWNER' },
      });

      if (original.budget) {
        await tx.budget.create({
          data: {
            tripId: newTrip.id,
            totalAmount: Number(original.budget.totalAmount),
            currency: original.budget.currency,
          },
        });
      }

      for (const stop of original.stops) {
        const newStop = await tx.tripStop.create({
          data: {
            tripId: newTrip.id,
            cityId: stop.cityId,
            orderIndex: stop.orderIndex,
            arrivalDate: stop.arrivalDate,
            departureDate: stop.departureDate,
            arrivalTime: stop.arrivalTime,
            departureTime: stop.departureTime,
            notes: stop.notes,
          },
        });

        for (const sa of stop.activities) {
          await tx.stopActivity.create({
            data: {
              stopId: newStop.id,
              activityId: sa.activityId,
              orderIndex: sa.orderIndex,
              scheduledTime: sa.scheduledTime,
              scheduledDate: sa.scheduledDate,
              notes: sa.notes,
            },
          });
        }
      }

      for (const expense of original.expenses) {
        await tx.expense.create({
          data: {
            tripId: newTrip.id,
            category: expense.category,
            amount: Number(expense.amount),
            currency: expense.currency,
            description: expense.description,
            date: expense.date,
          },
        });
      }

      return newTrip;
    });
  }

  private formatTripListItem(trip: {
    id: string; name: string; startDate: Date; endDate: Date;
    coverImageUrl: string | null; status: string; currency: string;
    stops: { city: { name: string } }[];
    budget: { totalAmount: unknown } | null;
    _count: { stops: number };
  }) {
    return {
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      coverImageUrl: trip.coverImageUrl,
      status: trip.status,
      currency: trip.currency,
      destinationCount: trip._count.stops,
      destinations: trip.stops.map((s) => s.city.name),
      budgetLimit: trip.budget ? Number(trip.budget.totalAmount) : null,
    };
  }
}

export const tripService = new TripService();
