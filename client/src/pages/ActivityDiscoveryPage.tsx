import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Clock, Star, MapPin, Compass } from 'lucide-react';
import { activitiesApi } from '@/api/trips';
import type { Activity, ActivityCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';

export function ActivityDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const category = (searchParams.get('category') as ActivityCategory | '') || '';
  const sortBy = (searchParams.get('sortBy') as 'popularity' | 'name' | 'rating' | 'estimatedCost') || 'popularity';
  const page = Number(searchParams.get('page')) || 1;
  const [totalPages, setTotalPages] = useState(1);

  const categories: ActivityCategory[] = [
    'SIGHTSEEING',
    'FOOD',
    'ADVENTURE',
    'CULTURE',
    'SHOPPING',
    'NATURE',
    'NIGHTLIFE',
    'RELAXATION',
  ];

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await activitiesApi.search({
        page,
        limit: 12,
        search: search || undefined,
        category: category || undefined,
        sortBy,
        sortOrder: sortBy === 'estimatedCost' ? 'asc' : 'desc',
      });
      setActivities(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch activities'));
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sortBy]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const updateParam = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Activity Explorer</h1>
        <p className="text-slate-500 text-sm">Discover sightseeing tours, local food experiences, outdoor adventures, and cultural events</p>
      </div>

      <Card className="p-4 bg-white space-y-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search activity by name..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="estimatedCost">Price (Low to High)</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Searching activities..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-slate-50/50 border-dashed border-2">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No activities match your search</h3>
          <p className="text-xs text-slate-500">Try selecting a different category or search term.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((act) => (
              <Card
                key={act.id}
                className="overflow-hidden hover:shadow-xl transition-all border border-slate-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 relative bg-slate-900 overflow-hidden">
                    <img
                      src={act.imageUrl}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-600 text-white shadow">
                      {act.category}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="font-bold text-lg leading-snug line-clamp-1">{act.name}</h3>
                      {act.city && (
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-400" /> {act.city.name}, {act.city.country}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{act.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                      <span className="flex items-center gap-1 text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {act.durationMinutes} mins
                      </span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" /> {act.rating} / 5.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Est. Cost</p>
                    <p className="text-base font-extrabold text-slate-900">₹{act.estimatedCost.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => updateParam('page', String(page - 1))}
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
                onClick={() => updateParam('page', String(page + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
