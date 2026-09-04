'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { tripRepository } from '../../../infrastructure/repositories/trip-repository';
import { Trip } from '../../../domain/entities/trip';
import { SoftCard } from '../../../components/common/SoftCard';
import { SoftButton } from '../../../components/common/SoftButton';
import { CurrencySelect } from '../../../components/common/CurrencySelect';

// Validation Schema
const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(50),
  country: z.string().min(1, 'Country is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  baseCurrency: z.string().length(3, 'Currency code must be 3 letters'),
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export default function CreateTripPage() {
  const router = useRouter();
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      country: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      baseCurrency: 'USD',
    }
  });

  const onSubmit = async (data: CreateTripFormValues) => {
    try {
      const newTrip = new Trip({
        id: crypto.randomUUID(),
        name: data.name,
        country: data.country,
        startDate: data.startDate,
        endDate: data.endDate,
        baseCurrency: data.baseCurrency,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await tripRepository.save(newTrip);
      
      // Navigate to the newly created trip dashboard
      router.push(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <header className="py-6 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          New Trip
        </h1>
      </header>

      <SoftCard className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Trip Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Trip Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Summer in Bali"
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner text-foreground placeholder:text-muted-foreground"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Country</label>
            <input 
              {...register('country')}
              placeholder="e.g. Indonesia"
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner text-foreground placeholder:text-muted-foreground"
            />
            {errors.country && <p className="text-xs text-destructive mt-1">{errors.country.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input 
                type="date"
                {...register('startDate')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner text-foreground"
              />
              {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input 
                type="date"
                {...register('endDate')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner text-foreground"
              />
              {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}
            </div>
          </div>

          {/* Base Currency */}
          <div className="space-y-1">
            <Controller
              name="baseCurrency"
              control={control}
              render={({ field }) => (
                <CurrencySelect 
                  label="Base Currency"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.baseCurrency && <p className="text-xs text-destructive mt-1">{errors.baseCurrency.message}</p>}
          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
            >
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
