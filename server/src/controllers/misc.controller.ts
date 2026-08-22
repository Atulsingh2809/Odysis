import { Request, Response, NextFunction } from 'express';
import { profileService } from '../services/profile.service.js';
import { dashboardService } from '../services/dashboard.service.js';
import { recommendationService } from '../services/recommendation.service.js';
import { collaboratorService } from '../services/collaborator.service.js';
import { adminService } from '../services/admin.service.js';
import { success } from '../utils/helpers.js';

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(req.user!.userId);
    success(res, profile);
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await profileService.updateProfile(req.user!.userId, req.body);
    success(res, user);
  } catch (err) {
    next(err);
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await profileService.deleteAccount(req.user!.userId);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getSavedDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const saved = await profileService.getSavedDestinations(req.user!.userId);
    success(res, saved);
  } catch (err) {
    next(err);
  }
}

export async function saveDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const saved = await profileService.saveDestination(req.user!.userId, req.body.cityId);
    success(res, saved, 201);
  } catch (err) {
    next(err);
  }
}

export async function removeSavedDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await profileService.removeSavedDestination(req.user!.userId, req.params.cityId as string);
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDashboard(req.user!.userId);
    success(res, data);
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req: Request, res: Response, next: NextFunction) {
  try {
    const recs = await recommendationService.getRecommendations(req.user!.userId);
    success(res, recs);
  } catch (err) {
    next(err);
  }
}

export async function listCollaborators(req: Request, res: Response, next: NextFunction) {
  try {
    const collabs = await collaboratorService.list(req.params.id as string, req.user!.userId);
    success(res, collabs);
  } catch (err) {
    next(err);
  }
}

export async function inviteCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const collab = await collaboratorService.invite(
      req.params.id as string,
      req.user!.userId,
      req.body.email,
      req.body.role,
    );
    success(res, collab, 201);
  } catch (err) {
    next(err);
  }
}

export async function updateCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const collab = await collaboratorService.updateRole(
      req.params.id as string,
      req.user!.userId,
      req.params.userId as string,
      req.body.role,
    );
    success(res, collab);
  } catch (err) {
    next(err);
  }
}

export async function removeCollaborator(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await collaboratorService.remove(
      req.params.id as string,
      req.user!.userId,
      req.params.userId as string,
    );
    success(res, result);
  } catch (err) {
    next(err);
  }
}

export async function getAnalytics(_req: Request, res: Response, next: NextFunction) {
  try {
    const analytics = await adminService.getAnalytics();
    success(res, analytics);
  } catch (err) {
    next(err);
  }
}
