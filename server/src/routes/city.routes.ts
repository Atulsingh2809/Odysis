import { Router } from 'express';
import * as cityCtrl from '../controllers/city.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateParams, validateQuery } from '../middleware/validate.js';
import { citySearchSchema, uuidSchema } from '../schemas/index.js';
import { z } from 'zod';

const router = Router();

router.get('/', authenticate, validateQuery(citySearchSchema), cityCtrl.searchCities);
router.get('/meta/countries', authenticate, cityCtrl.getCountries);
router.get('/meta/regions', authenticate, cityCtrl.getRegions);
router.get('/:id', authenticate, validateParams(z.object({ id: uuidSchema })), cityCtrl.getCity);

export default router;
