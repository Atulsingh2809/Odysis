import { Request, Response, NextFunction } from 'express';
import { tripService } from '../services/trip.service.js';
import { success, paginated } from '../utils/helpers.js';

export async function listTrips(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.list(req.user!.userId, req.query as never);
    paginated(res, result.trips, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getById(req.params.id as string, req.user!.userId);
    success(res, trip);
  } catch (err) {
    next(err);
  }
}

export async function createTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.create(req.user!.userId, req.body);
    success(res, trip, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.update(req.params.id as string, req.user!.userId, req.body);
    success(res, trip);
  } catch (err) {
    next(err);
  }
}

export async function deleteTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.delete(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function duplicateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.duplicate(req.params.id as string, req.user!.userId);
    success(res, trip, 201);
  } catch (err) {
    next(err);
  }
}

export async function enableShare(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.enableShare(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function disableShare(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tripService.disableShare(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getShared(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.getPublic(req.params.token as string);
    success(res, trip);
  } catch (err) {
    next(err);
  }
}

export async function copyShared(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = await tripService.copyFromShare(req.params.token as string, req.user!.userId);
    success(res, trip, 201);
  } catch (err) {
    next(err);
  }
}
