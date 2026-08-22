import { Request, Response, NextFunction } from 'express';
import { cityService } from '../services/city.service.js';
import { success, paginated } from '../utils/helpers.js';

export async function searchCities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await cityService.search(req.query as never);
    paginated(res, result.cities, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await cityService.getById(req.params.id as string);
    success(res, city);
  } catch (err) {
    next(err);
  }
}

export async function getCountries(_req: Request, res: Response, next: NextFunction) {
  try {
    const countries = await cityService.getCountries();
    success(res, countries);
  } catch (err) {
    next(err);
  }
}

export async function getRegions(_req: Request, res: Response, next: NextFunction) {
  try {
    const regions = await cityService.getRegions();
    success(res, regions);
  } catch (err) {
    next(err);
  }
}
