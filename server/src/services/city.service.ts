import { Prisma } from '@prisma/client';
import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

export class CityService {
  async search(params: {
    page: number; limit: number; search?: string; country?: string; region?: string;
    minCostIndex?: number; maxCostIndex?: number;
    sortBy: string; sortOrder: 'asc' | 'desc';
  }) {
    const where: Prisma.CityWhereInput = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { country: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.country && { country: { equals: params.country, mode: 'insensitive' } }),
      ...(params.region && { region: { equals: params.region, mode: 'insensitive' } }),
      ...(params.minCostIndex !== undefined || params.maxCostIndex !== undefined
        ? {
            costIndex: {
              ...(params.minCostIndex !== undefined && { gte: params.minCostIndex }),
              ...(params.maxCostIndex !== undefined && { lte: params.maxCostIndex }),
            },
          }
        : {}),
    };

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        orderBy: { [params.sortBy]: params.sortOrder },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.city.count({ where }),
    ]);

    return { cities, pagination: { page: params.page, limit: params.limit, total } };
  }

  async getById(id: string) {
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: { take: 10, orderBy: { popularity: 'desc' } },
      },
    });
    if (!city) throw new NotFoundError('City not found', 'CITY_NOT_FOUND');
    return city;
  }

  async getCountries() {
    const results = await prisma.city.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });
    return results.map((r) => r.country);
  }

  async getRegions() {
    const results = await prisma.city.findMany({
      select: { region: true },
      distinct: ['region'],
      orderBy: { region: 'asc' },
    });
    return results.map((r) => r.region);
  }
}

export const cityService = new CityService();
