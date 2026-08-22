import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Share2,
  ArrowLeft,
  DollarSign,
  Users,
  Clock,
  ListOrdered,
} from 'lucide-react';
import { tripsApi } from '@/api/trips';
import { useAuth } from '@/context/AuthContext';
import type { Trip, BudgetSummary, Expense, Collaborator } from '@/types';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';
import { format } from 'date-fns';

import { ItineraryTab } from '@/features/itinerary/ItineraryTab';
import { BudgetTab } from '@/features/itinerary/BudgetTab';
import { TimelineTab } from '@/features/itinerary/TimelineTab';
import { CollaboratorsTab } from '@/features/itinerary/CollaboratorsTab';

type TabType = 'itinerary' | 'budget' | 'timeline' | 'collaborators';

export function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as TabType) || 'itinerary';

  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTripDetails = useCallback(async () => {
    if (!tripId) return;
    try {
      setLoading(true);
      setError(null);
      const [tripRes, budgetRes, expenseRes, collabRes] = await Promise.all([
        tripsApi.get(tripId),
        tripsApi.budget(tripId).catch(() => null),
        tripsApi.expenses(tripId).catch(() => []),
        tripsApi.collaborators(tripId).catch(() => []),
      ]);

      setTrip(tripRes);
      setBudgetSummary(budgetRes);
      setExpenses(expenseRes);
      setCollaborators(collabRes);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load trip details'));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading itinerary details..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
          <p className="text-red-700 font-semibold">{error || 'Trip not found'}</p>
          <Link to="/trips">
            <Button variant="outline">Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = trip.userId === user?.id;
  const userCollab = collaborators.find((c) => c.userId === user?.id);
  const isEditor = isOwner || userCollab?.role === 'EDITOR';

  const setTab = (t: TabType) => {
    setSearchParams({ tab: t });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link to="/trips" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Trips
        </Link>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        <img
          src={
            trip.coverImageUrl ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
          }
          alt={trip.name}
          className="w-full h-64 sm:h-80 object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-500 text-white shadow">
                {trip.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                Currency: {trip.currency}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{trip.name}</h1>
            {trip.description && <p className="text-sm text-slate-300 line-clamp-2">{trip.description}</p>}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-primary-400" />
                {format(new Date(trip.startDate), 'dd MMM yyyy')} - {format(new Date(trip.endDate), 'dd MMM yyyy')}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-primary-400" />
                {trip.stops?.length || 0} Destination Stop(s)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
                onClick={async () => {
                  const share = await tripsApi.enableShare(trip.id);
                  const shareUrl = `${window.location.origin}/shared/${share.shareToken}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`Share link copied to clipboard:\n${shareUrl}`);
                }}
              >
                <Share2 className="w-4 h-4 mr-1.5" /> Share Link
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('itinerary')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'itinerary'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> Itinerary Builder
        </button>

        <button
          onClick={() => setTab('budget')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'budget'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Budget & Expenses
        </button>

        <button
          onClick={() => setTab('timeline')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Calendar & Timeline
        </button>

        <button
          onClick={() => setTab('collaborators')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'collaborators'
              ? 'border-primary-600 text-primary-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Collaborators ({collaborators.length})
        </button>
      </div>

      {activeTab === 'itinerary' && (
        <ItineraryTab
          tripId={trip.id}
          stops={trip.stops || []}
          canEdit={isEditor}
          onRefresh={fetchTripDetails}
        />
      )}

      {activeTab === 'budget' && (
        <BudgetTab
          tripId={trip.id}
          budgetSummary={budgetSummary}
          expenses={expenses}
          currency={trip.currency}
          canEdit={isEditor}
          onRefresh={fetchTripDetails}
        />
      )}

      {activeTab === 'timeline' && (
        <TimelineTab
          startDate={trip.startDate}
          endDate={trip.endDate}
          stops={trip.stops || []}
        />
      )}

      {activeTab === 'collaborators' && (
        <CollaboratorsTab
          tripId={trip.id}
          collaborators={collaborators}
          isOwner={isOwner}
          onRefresh={fetchTripDetails}
        />
      )}
    </div>
  );
}
