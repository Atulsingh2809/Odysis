import prisma from '../config/database.js';

export class AdminService {
  async getAnalytics() {
    const [
      totalUsers,
      totalTrips,
      tripsOverTime,
      popularCities,
      popularActivities,
      avgDuration,
      avgBudget,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.tripStop.groupBy({
        by: ['cityId'],
        _count: true,
        orderBy: { _count: { cityId: 'desc' } },
        take: 10,
      }),
      prisma.stopActivity.groupBy({
        by: ['activityId'],
        _count: true,
        orderBy: { _count: { activityId: 'desc' } },
        take: 10,
      }),
      this.avgTripDuration(),
      this.avgTripBudget(),
    ]);

    const cityIds = popularCities.map((c) => c.cityId);
    const cities = await prisma.city.findMany({
      where: { id: { in: cityIds } },
      select: { id: true, name: true, country: true },
    });
    const cityMap = Object.fromEntries(cities.map((c) => [c.id, c]));

    const activityIds = popularActivities.map((a) => a.activityId);
    const activities = await prisma.activity.findMany({
      where: { id: { in: activityIds } },
      select: { id: true, name: true, category: true },
    });
    const activityMap = Object.fromEntries(activities.map((a) => [a.id, a]));

    const tripsByMonth = this.groupTripsByMonth(tripsOverTime);

    return {
      totalUsers,
      totalTrips,
      tripsByMonth,
      popularCities: popularCities.map((c) => ({
        city: cityMap[c.cityId],
        count: c._count,
      })),
      popularActivities: popularActivities.map((a) => ({
        activity: activityMap[a.activityId],
        count: a._count,
      })),
      averageTripDurationDays: avgDuration,
      averageTripBudget: avgBudget,
      engagement: {
        avgTripsPerUser: totalUsers > 0 ? totalTrips / totalUsers : 0,
      },
    };
  }

  private async avgTripDuration() {
    const trips = await prisma.trip.findMany({
      select: { startDate: true, endDate: true },
    });
    if (trips.length === 0) return 0;
    const totalDays = trips.reduce((sum, t) => {
      const days = (t.endDate.getTime() - t.startDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.max(days, 1);
    }, 0);
    return Math.round(totalDays / trips.length);
  }

  private async avgTripBudget() {
    const budgets = await prisma.budget.findMany({ select: { totalAmount: true } });
    if (budgets.length === 0) return 0;
    return Math.round(
      budgets.reduce((sum, b) => sum + Number(b.totalAmount), 0) / budgets.length,
    );
  }

  private groupTripsByMonth(trips: { createdAt: Date; _count: number }[]) {
    const months: Record<string, number> = {};
    for (const trip of trips) {
      const key = `${trip.createdAt.getFullYear()}-${String(trip.createdAt.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] ?? 0) + trip._count;
    }
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }
}

export const adminService = new AdminService();
