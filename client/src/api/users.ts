import type {
  AdminAnalytics,
  DashboardData,
  Recommendation,
  SavedDestination,
  User,
} from '@/types';
import { api, unwrap } from './client';

export const usersApi = {
  dashboard: () => unwrap<DashboardData>(api.get('/dashboard')),
  recommendations: () => unwrap<Recommendation[]>(api.get('/recommendations')),
  me: () => unwrap<User>(api.get('/users/me')),
  update: (payload: Record<string, unknown>) => unwrap<User>(api.put('/users/me', payload)),
  deleteAccount: () => unwrap(api.delete('/users/me')),
  saved: () => unwrap<SavedDestination[]>(api.get('/users/me/saved-destinations')),
  saveCity: (cityId: string) => unwrap<SavedDestination>(api.post('/users/me/saved-destinations', { cityId })),
  unsaveCity: (cityId: string) => unwrap(api.delete(`/users/me/saved-destinations/${cityId}`)),
  analytics: () => unwrap<AdminAnalytics>(api.get('/admin/analytics')),
};
