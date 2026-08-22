import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/api/auth';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/api/client';
import { publicApi } from '@/api/trips';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: { name: string; email: string; password: string; confirmPassword: string }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const finishAuth = useCallback(async (nextUser: User) => {
    setUser(nextUser);
    const pending = sessionStorage.getItem('gt_copy_token');
    if (pending) {
      sessionStorage.removeItem('gt_copy_token');
      try {
        const copied = await publicApi.copy(pending);
        window.location.href = `/trips/${copied.id}`;
      } catch {
        // ignore copy failure after login
      }
    }
    return nextUser;
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setTokens(result.accessToken, result.refreshToken);
    return finishAuth(result.user);
  }, [finishAuth]);

  const signup = useCallback(async (payload: { name: string; email: string; password: string; confirmPassword: string }) => {
    const result = await authApi.signup(payload);
    setTokens(result.accessToken, result.refreshToken);
    return finishAuth(result.user);
  }, [finishAuth]);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // still clear locally
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const next = await authApi.me();
    setUser(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, loading, login, signup, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
