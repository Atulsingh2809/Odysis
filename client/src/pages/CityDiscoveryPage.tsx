import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Bookmark, Plus, Star, MapPin, Compass } from 'lucide-react';
import { citiesApi, tripsApi } from '@/api/trips';
import { usersApi } from '@/api/users';
import type { City, TripCardData, SavedDestination } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getErrorMessage } from '@/api/client';

export function CityDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [savedCityIds, setSavedCityIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') || '';
  const country = searchParams.get('country') || '';
  const region = searchParams.get('region') || '';
  const sortBy = (searchParams.get('sortBy') as 'popularity' | 'name' | 'costIndex') || 'popularity';
  const page = Number(searchParams.get('page')) || 1;
  const [totalPages, setTotalPages] = useState(1);

  const [selectedCityForTrip, setSelectedCityForTrip] = useState<City | null>(null);
  const [userTrips, setUserTrips] = useState<TripCardData[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [addingStop, setAddingStop] = useState(false);

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [cityRes, savedRes] = await Promise.all([
        citiesApi.search({
          page,
          limit: 12,
          search: search || undefined,
          country: country || undefined,
          region: region || undefined,
          sortBy,
          sortOrder: sortBy === 'name' ? 'asc' : 'desc',
        }),
        usersApi.saved().catch(() => []),
      ]);

      setCities(cityRes.data);
      setTotalPages(cityRes.pagination.totalPages);
      setSavedCityIds(new Set(savedRes.map((s: SavedDestination) => s.cityId)));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load cities'));
    } finally {
      setLoading(false);
    }
  }, [page, search, country, region, sortBy]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    citiesApi.countries().then(setCountries).catch(() => {});
    citiesApi.regions().then(setRegions).catch(() => {});
  }, []);

  const updateParam = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) newParams.set(key, val);
    else newParams.delete(key);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleToggleSave = async (cityId: string) => {
    const isSaved = savedCityIds.has(cityId);
    try {
      if (isSaved) {
        await usersApi.unsaveCity(cityId);
        setSavedCityIds((prev) => {
          const next = new Set(prev);
          next.delete(cityId);
          return next;
        });
      } else {
        await usersApi.saveCity(cityId);
        setSavedCityIds((prev) => new Set(prev).add(cityId));
      }
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to update saved destination'));
    }
  };

  const handleOpenAddToTrip = async (city: City) => {
    setSelectedCityForTrip(city);
    try {
      const res = await tripsApi.list({ limit: 50 });
      setUserTrips(res.data);
      if (res.data.length > 0) setSelectedTripId(res.data[0].id);
    } catch {
      // ignore
    }
  };

  const handleAddToTripSubmit = async () => {
    if (!selectedCityForTrip || !selectedTripId) return;
    try {
      setAddingStop(true);
      await tripsApi.addStop(selectedTripId, { cityId: selectedCityForTrip.id });
      alert(`Successfully added ${selectedCityForTrip.name} to your trip!`);
      setSelectedCityForTrip(null);
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to add city stop'));
    } finally {
      setAddingStop(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Destinations</h1>
        <p className="text-slate-500 text-sm">Discover popular cities, filter by country & cost index, and bookmark favorites</p>
      </div>

      <Card className="p-4 bg-white space-y-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-80">
            <Input
              placeholder="Search city name..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={country}
              onChange={(e) => updateParam('country', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
            >
              <option value="">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={region}
              onChange={(e) => updateParam('region', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
            >
              <option value="popularity">Popularity</option>
              <option value="name">City Name</option>
              <option value="costIndex">Cost Index</option>
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner size="lg" text="Searching destinations..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      ) : cities.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-slate-50/50 border-dashed border-2">
          <Compass className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900">No destinations found</h3>
          <p className="text-xs text-slate-500">Try clearing or adjusting search filters.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const isSaved = savedCityIds.has(city.id);
              return (
                <Card
                  key={city.id}
                  className="overflow-hidden hover:shadow-xl transition-all border border-slate-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 relative bg-slate-900 overflow-hidden">
                      <img
                        src={city.imageUrl}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      <button
                        onClick={() => handleToggleSave(city.id)}
                        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
                          isSaved ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-900/60 text-white hover:bg-slate-900'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save Destination'}
                      >
                        <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="font-bold text-xl">{city.name}</h3>
                        <p className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary-400" /> {city.country} • {city.region}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 bg-white">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{city.description}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                        <span>Cost Index: <span className="font-bold text-slate-900">{'$'.repeat(city.costIndex)}</span></span>
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" /> {city.popularity}% Popularity
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button size="sm" className="w-full" onClick={() => handleOpenAddToTrip(city)}>
                      <Plus className="w-4 h-4 mr-1.5" /> Add to Trip
                    </Button>
                  </div>
                </Card>
              );
            })}
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

      <Modal isOpen={Boolean(selectedCityForTrip)} onClose={() => setSelectedCityForTrip(null)} title={`Add ${selectedCityForTrip?.name} to Trip`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select one of your existing travel itineraries to add this city as a stop:</p>

          {userTrips.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
              <p className="text-xs text-amber-800 font-semibold">You don&apos;t have any active trips created yet.</p>
              <Button size="sm" onClick={() => navigate('/trips/new')}>Plan New Trip</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-sm text-slate-900"
              >
                {userTrips.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.destinationCount} stops)</option>
                ))}
              </select>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => setSelectedCityForTrip(null)}>Cancel</Button>
                <Button loading={addingStop} onClick={handleAddToTripSubmit}>Confirm & Add Stop</Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
