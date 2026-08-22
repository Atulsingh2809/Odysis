import { useState } from 'react';
import { Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import type { TripStop, StopActivity } from '@/types';
import { Card } from '@/components/ui/Card';
import { format, addDays, differenceInDays } from 'date-fns';

interface TimelineTabProps {
  startDate: string;
  endDate: string;
  stops: TripStop[];
}

export function TimelineTab({ startDate, endDate, stops }: TimelineTabProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.max(1, differenceInDays(end, start) + 1);

  const days = Array.from({ length: totalDays }, (_, idx) => {
    const currentDate = addDays(start, idx);
    const dateStr = currentDate.toISOString().split('T')[0];

    const matchingStops = stops.filter((stop) => {
      if (!stop.arrivalDate || !stop.departureDate) return true;
      const sArr = new Date(stop.arrivalDate);
      const sDep = new Date(stop.departureDate);
      return currentDate >= sArr && currentDate <= sDep;
    });

    const dayActivities: StopActivity[] = [];
    matchingStops.forEach((s) => {
      s.activities.forEach((act) => dayActivities.push(act));
    });

    return {
      dayNumber: idx + 1,
      date: currentDate,
      dateStr,
      stops: matchingStops,
      activities: dayActivities,
    };
  });

  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    days.forEach((d) => (init[d.dayNumber] = true));
    return init;
  });

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Day-by-Day Timeline & Calendar</h2>
          <p className="text-xs text-slate-500">
            {totalDays} Day(s) Journey • {format(start, 'dd MMM yyyy')} to {format(end, 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day.dayNumber} className="overflow-hidden border border-slate-200 bg-white">
            <button
              onClick={() => toggleDay(day.dayNumber)}
              className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex flex-col items-center justify-center font-bold shadow-sm">
                  <span className="text-[10px] uppercase font-semibold text-primary-200">Day</span>
                  <span className="text-base leading-none">{day.dayNumber}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {format(day.date, 'EEEE, dd MMMM yyyy')}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 font-medium text-primary-700">
                      <MapPin className="w-3.5 h-3.5" />
                      {day.stops.length > 0 ? day.stops.map((s) => s.city.name).join(', ') : 'Travel / Transit Day'}
                    </span>
                    <span>• {day.activities.length} Activity(ies)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {expandedDays[day.dayNumber] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>

            {expandedDays[day.dayNumber] && (
              <div className="p-4 space-y-3 border-t border-slate-100">
                {day.activities.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-3 text-center">No specific activities scheduled for this day.</p>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {day.activities.map((sa) => (
                      <div key={sa.id} className="relative group">
                        <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white shadow-sm" />

                        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 hover:border-primary-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-slate-900">{sa.activity.name}</h4>
                            <span className="text-xs font-bold text-emerald-600">₹{sa.activity.estimatedCost}</span>
                          </div>

                          <p className="text-xs text-slate-500 line-clamp-2">{sa.activity.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 border-t border-slate-50">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {sa.activity.durationMinutes} mins</span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase font-semibold text-slate-700">{sa.activity.category}</span>
                            <span className="text-slate-400">City: {sa.activity.city?.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
