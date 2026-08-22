import { useState } from 'react';
import { Plus, GripVertical, MapPin, Calendar, Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { tripsApi, citiesApi, activitiesApi } from '@/api/trips';
import type { TripStop, City, Activity } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { getErrorMessage } from '@/api/client';
import { format } from 'date-fns';

interface ItineraryTabProps {
  tripId: string;
  stops: TripStop[];
  canEdit: boolean;
  onRefresh: () => void;
}

export function ItineraryTab({ tripId, stops, canEdit, onRefresh }: ItineraryTabProps) {
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [addActivityModalOpen, setAddActivityModalOpen] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  // City Picker State
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [submittingStop, setSubmittingStop] = useState(false);

  // Activity Picker State
  const [activitySearch, setActivitySearch] = useState('');
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [submittingActivity, setSubmittingActivity] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEndStops = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stops.findIndex((s) => s.id === active.id);
    const newIndex = stops.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const nextStops = [...stops];
    const [moved] = nextStops.splice(oldIndex, 1);
    nextStops.splice(newIndex, 0, moved);

    const orderedIds = nextStops.map((s) => s.id);
    try {
      await tripsApi.reorderStops(tripId, orderedIds);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to reorder stops'));
    }
  };

  const handleSearchCities = async (q: string) => {
    setCitySearch(q);
    try {
      const res = await citiesApi.search({ search: q, limit: 10 });
      setCities(res.data);
    } catch {
      // ignore
    }
  };

  const handleAddStopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) return alert('Please select a city');
    try {
      setSubmittingStop(true);
      await tripsApi.addStop(tripId, {
        cityId: selectedCityId,
        arrivalDate: arrivalDate || undefined,
        departureDate: departureDate || undefined,
      });
      setAddStopModalOpen(false);
      setSelectedCityId(null);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to add stop'));
    } finally {
      setSubmittingStop(false);
    }
  };

  const handleOpenActivityModal = async (stop: TripStop) => {
    setSelectedStopId(stop.id);
    setAddActivityModalOpen(true);
    try {
      const res = await activitiesApi.search({ cityId: stop.cityId, limit: 20 });
      setAvailableActivities(res.data);
    } catch {
      // ignore
    }
  };

  const handleAddActivityToStop = async (activityId: string) => {
    if (!selectedStopId) return;
    try {
      setSubmittingActivity(true);
      await tripsApi.addActivity(selectedStopId, { activityId });
      setAddActivityModalOpen(false);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to add activity'));
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to remove this city stop?')) return;
    try {
      await tripsApi.deleteStop(stopId);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to delete stop'));
    }
  };

  const handleRemoveActivity = async (stopActivityId: string) => {
    try {
      await tripsApi.removeActivity(stopActivityId);
      onRefresh();
    } catch (err) {
      alert(getErrorMessage(err, 'Failed to remove activity'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Multi-City Itinerary</h2>
          <p className="text-xs text-slate-500">Organize destinations, schedule dates, and customize activities</p>
        </div>

        {canEdit && (
          <Button onClick={() => { setAddStopModalOpen(true); handleSearchCities(''); }} size="sm">
            <Plus className="w-4 h-4 mr-1.5" /> Add Destination City
          </Button>
        )}
      </div>

      {stops.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-slate-50/50 border-dashed border-2">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 mx-auto flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="font-bold text-slate-900">No city stops added yet</h3>
            <p className="text-xs text-slate-500">Build your itinerary by adding destination cities and exploring local activities.</p>
          </div>
          {canEdit && (
            <Button onClick={() => { setAddStopModalOpen(true); handleSearchCities(''); }}>
              <Plus className="w-4 h-4 mr-1.5" /> Add First City Stop
            </Button>
          )}
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStops}>
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {stops.map((stop, idx) => (
                <SortableStopCard
                  key={stop.id}
                  stop={stop}
                  index={idx}
                  canEdit={canEdit}
                  onAddActivity={() => handleOpenActivityModal(stop)}
                  onDeleteStop={() => handleDeleteStop(stop.id)}
                  onRemoveActivity={handleRemoveActivity}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Stop Modal */}
      <Modal isOpen={addStopModalOpen} onClose={() => setAddStopModalOpen(false)} title="Add Destination City">
        <form onSubmit={handleAddStopSubmit} className="space-y-4">
          <Input
            label="Search City"
            placeholder="e.g. Paris, Tokyo, London..."
            value={citySearch}
            onChange={(e) => handleSearchCities(e.target.value)}
          />

          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => setSelectedCityId(city.id)}
                className={`w-full p-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  selectedCityId === city.id ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-slate-700'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm">{city.name}, {city.country}</p>
                  <p className="text-xs text-slate-500">{city.region} • Cost Index: {'$'.repeat(city.costIndex)}</p>
                </div>
                {selectedCityId === city.id && <span className="text-xs text-primary-600 font-bold">Selected</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Arrival Date" type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} />
            <Input label="Departure Date" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" type="button" onClick={() => setAddStopModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submittingStop}>Add Stop</Button>
          </div>
        </form>
      </Modal>

      {/* Add Activity Modal */}
      <Modal isOpen={addActivityModalOpen} onClose={() => setAddActivityModalOpen(false)} title="Add Activity to City">
        <div className="space-y-4">
          <Input
            placeholder="Search activity..."
            value={activitySearch}
            onChange={async (e) => {
              setActivitySearch(e.target.value);
              const stop = stops.find((s) => s.id === selectedStopId);
              if (stop) {
                const res = await activitiesApi.search({ cityId: stop.cityId, search: e.target.value, limit: 20 });
                setAvailableActivities(res.data);
              }
            }}
          />

          <div className="max-h-64 overflow-y-auto space-y-2">
            {availableActivities.map((act) => (
              <div key={act.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-0.5 max-w-xs">
                  <p className="font-semibold text-sm text-slate-900">{act.name}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{act.description}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-0.5">
                    <span className="font-semibold text-emerald-600">₹{act.estimatedCost}</span>
                    <span>• {act.durationMinutes} mins</span>
                    <span>• {act.category}</span>
                  </div>
                </div>
                <Button size="sm" loading={submittingActivity} onClick={() => handleAddActivityToStop(act.id)}>
                  + Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SortableStopCard({
  stop,
  index,
  canEdit,
  onAddActivity,
  onDeleteStop,
  onRemoveActivity,
}: {
  stop: TripStop;
  index: number;
  canEdit: boolean;
  onAddActivity: () => void;
  onDeleteStop: () => void;
  onRemoveActivity: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const [expanded, setExpanded] = useState(true);

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
      {/* City Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {canEdit && (
            <button {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-white p-1">
              <GripVertical className="w-5 h-5" />
            </button>
          )}

          <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>

          <div>
            <h3 className="font-bold text-lg leading-snug">{stop.city.name}, {stop.city.country}</h3>
            {stop.arrivalDate && stop.departureDate && (
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary-400" />
                {format(new Date(stop.arrivalDate), 'dd MMM')} - {format(new Date(stop.departureDate), 'dd MMM yyyy')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={onAddActivity} className="text-xs text-primary-300 hover:text-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Activity
            </Button>
          )}

          {canEdit && (
            <button onClick={onDeleteStop} className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-slate-400 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Activities List */}
      {expanded && (
        <div className="p-4 space-y-3 bg-slate-50/50">
          {stop.activities.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">No activities scheduled for this stop yet.</p>
          ) : (
            <div className="space-y-2">
              {stop.activities.map((sa) => (
                <div key={sa.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-slate-900">{sa.activity.name}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="font-bold text-emerald-600">₹{sa.activity.estimatedCost}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {sa.activity.durationMinutes} min</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-semibold">{sa.activity.category}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <button onClick={() => onRemoveActivity(sa.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
