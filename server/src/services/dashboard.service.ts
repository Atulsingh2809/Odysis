import prisma from '../config/database.js';
import { getUserTripIds } from './authorization.service.js';
import { budgetService } from './budget.service.js';

export class DashboardService {
  async getDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const tripIds = await getUserTripIds(userId);
    const now = new Date();

    const [upcomingTrips, recentTrips, allTrips] = await Promise.all([
      prisma.trip.findMany({
        where: { id: { in: tripIds }, startDate: { gte: now } },
        include: { stops: { include: { city: true } }, budget: true, _count: { select: { stops: true } } },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
      prisma.trip.findMany({
        where: { id: { in: tripIds } },
        include: { stops: { include: { city: true } }, budget: true, _count: { select: { stops: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      prisma.trip.findMany({
        where: { id: { in: tripIds } },
        include: { budget: true },
      }),
    ]);

    let totalBudget = 0;
    let totalEstimated = 0;
    for (const trip of allTrips) {
      if (trip.budget) totalBudget += Number(trip.budget.totalAmount);
      try {
        const summary = await budgetService.getSummary(trip.id, userId);
        totalEstimated += summary.totalEstimated;
      } catch {
        // skip inaccessible
      }
    }

    return {
      welcomeName: user?.name ?? 'Traveler',
      upcomingTrips: upcomingTrips.map(formatTripCard),
      recentTrips: recentTrips.map(formatTripCard),
      budgetOverview: {
        totalBudget,
        totalEstimated,
        tripCount: allTrips.length,
      },
      quickActions: [
        { label: 'Plan New Trip', path: '/trips/new' },
        { label: 'Explore Cities', path: '/explore/cities' },
        { label: 'Explore Activities', path: '/explore/activities' },
        { label: 'My Trips', path: '/trips' },
      ],
    };
  }
}

function formatTripCard(trip: {
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

export const dashboardService = new DashboardService();
