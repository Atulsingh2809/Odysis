import { Router } from 'express';
import * as tripCtrl from '../controllers/trip.controller.js';
import * as itineraryCtrl from '../controllers/itinerary.controller.js';
import * as budgetCtrl from '../controllers/budget.controller.js';
import * as miscCtrl from '../controllers/misc.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import {
  createTripSchema,
  updateTripSchema,
  createStopSchema,
  updateStopSchema,
  reorderSchema,
  addActivitySchema,
  updateActivitySchema,
  tripSearchSchema,
  setBudgetSchema,
  createExpenseSchema,
  updateExpenseSchema,
  inviteCollaboratorSchema,
  updateCollaboratorSchema,
  uuidSchema,
  activitySearchSchema,
} from '../schemas/index.js';
import { z } from 'zod';

const router = Router();

router.get('/', authenticate, validateQuery(tripSearchSchema), tripCtrl.listTrips);
router.post('/', authenticate, validateBody(createTripSchema), tripCtrl.createTrip);
router.get('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), tripCtrl.getTrip);
router.put('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(updateTripSchema), tripCtrl.updateTrip);
router.delete('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), tripCtrl.deleteTrip);
router.post('/:id/duplicate', authenticate, validateParams(z.object({ id: uuidSchema })), tripCtrl.duplicateTrip);
router.post('/:id/share', authenticate, validateParams(z.object({ id: uuidSchema })), tripCtrl.enableShare);
router.delete('/:id/share', authenticate, validateParams(z.object({ id: uuidSchema })), tripCtrl.disableShare);

router.get('/:tripId/stops', authenticate, validateParams(z.object({ tripId: uuidSchema })), itineraryCtrl.listStops);
router.post('/:tripId/stops', authenticate, validateParams(z.object({ tripId: uuidSchema })), validateBody(createStopSchema), itineraryCtrl.createStop);
router.put('/:tripId/stops/reorder', authenticate, validateParams(z.object({ tripId: uuidSchema })), validateBody(reorderSchema), itineraryCtrl.reorderStops);
router.put('/:tripId/activities/reorder', authenticate, validateParams(z.object({ tripId: uuidSchema })), validateBody(reorderSchema), itineraryCtrl.reorderActivities);

router.get('/:id/budget', authenticate, validateParams(z.object({ id: uuidSchema })), budgetCtrl.getBudget);
router.put('/:id/budget', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(setBudgetSchema), budgetCtrl.setBudget);
router.get('/:id/expenses', authenticate, validateParams(z.object({ id: uuidSchema })), budgetCtrl.listExpenses);
router.post('/:id/expenses', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(createExpenseSchema), budgetCtrl.createExpense);

router.get('/:id/collaborators', authenticate, validateParams(z.object({ id: uuidSchema })), miscCtrl.listCollaborators);
router.post('/:id/collaborators', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(inviteCollaboratorSchema), miscCtrl.inviteCollaborator);
router.put('/:id/collaborators/:userId', authenticate, validateParams(z.object({ id: uuidSchema, userId: uuidSchema })), validateBody(updateCollaboratorSchema), miscCtrl.updateCollaborator);
router.delete('/:id/collaborators/:userId', authenticate, validateParams(z.object({ id: uuidSchema, userId: uuidSchema })), miscCtrl.removeCollaborator);

export default router;

export const stopRouter = Router();
stopRouter.put('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(updateStopSchema), itineraryCtrl.updateStop);
stopRouter.delete('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), itineraryCtrl.deleteStop);

export const activityRouter = Router();
activityRouter.get('/', authenticate, validateQuery(activitySearchSchema), itineraryCtrl.searchActivities);
activityRouter.get('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), itineraryCtrl.getActivity);

export const stopActivityRouter = Router();
stopActivityRouter.post('/:stopId/activities', authenticate, validateParams(z.object({ stopId: uuidSchema })), validateBody(addActivitySchema), itineraryCtrl.addActivityToStop);

export const stopActivityItemRouter = Router();
stopActivityItemRouter.delete('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), itineraryCtrl.removeStopActivity);
stopActivityItemRouter.put('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(updateActivitySchema), itineraryCtrl.updateStopActivity);

export const expenseRouter = Router();
expenseRouter.put('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), validateBody(updateExpenseSchema), budgetCtrl.updateExpense);
expenseRouter.delete('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), budgetCtrl.deleteExpense);

export const sharedRouter = Router();
sharedRouter.get('/:token', tripCtrl.getShared);
sharedRouter.post('/:token/copy', authenticate, tripCtrl.copyShared);
