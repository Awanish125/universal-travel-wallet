'use client';

import React, { useEffect, useRef } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, MapPin } from 'lucide-react';
import { tripRepository } from '../../../infrastructure/repositories/trip-repository';
import { Trip } from '../../../domain/entities/trip';
import { SoftCard } from '../../../components/common/SoftCard';
import { SoftButton } from '../../../components/common/SoftButton';
import { CurrencySelect } from '../../../components/common/CurrencySelect';
import { CountrySelect } from '../../../components/common/CountrySelect';
import { DateRangeField } from '../../../components/common/DateRangeField';
import { getCurrencyForCountry } from '../../../lib/countries';
import { currencyBadge } from '../../../lib/currency-format';
import { useCurrencyPreferences } from '../../../hooks/useCurrencyPreferences';
import { newId } from '../../../lib/id';

const createTripSchema = z
  .object({
    name: z.string().min(1, 'Give the trip a name').max(50),
    country: z.string().min(1, 'Pick where you are going'),
    startDate: z.string().min(1, 'Pick a start date'),
    endDate: z.string().min(1, 'Pick an end date'),
    baseCurrency: z.string().length(3, 'Pick the money you count in'),
    localCurrency: z.string().length(3, 'Pick the money spent there'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'The end date cannot be before the start date',
    path: ['endDate'],
  });

type CreateTripFormValues = z.infer<typeof createTripSchema>;

export default function CreateTripPage() {
  const router = useRouter();
  const preferences = useCurrencyPreferences();
  // The remembered home currency should fill the field once, not fight the
  // user if they then pick something else.
  const hasAppliedPreference = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      name: '',
      country: '',
      startDate: today,
      endDate: today,
      baseCurrency: '',
      localCurrency: '',
    },
  });

  const homeCurrency = useWatch({ control, name: 'baseCurrency' });
  const localCurrency = useWatch({ control, name: 'localCurrency' });

  useEffect(() => {
    if (!preferences.isLoaded || hasAppliedPreference.current) return;
    hasAppliedPreference.current = true;
    if (preferences.home && !getValues('baseCurrency')) {
      setValue('baseCurrency', preferences.home);
    }
  }, [preferences.isLoaded, preferences.home, setValue, getValues]);

  /** Picking a country fills in the money spent there — no second question. */
  function handleCountryChange(countryName: string, onChange: (v: string) => void) {
    onChange(countryName);
    const currency = getCurrencyForCountry(countryName);
    if (currency) setValue('localCurrency', currency, { shouldValidate: true });
  }

  const onSubmit = async (data: CreateTripFormValues) => {
    try {
      const newTrip = new Trip({
        id: newId(),
        name: data.name,
        country: data.country,
        startDate: data.startDate,
        endDate: data.endDate,
        baseCurrency: data.baseCurrency,
        localCurrency: data.localCurrency,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await tripRepository.save(newTrip);
      // Remember both currencies so no later screen asks for them again.
      await preferences.remember({ home: data.baseCurrency, local: data.localCurrency });

      router.push(`/trips/${newTrip.id}`);
    } catch (error) {
      console.error('Failed to create trip', error);
      window.alert('The trip could not be saved. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <header className="flex items-center gap-3 py-6">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-strong"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">New trip</h1>
        </header>

        <SoftCard className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="trip-name" className="text-sm font-medium text-foreground">
                Trip name
              </label>
              <div className="field-focus-ring">
                <input
                  id="trip-name"
                  {...register('name')}
                  placeholder="e.g. Summer in Bali"
                  aria-invalid={errors.name ? true : undefined}
                  className="field-surface"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CountrySelect
                    label="Where are you going?"
                    value={field.value}
                    onChange={(country) => handleCountryChange(country, field.onChange)}
                    error={errors.country?.message}
                  />
                )}
              />
            </div>

            <Controller
              name="startDate"
              control={control}
              render={({ field: startField }) => (
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field: endField }) => (
                    <DateRangeField
                      label="When are you going?"
                      hint="— tap to pick both dates"
                      startDate={startField.value}
                      endDate={endField.value}
                      onChange={({ startDate, endDate }) => {
                        startField.onChange(startDate);
                        endField.onChange(endDate);
                      }}
                      error={errors.startDate?.message ?? errors.endDate?.message}
                    />
                  )}
                />
              )}
            />

            <div className="space-y-4 rounded-2xl border border-border p-4">
              <p className="text-sm font-bold text-foreground">Your money</p>

              <Controller
                name="baseCurrency"
                control={control}
                render={({ field }) => (
                  <CurrencySelect
                    label="Money you count in"
                    hint="— your home money"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.baseCurrency?.message}
                  />
                )}
              />

              <Controller
                name="localCurrency"
                control={control}
                render={({ field }) => (
                  <CurrencySelect
                    label="Money you'll spend there"
                    hint="— filled in from the country"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.localCurrency?.message}
                  />
                )}
              />

              <ConversionPreview home={homeCurrency} local={localCurrency} />
            </div>

            <SoftButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base"
            >
              {isSubmitting ? 'Creating...' : 'Create trip'}
            </SoftButton>
          </form>
        </SoftCard>
      </div>
    </div>
  );
}

/** Reminds the user, in one line, which money means what on this trip. */
function ConversionPreview({ home, local }: { home: string; local: string }) {
  if (!home || !local) return null;

  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Home className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold text-foreground">{currencyBadge(home)}</span>
      <span>at home</span>
      <MapPin className="h-3.5 w-3.5 shrink-0" />
      <span className="font-semibold text-foreground">{currencyBadge(local)}</span>
      <span>on the trip</span>
    </p>
  );
}
