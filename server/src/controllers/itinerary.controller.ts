import { Request, Response, NextFunction } from 'express';
import { stopService } from '../services/stop.service.js';
import { activityService } from '../services/activity.service.js';
import { success, paginated } from '../utils/helpers.js';

export async function listStops(req: Request, res: Response, next: NextFunction) {
  try {
    const stops = await stopService.list(req.params.tripId as string, req.user!.userId);
    success(res, stops);
  } catch (err) {
    next(err);
  }
}

export async function createStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await stopService.create(req.params.tripId as string, req.user!.userId, req.body);
    success(res, stop, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = await stopService.update(req.params.id as string, req.user!.userId, req.body);
    success(res, stop);
  } catch (err) {
    next(err);
  }
}

export async function deleteStop(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await stopService.delete(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function reorderStops(req: Request, res: Response, next: NextFunction) {
  try {
    const stops = await stopService.reorder(req.params.tripId as string, req.user!.userId, req.body.orderedIds);
    success(res, stops);
  } catch (err) {
    next(err);
  }
}

export async function searchActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityService.search(req.query as never);
    paginated(res, result.activities, result.pagination);
  } catch (err) {
    next(err);
  }
}

export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const activity = await activityService.getById(req.params.id as string);
    success(res, activity);
  } catch (err) {
    next(err);
  }
}

export async function addActivityToStop(req: Request, res: Response, next: NextFunction) {
  try {
    const sa = await activityService.addToStop(req.params.stopId as string, req.user!.userId, req.body);
    success(res, sa, 201);
  } catch (err) {
    next(err);
  }
}

export async function removeStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityService.removeFromStop(req.params.id as string, req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function reorderActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await activityService.reorder(req.params.tripId as string, req.user!.userId, req.body.orderedIds);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function updateStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const sa = await activityService.updateStopActivity(req.params.id as string, req.user!.userId, req.body);
    success(res, sa);
  } catch (err) {
    next(err);
  }
}
