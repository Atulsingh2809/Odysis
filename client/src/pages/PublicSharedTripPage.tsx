import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Copy, Clock } from 'lucide-react';
import { publicApi } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import type { Trip } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';
import { format } from 'date-fns';

export function PublicSharedTripPage() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (!shareToken) return;
    publicApi
      .getShared(shareToken)
      .then(setTrip)
      .catch((err) => setError(getErrorMessage(err, 'Shared trip not found or link has expired')))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleCopyTrip = async () => {
    if (!shareToken) return;
    if (!isAuthenticated) {
      sessionStorage.setItem('gt_copy_token', shareToken);
      navigate('/login?copy=true');
      return;
    }

    try {
      setCopying(true);
      const copiedTrip = await publicApi.copy(shareToken);
      navigate(`/trips/${copiedTrip.id}`);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to copy trip'));
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading shared itinerary..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <Card className="p-8 bg-red-50 border-red-200">
          <h2 className="text-xl font-bold text-red-800">Public Shared Trip Unavailable</h2>
          <p className="text-sm text-red-600 mt-1">{error || 'This link may be invalid or sharing was disabled by the owner.'}</p>
          <Link to="/" className="inline-block mt-4">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalEstimatedCost = trip.stops?.reduce((acc, stop) => {
    return acc + stop.activities.reduce((a, act) => a + Number(act.activity.estimatedCost), 0);
  }, 0) || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-primary-500 font-bold uppercase tracking-wider text-[10px]">
            Public View
          </span>
          <span className="text-slate-300">Read-only shared itinerary</span>
        </div>

        <Button onClick={handleCopyTrip} loading={copying} className="shadow-lg shadow-primary-500/20">
          <Copy className="w-4 h-4 mr-2" /> Copy Trip to My Account
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        <img
          src={
            trip.coverImageUrl ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
          }
          alt={trip.name}
          className="w-full h-64 sm:h-80 object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{trip.name}</h1>
          {trip.description && <p className="text-sm text-slate-300 max-w-2xl line-clamp-2">{trip.description}</p>}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-primary-400" />
              {format(new Date(trip.startDate), 'dd MMM yyyy')} - {format(new Date(trip.endDate), 'dd MMM yyyy')}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-primary-400" />
              {trip.stops?.length || 0} City Destinations
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              Est. Budget: ₹{totalEstimatedCost.toLocaleString()} {trip.currency}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Trip Itinerary & Activities</h2>

        {trip.stops?.length === 0 ? (
          <p className="text-sm text-slate-500">No destination stops defined for this public trip.</p>
        ) : (
          <div className="space-y-6">
            {trip.stops?.map((stop, idx) => (
              <Card key={stop.id} className="overflow-hidden border border-slate-200 bg-white">
                <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{stop.city.name}, {stop.city.country}</h3>
                      {stop.arrivalDate && stop.departureDate && (
                        <p className="text-xs text-slate-300">
                          {format(new Date(stop.arrivalDate), 'dd MMM')} - {format(new Date(stop.departureDate), 'dd MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3 bg-slate-50/50">
                  {stop.activities.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No scheduled activities.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stop.activities.map((sa) => (
                        <div key={sa.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900">{sa.activity.name}</h4>
                            <span className="text-xs font-bold text-emerald-600">₹{sa.activity.estimatedCost}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{sa.activity.description}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sa.activity.durationMinutes} min</span>
                            <span>• {sa.activity.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
