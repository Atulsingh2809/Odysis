import { Router } from 'express';
import * as miscCtrl from '../controllers/misc.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { updateProfileSchema, saveDestinationSchema, uuidSchema } from '../schemas/index.js';
import { z } from 'zod';

const router = Router();

router.get('/me', authenticate, miscCtrl.getProfile);
router.put('/me', authenticate, validateBody(updateProfileSchema), miscCtrl.updateProfile);
router.delete('/me', authenticate, miscCtrl.deleteAccount);
router.get('/me/saved-destinations', authenticate, miscCtrl.getSavedDestinations);
router.post('/me/saved-destinations', authenticate, validateBody(saveDestinationSchema), miscCtrl.saveDestination);
router.delete('/me/saved-destinations/:cityId', authenticate, validateParams(z.object({ cityId: uuidSchema })), miscCtrl.removeSavedDestination);

export const dashboardRouter = Router();
dashboardRouter.get('/', authenticate, miscCtrl.getDashboard);

export const recommendationRouter = Router();
recommendationRouter.get('/', authenticate, miscCtrl.getRecommendations);

export const adminRouter = Router();
adminRouter.get('/analytics', authenticate, requireAdmin, miscCtrl.getAnalytics);

export default router;
