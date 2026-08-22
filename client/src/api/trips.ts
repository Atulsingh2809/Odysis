import type {
  ActivitySearchParams,
  Budget,
  BudgetSummary,
  CitySearchParams,
  Collaborator,
  CollaboratorRole,
  Currency,
  Expense,
  ExpenseCategory,
  PaginatedResponse,
  ShareResult,
  Trip,
  TripCardData,
  TripSearchParams,
  TripStop,
  StopActivity,
} from '@/types';
import { api, unwrap } from './client';

export const tripsApi = {
  list: async (params: TripSearchParams) => {
    const res = await api.get('/trips', { params });
    return res.data as PaginatedResponse<TripCardData>;
  },
  get: (id: string) => unwrap<Trip>(api.get(`/trips/${id}`)),
  create: (payload: {
    name: string;
    startDate: string;
    endDate: string;
    description?: string;
    coverImageUrl?: string;
    currency: Currency;
  }) => unwrap<Trip>(api.post('/trips', payload)),
  update: (id: string, payload: Record<string, unknown>) => unwrap<Trip>(api.put(`/trips/${id}`, payload)),
  remove: (id: string) => unwrap(api.delete(`/trips/${id}`)),
  duplicate: (id: string) => unwrap<Trip>(api.post(`/trips/${id}/duplicate`)),
  enableShare: (id: string) => unwrap<ShareResult>(api.post(`/trips/${id}/share`)),
  disableShare: (id: string) => unwrap(api.delete(`/trips/${id}/share`)),
  listStops: (tripId: string) => unwrap<TripStop[]>(api.get(`/trips/${tripId}/stops`)),
  addStop: (tripId: string, payload: Record<string, unknown>) =>
    unwrap<TripStop>(api.post(`/trips/${tripId}/stops`, payload)),
  updateStop: (id: string, payload: Record<string, unknown>) =>
    unwrap<TripStop>(api.put(`/stops/${id}`, payload)),
  deleteStop: (id: string) => unwrap(api.delete(`/stops/${id}`)),
  reorderStops: (tripId: string, orderedIds: string[]) =>
    unwrap<TripStop[]>(api.put(`/trips/${tripId}/stops/reorder`, { orderedIds })),
  reorderActivities: (tripId: string, orderedIds: string[]) =>
    unwrap(api.put(`/trips/${tripId}/activities/reorder`, { orderedIds })),
  addActivity: (stopId: string, payload: Record<string, unknown>) =>
    unwrap<StopActivity>(api.post(`/stops/${stopId}/activities`, payload)),
  removeActivity: (id: string) => unwrap(api.delete(`/stop-activities/${id}`)),
  updateStopActivity: (id: string, payload: Record<string, unknown>) =>
    unwrap<StopActivity>(api.put(`/stop-activities/${id}`, payload)),
  budget: (id: string) => unwrap<BudgetSummary>(api.get(`/trips/${id}/budget`)),
  setBudget: (id: string, payload: { totalAmount: number; currency: Currency }) =>
    unwrap<Budget>(api.put(`/trips/${id}/budget`, payload)),
  expenses: (id: string) => unwrap<Expense[]>(api.get(`/trips/${id}/expenses`)),
  addExpense: (id: string, payload: {
    category: ExpenseCategory;
    amount: number;
    currency: Currency;
    description?: string;
    date: string;
  }) => unwrap<Expense>(api.post(`/trips/${id}/expenses`, payload)),
  updateExpense: (id: string, payload: Record<string, unknown>) =>
    unwrap<Expense>(api.put(`/expenses/${id}`, payload)),
  deleteExpense: (id: string) => unwrap(api.delete(`/expenses/${id}`)),
  collaborators: (id: string) => unwrap<Collaborator[]>(api.get(`/trips/${id}/collaborators`)),
  invite: (id: string, payload: { email: string; role: Exclude<CollaboratorRole, 'OWNER'> }) =>
    unwrap<Collaborator>(api.post(`/trips/${id}/collaborators`, payload)),
  updateCollaborator: (id: string, userId: string, role: Exclude<CollaboratorRole, 'OWNER'>) =>
    unwrap<Collaborator>(api.put(`/trips/${id}/collaborators/${userId}`, { role })),
  removeCollaborator: (id: string, userId: string) =>
    unwrap(api.delete(`/trips/${id}/collaborators/${userId}`)),
};

export const citiesApi = {
  search: async (params: CitySearchParams) => {
    const res = await api.get('/cities', { params });
    return res.data as PaginatedResponse<import('@/types').City>;
  },
  get: (id: string) => unwrap(api.get(`/cities/${id}`)),
  countries: () => unwrap<string[]>(api.get('/cities/meta/countries')),
  regions: () => unwrap<string[]>(api.get('/cities/meta/regions')),
};

export const activitiesApi = {
  search: async (params: ActivitySearchParams) => {
    const res = await api.get('/activities', { params });
    return res.data as PaginatedResponse<import('@/types').Activity>;
  },
  get: (id: string) => unwrap(api.get(`/activities/${id}`)),
};

export const publicApi = {
  getShared: (token: string) => unwrap<Trip>(api.get(`/shared/${token}`)),
  copy: (token: string) => unwrap<Trip>(api.post(`/shared/${token}/copy`)),
};
