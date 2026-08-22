import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

export const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const currencySchema = z.enum(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AED']);

const tripBaseSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  currency: currencySchema.default('INR'),
  status: z.enum(['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED']).optional(),
});

export const createTripSchema = tripBaseSchema.refine((data) => data.endDate >= data.startDate, {
  message: 'End date cannot precede start date',
  path: ['endDate'],
});

export const updateTripSchema = tripBaseSchema.partial();

export const createStopSchema = z.object({
  cityId: uuidSchema,
  arrivalDate: z.coerce.date().optional(),
  departureDate: z.coerce.date().optional(),
  arrivalTime: z.string().optional(),
  departureTime: z.string().optional(),
  notes: z.string().optional(),
});

export const updateStopSchema = createStopSchema.partial();

export const reorderSchema = z.object({
  orderedIds: z.array(uuidSchema).min(1),
});

export const addActivitySchema = z.object({
  activityId: uuidSchema,
  scheduledTime: z.string().optional(),
  scheduledDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateActivitySchema = addActivitySchema.partial();

export const citySearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  minCostIndex: z.coerce.number().int().min(1).max(5).optional(),
  maxCostIndex: z.coerce.number().int().min(1).max(5).optional(),
  sortBy: z.enum(['popularity', 'name', 'costIndex']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const activitySearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  cityId: uuidSchema.optional(),
  category: z
    .enum([
      'SIGHTSEEING',
      'FOOD',
      'ADVENTURE',
      'CULTURE',
      'SHOPPING',
      'NATURE',
      'NIGHTLIFE',
      'RELAXATION',
    ])
    .optional(),
  minCost: z.coerce.number().optional(),
  maxCost: z.coerce.number().optional(),
  minDuration: z.coerce.number().int().optional(),
  maxDuration: z.coerce.number().int().optional(),
  sortBy: z.enum(['popularity', 'name', 'rating', 'estimatedCost']).default('popularity'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createExpenseSchema = z.object({
  category: z.enum(['TRANSPORT', 'ACCOMMODATION', 'ACTIVITIES', 'MEALS', 'OTHER']),
  amount: z.coerce.number().positive(),
  currency: currencySchema,
  description: z.string().optional(),
  date: z.coerce.date(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const setBudgetSchema = z.object({
  totalAmount: z.coerce.number().positive(),
  currency: currencySchema,
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  language: z.string().optional(),
  currency: currencySchema.optional(),
});

export const saveDestinationSchema = z.object({
  cityId: uuidSchema,
});

export const inviteCollaboratorSchema = z.object({
  email: emailSchema,
  role: z.enum(['EDITOR', 'VIEWER']),
});

export const updateCollaboratorSchema = z.object({
  role: z.enum(['EDITOR', 'VIEWER']),
});

export const tripSearchSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED']).optional(),
  sortBy: z.enum(['startDate', 'name', 'createdAt']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
