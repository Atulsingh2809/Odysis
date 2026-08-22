import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Share2,
  Copy,
  Trash2,
  Edit,
  Eye,
  SlidersHorizontal,
  Compass,
  Check,
} from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { TripCardData, TripStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';
import { format } from 'date-fns';

export function TripsListPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | ''>('');
  const [sortBy, setSortBy] = useState<'startDate' | 'name' | 'createdAt'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Action Modals
  const [deleteTripId, setDeleteTripId] = useState<string | null>(null);
  const [deleteTripName, setDeleteTripName] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tripsApi.list({
        page,
        limit: 9,
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
      setTrips(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch trips'));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleDelete = async () => {
    if (!deleteTripId) return;
    try {
      setDeleting(true);
      await tripsApi.remove(deleteTripId);
      setDeleteTripId(null);
      fetchTrips();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete trip'));
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const dup = await tripsApi.duplicate(id);
      navigate(`/trips/${dup.id}`);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to duplicate trip'));
    }
  };

  const handleOpenShare = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setShareLoading(true);
      setShareModalOpen(true);
      const res = await tripsApi.enableShare(id);
      const fullUrl = `${window.location.origin}/shared/${res.shareToken}`;
      setShareUrl(fullUrl);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to generate share link'));
      setShareModalOpen(false);
    } finally {
      setShareLoading(false);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
          <p className="text-slate-500 text-sm">Manage, edit, and organize all your travel itineraries</p>
        </div>
        <Link to="/trips/new">
          <Button size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" /> Plan New Trip
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 bg-white space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search by trip name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as TripStatus | '');
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'startDate' | 'name' | 'createdAt')}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="startDate">Sort by Start Date</option>
                <option value="name">Sort by Name</option>
                <option value="createdAt">Sort by Date Created</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-semibold text-xs"
              >
                {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading trips..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
          <p className="text-red-700 font-semibold">{error}</p>
          <Button size="sm" onClick={fetchTrips}>
            Retry
          </Button>
        </div>
      ) : trips.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-slate-50/50 border-dashed border-2">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 mx-auto flex items-center justify-center">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-lg text-slate-900">No trips found</h3>
            <p className="text-xs text-slate-500">
              {search || statusFilter
                ? 'Try clearing search filters to see all your travel plans.'
                : 'Start your journey by creating your first travel itinerary!'}
            </p>
          </div>
          <Link to="/trips/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Plan New Trip
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <Card
                key={trip.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-48 relative bg-slate-900 overflow-hidden cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                    <img
                      src={
                        trip.coverImageUrl ||
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-md">
                      {trip.status}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-bold text-xl leading-snug line-clamp-1 group-hover:text-primary-300 transition-colors">
                        {trip.name}
                      </h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-400" />
                        {format(new Date(trip.startDate), 'dd MMM yyyy')} - {format(new Date(trip.endDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        {trip.destinationCount} Destination(s)
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{(trip.budgetLimit || 0).toLocaleString()}
                      </span>
                    </div>

                    {trip.destinations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {trip.destinations.map((dest, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
                            {dest}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${trip.id}`)} className="text-xs font-semibold text-primary-700">
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenShare(trip.id, e)}
                      title="Share Itinerary"
                      className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleDuplicate(trip.id, e)}
                      title="Duplicate Trip"
                      className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => navigate(`/trips/${trip.id}?tab=edit`)}
                      title="Edit Trip Details"
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setDeleteTripId(trip.id);
                        setDeleteTripName(trip.name);
                      }}
                      title="Delete Trip"
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm font-semibold text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTripId)}
        title={`Delete "${deleteTripName}"?`}
        message="This action will permanently delete this trip, all its stops, activities, expense records, and public sharing links. This action cannot be undone."
        confirmText="Delete Trip"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTripId(null)}
      />

      {/* Share Modal */}
      <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Itinerary">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Anyone with this link will be able to view your read-only itinerary and copy it to their own account.
          </p>

          {shareLoading ? (
            <LoadingSpinner text="Generating share link..." />
          ) : (
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-xs" />
              <Button onClick={copyShareLink} size="sm" className="shrink-0">
                {copied ? <Check className="w-4 h-4 mr-1 text-emerald-300" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
