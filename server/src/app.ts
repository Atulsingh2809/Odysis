import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import tripRoutes, {
  stopRouter,
  activityRouter,
  stopActivityRouter,
  stopActivityItemRouter,
  expenseRouter,
  sharedRouter,
} from './routes/trip.routes.js';
import cityRoutes from './routes/city.routes.js';
import userRoutes, { dashboardRouter, recommendationRouter, adminRouter } from './routes/user.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GlobeTrotter API',
      version: '1.0.0',
      description: 'Personalized Travel Planning Platform API',
    },
    servers: [{ url: `/api` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
});

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));

  // Middleware to normalize req.url for Vercel serverless rewritten paths
  app.use((req, _res, next) => {
    if (req.url.startsWith('/api/')) {
      // Keep as is
    } else if (req.url.startsWith('/')) {
      // Enable matching both /auth/login and /api/auth/login
    }
    next();
  });

  app.get(['/api/health', '/health'], (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(['/api/docs', '/docs'], swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Mount API routes with dual prefixes for standard Express & Vercel Serverless Function rewrites
  app.use(['/api/auth', '/auth'], authRoutes);
  app.use(['/api/trips', '/trips'], tripRoutes);
  app.use(['/api/stops', '/stops'], stopRouter);
  app.use(['/api/activities', '/activities'], activityRouter);
  app.use('/api/stops', stopActivityRouter);
  app.use(['/api/stop-activities', '/stop-activities'], stopActivityItemRouter);
  app.use(['/api/expenses', '/expenses'], expenseRouter);
  app.use(['/api/shared', '/shared'], sharedRouter);
  app.use(['/api/cities', '/cities'], cityRoutes);
  app.use(['/api/users', '/users'], userRoutes);
  app.use(['/api/dashboard', '/dashboard'], dashboardRouter);
  app.use(['/api/recommendations', '/recommendations'], recommendationRouter);
  app.use(['/api/admin', '/admin'], adminRouter);

  // Serve compiled React SPA frontend
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
