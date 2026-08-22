export type UserRole = 'USER' | 'ADMIN';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED';
export type TripStatus = 'DRAFT' | 'PLANNED' | 'ACTIVE' | 'COMPLETED';
export type ActivityCategory =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'SHOPPING'
  | 'NATURE'
  | 'NIGHTLIFE'
  | 'RELAXATION';
export type ExpenseCategory = 'TRANSPORT' | 'ACCOMMODATION' | 'ACTIVITIES' | 'MEALS' | 'OTHER';
export type CollaboratorRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface Profile {
  avatarUrl: string | null;
  language: string;
  currency: Currency;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  profile: Profile | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  status: TripStatus;
  currency: Currency;
  shareToken: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  stops?: TripStop[];
  budget?: Budget | null;
  _count?: { stops: number };
}

export interface TripCardData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  status: TripStatus;
  currency: Currency;
  destinationCount: number;
  destinations: string[];
  budgetLimit: number | null;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region: string;
  description: string;
  imageUrl: string;
  costIndex: number;
  popularity: number;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  description: string;
  category: ActivityCategory;
  estimatedCost: number;
  currency: Currency;
  durationMinutes: number;
  imageUrl: string;
  rating: number;
  popularity: number;
  city?: City;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  orderIndex: number;
  arrivalDate: string | null;
  departureDate: string | null;
  arrivalTime: string | null;
  departureTime: string | null;
  notes: string | null;
  city: City;
  activities: StopActivity[];
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  orderIndex: number;
  scheduledTime: string | null;
  scheduledDate: string | null;
  notes: string | null;
  activity: Activity;
}

export interface Budget {
  id: string;
  tripId: string;
  totalAmount: number;
  currency: Currency;
}

export interface Expense {
  id: string;
  tripId: string;
  category: ExpenseCategory;
  amount: number;
  currency: Currency;
  description: string | null;
  date: string;
}

export interface BudgetSummary {
  currency: Currency;
  totalEstimated: number;
  budgetLimit: number | null;
  remaining: number | null;
  overBudget: boolean;
  overBudgetAmount: number;
  byCategory: { category: string; amount: number }[];
  byCity: { city: string; amount: number }[];
  dailySpending: { date: string; amount: number; overBudget: boolean }[];
  averages: { perDay: number; perCity: number; perActivity: number };
  alerts: { type: string; message: string }[];
}

export interface DashboardData {
  welcomeName: string;
  upcomingTrips: TripCardData[];
  recentTrips: TripCardData[];
  budgetOverview: {
    totalBudget: number;
    totalEstimated: number;
    tripCount: number;
  };
  quickActions: { label: string; path: string }[];
}

export interface Recommendation {
  city: City;
  score: number;
  reason: string;
}

export interface Collaborator {
  id: string;
  tripId: string;
  userId: string;
  role: CollaboratorRole;
  user: { id: string; name: string; email: string };
}

export interface SavedDestination {
  id: string;
  cityId: string;
  createdAt: string;
  city: City;
}

export interface ShareResult {
  shareToken: string;
  shareUrl: string;
}

export interface AdminAnalytics {
  totalUsers: number;
  totalTrips: number;
  tripsByMonth: { month: string; count: number }[];
  popularCities: { city: { id: string; name: string; country: string }; count: number }[];
  popularActivities: { activity: { id: string; name: string; category: string }; count: number }[];
  averageTripDurationDays: number;
  averageTripBudget: number;
  engagement: { avgTripsPerUser: number };
}

export interface TripSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TripStatus;
  sortBy?: 'startDate' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CitySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  region?: string;
  minCostIndex?: number;
  maxCostIndex?: number;
  sortBy?: 'popularity' | 'name' | 'costIndex';
  sortOrder?: 'asc' | 'desc';
}

export interface ActivitySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  cityId?: string;
  category?: ActivityCategory;
  minCost?: number;
  maxCost?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: 'popularity' | 'name' | 'rating' | 'estimatedCost';
  sortOrder?: 'asc' | 'desc';
}
