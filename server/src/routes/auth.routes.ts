import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authCtrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../schemas/index.js';
import { config } from '../config/index.js';

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke a refresh token
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Issue a new access token
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password with a token
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Current authenticated user
 *     security:
 *       - bearerAuth: []
 */
const router = Router();

const authLimiter = rateLimit({
  windowMs: config.authRateLimit.windowMs,
  max: config.authRateLimit.max,
  message: { success: false, message: 'Too many attempts', code: 'RATE_LIMIT' },
});

router.post('/signup', authLimiter, validateBody(signupSchema), authCtrl.signup);
router.post('/login', authLimiter, validateBody(loginSchema), authCtrl.login);
router.post('/logout', validateBody(refreshTokenSchema), authCtrl.logout);
router.post('/refresh', validateBody(refreshTokenSchema), authCtrl.refresh);
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), authCtrl.forgotPassword);
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), authCtrl.resetPassword);
router.get('/me', authenticate, authCtrl.me);

export default router;
