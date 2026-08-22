import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Map, Calendar, Image as ImageIcon, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { Currency } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { getErrorMessage } from '@/api/client';

const createTripSchema = z
  .object({
    name: z.string().min(2, 'Trip name must be at least 2 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    description: z.string().optional(),
    coverImageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AED']),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date cannot be earlier than start date',
      path: ['endDate'],
    },
  );

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export function CreateTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: '',
      coverImageUrl: '',
      currency: 'INR',
    },
  });

  const selectedCover = watch('coverImageUrl');

  const presetCovers = [
    { label: 'Paris / Europe', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tokyo / Japan', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    { label: 'Beach / Tropical', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mountains', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  ];

  const onSubmit = async (data: CreateTripFormValues) => {
    try {
      setError(null);
      setLoading(true);
      const trip = await tripsApi.create({
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        coverImageUrl: data.coverImageUrl || undefined,
        currency: data.currency as Currency,
      });
      navigate(`/trips/${trip.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create trip'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/trips" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Plan New Trip</h1>
          <p className="text-xs text-slate-500">Define your travel dates, trip name, and preferred currency</p>
        </div>
      </div>

      <Card className="p-8 bg-white border border-slate-200 shadow-xl space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Trip Name *"
            placeholder="e.g. Grand European Tour 2026"
            leftIcon={<Map className="w-4 h-4" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.startDate?.message}
              {...register('startDate')}
            />

            <Input
              label="End Date *"
              type="date"
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Currency *"
              error={errors.currency?.message}
              {...register('currency')}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="AED">AED (AED)</option>
            </Select>

            <Input
              label="Cover Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              leftIcon={<ImageIcon className="w-4 h-4" />}
              error={errors.coverImageUrl?.message}
              {...register('coverImageUrl')}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Or pick a preset cover photo:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetCovers.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setValue('coverImageUrl', preset.url)}
                  className={`h-20 rounded-xl overflow-hidden relative border-2 transition-all group ${
                    selectedCover === preset.url ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 right-1 px-1.5 py-0.5 bg-slate-950/70 text-[10px] text-white font-medium rounded truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Trip Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Write a brief overview of your travel goals, highlights, or notes..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900"
              {...register('description')}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link to="/trips">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" loading={loading} className="px-6 shadow-md">
              <span>Create & Add Stops</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
