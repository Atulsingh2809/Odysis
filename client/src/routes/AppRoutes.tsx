import { Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TripsListPage } from '@/pages/TripsListPage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { CityDiscoveryPage } from '@/pages/CityDiscoveryPage';
import { ActivityDiscoveryPage } from '@/pages/ActivityDiscoveryPage';
import { PublicSharedTripPage } from '@/pages/PublicSharedTripPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminAnalyticsPage } from '@/pages/AdminAnalyticsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Public Shared Itinerary Route */}
        <Route path="/shared/:shareToken" element={<PublicSharedTripPage />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <TripsListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/new"
          element={
            <ProtectedRoute>
              <CreateTripPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute>
              <TripDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore/cities"
          element={
            <ProtectedRoute>
              <CityDiscoveryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/explore/activities"
          element={
            <ProtectedRoute>
              <ActivityDiscoveryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Only Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />

        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
