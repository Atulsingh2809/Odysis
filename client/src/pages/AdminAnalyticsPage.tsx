import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { usersApi } from '@/api/users';
import type { AdminAnalytics } from '@/types';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';

export function AdminAnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi
      .analytics()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err, 'Failed to fetch admin analytics')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading platform analytics..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 bg-red-50 border-red-200">
          <p className="text-red-700 font-semibold">{error || 'Access denied'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Analytics</h1>
          <p className="text-slate-500 text-sm">Platform statistics, user engagement, and travel trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{data.totalUsers}</p>
        </Card>

        <Card className="p-6 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Trips Created</p>
          <p className="text-3xl font-extrabold text-primary-600 mt-1">{data.totalTrips}</p>
        </Card>

        <Card className="p-6 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Trip Duration</p>
          <p className="text-3xl font-extrabold text-sky-600 mt-1">{data.averageTripDurationDays} Days</p>
        </Card>

        <Card className="p-6 bg-white border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Trip Budget</p>
          <p className="text-3xl font-extrabold text-purple-600 mt-1">₹{data.averageTripBudget.toLocaleString()}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Most Popular Cities</h3>
          <div className="divide-y divide-slate-100">
            {data.popularCities.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.city.name}</p>
                  <p className="text-xs text-slate-500">{item.city.country}</p>
                </div>
                <span className="px-2.5 py-1 bg-primary-50 text-primary-700 font-bold rounded-lg text-xs">
                  {item.count} stops
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-900">Most Popular Activities</h3>
          <div className="divide-y divide-slate-100">
            {data.popularActivities.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-slate-900">{item.activity.name}</p>
                  <p className="text-xs text-slate-500">{item.activity.category}</p>
                </div>
                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-lg text-xs">
                  {item.count} times scheduled
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
