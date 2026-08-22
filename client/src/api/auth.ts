import type { AuthResponse, User } from '@/types';
import { api, unwrap } from './client';

export const authApi = {
  signup: (payload: { name: string; email: string; password: string; confirmPassword: string }) =>
    unwrap<AuthResponse>(api.post('/auth/signup', payload)),
  login: (payload: { email: string; password: string }) =>
    unwrap<AuthResponse>(api.post('/auth/login', payload)),
  logout: (refreshToken: string) => unwrap(api.post('/auth/logout', { refreshToken })),
  me: () => unwrap<User>(api.get('/auth/me')),
  forgotPassword: (email: string) =>
    unwrap<{ message: string; devToken?: string }>(api.post('/auth/forgot-password', { email })),
  resetPassword: (payload: { token: string; password: string; confirmPassword: string }) =>
    unwrap(api.post('/auth/reset-password', payload)),
};
