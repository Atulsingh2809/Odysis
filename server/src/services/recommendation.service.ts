import prisma from '../config/database.js';

/**
 * Deterministic recommendation engine.
 * Scores cities based on popularity, cost fit, saved destinations, and visit history.
 * Modular design allows swapping in ML model later.
 */
export class RecommendationService {
  async getRecommendations(userId: string, limit = 6) {
    const [saved, visitedCityIds, allCities, userProfile] = await Promise.all([
      prisma.savedDestination.findMany({
        where: { userId },
        include: { city: true },
      }),
      this.getVisitedCityIds(userId),
      prisma.city.findMany(),
      prisma.profile.findUnique({ where: { userId } }),
    ]);

    const savedIds = new Set(saved.map((s) => s.cityId));
    const savedCountries = new Set(saved.map((s) => s.city.country));
    const visitedIds = new Set(visitedCityIds);
    const preferredCost = userProfile ? this.costFromCurrency(userProfile.currency) : 3;

    const scored = allCities
      .filter((city) => !visitedIds.has(city.id))
      .map((city) => {
        let score = city.popularity;
        const reasons: string[] = [];

        if (savedIds.has(city.id)) {
          score += 30;
          reasons.push('Matches a saved destination');
        }
        if (savedCountries.has(city.country)) {
          score += 15;
          reasons.push(`Near your interest in ${city.country}`);
        }

        const costDiff = Math.abs(city.costIndex - preferredCost);
        score += (5 - costDiff) * 5;
        if (city.popularity >= 90) reasons.push('Highly popular with travelers');
        if (reasons.length === 0) reasons.push(`Top pick in ${city.region}`);

        return { city, score, reason: reasons[0] };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  private async getVisitedCityIds(userId: string): Promise<string[]> {
    const stops = await prisma.tripStop.findMany({
      where: { trip: { userId } },
      select: { cityId: true },
      distinct: ['cityId'],
    });
    return stops.map((s) => s.cityId);
  }

  private costFromCurrency(currency: string): number {
    const map: Record<string, number> = {
      INR: 2,
      USD: 3,
      EUR: 4,
      GBP: 4,
      JPY: 3,
      AED: 4,
    };
    return map[currency] ?? 3;
  }
}

export const recommendationService = new RecommendationService();
