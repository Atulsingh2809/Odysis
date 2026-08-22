import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Compass,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { usersApi } from '@/api/users';
import { useAuth } from '@/context/AuthContext';
import type { DashboardData, Recommendation } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';
import { format } from 'date-fns';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [dashRes, recRes] = await Promise.all([
          usersApi.dashboard(),
          usersApi.recommendations(),
        ]);
        if (mounted) {
          setData(dashRes);
          setRecommendations(recRes);
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err, 'Failed to load dashboard data'));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your travel dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-4">
          <p className="text-red-700 font-semibold">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const upcoming = data?.upcomingTrips ?? [];
  const budget = data?.budgetOverview;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
              Ready for your next adventure?
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {data?.welcomeName || user?.name}!
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Organize your multi-city journeys, discover activities, manage travel budgets, and share itineraries seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link to="/trips/new">
              <Button size="lg" className="shadow-lg shadow-primary-600/30">
                <Plus className="w-5 h-5 mr-2" />
                Plan New Trip
              </Button>
            </Link>
            <Link to="/explore/cities">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                <Compass className="w-5 h-5 mr-2" />
                Explore Cities
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-white to-primary-50/30 border-primary-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Planned Budget</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{(budget?.totalBudget || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Across {budget?.tripCount || 0} active trip(s)
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-sky-50/30 border-sky-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Journeys</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{upcoming.length}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Scheduled & upcoming adventures</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-purple-50/30 border-purple-100/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Costs</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{(budget?.totalEstimated || 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Auto-calculated from itinerary activities</p>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Trips</h2>
            <p className="text-xs text-slate-500">Your scheduled upcoming travel plans</p>
          </div>
          <Link to="/trips" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View All Trips <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <Card className="p-8 text-center space-y-4 bg-slate-50/50 border-dashed border-2">
            <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 mx-auto flex items-center justify-center">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-slate-900">No upcoming trips</h3>
              <p className="text-xs text-slate-500">Start planning your next adventure by adding stops and activities.</p>
            </div>
            <Link to="/trips/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> Plan New Trip
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden hover:shadow-lg transition-all group border border-slate-200 cursor-pointer"
                onClick={() => navigate(`/trips/${trip.id}`)}
              >
                <div className="h-44 relative bg-slate-900 overflow-hidden">
                  <img
                    src={trip.coverImageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                    {trip.status}
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="font-bold text-lg leading-snug line-clamp-1 group-hover:text-primary-300 transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-400" />
                      {format(new Date(trip.startDate), 'dd MMM yyyy')} - {format(new Date(trip.endDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-4 h-4 text-primary-600" />
                      {trip.destinationCount} Destination(s)
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{(trip.budgetLimit || 0).toLocaleString()}
                    </span>
                  </div>

                  {trip.destinations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {trip.destinations.slice(0, 3).map((dest, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-700">
                          {dest}
                        </span>
                      ))}
                      {trip.destinations.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-500">
                          +{trip.destinations.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recommended Destinations</h2>
            <p className="text-xs text-slate-500">Popular travel spots tailored for your next journey</p>
          </div>
          <Link to="/explore/cities" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.slice(0, 4).map((rec) => (
            <Card key={rec.city.id} className="overflow-hidden hover:shadow-lg transition-all border border-slate-200 group">
              <div className="h-40 relative bg-slate-900 overflow-hidden">
                <img
                  src={rec.city.imageUrl}
                  alt={rec.city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-600 text-white shadow">
                  {rec.reason}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-base">{rec.city.name}</h3>
                  <p className="text-xs text-slate-300">{rec.city.country}</p>
                </div>
              </div>

              <div className="p-3 bg-white space-y-2">
                <p className="text-xs text-slate-600 line-clamp-2">{rec.city.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Cost Index: {'$'.repeat(rec.city.costIndex)}</span>
                  <Link to={`/explore/cities?search=${encodeURIComponent(rec.city.name)}`}>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary-600 px-2">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
