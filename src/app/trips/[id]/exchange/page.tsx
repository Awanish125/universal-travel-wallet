'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  FileText,
  MapPin,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { exchangeRepository } from '../../../../infrastructure/repositories/exchange-repository';
import { Exchange } from '../../../../domain/entities/exchange';
import { Money, getCurrencyDecimals } from '../../../../domain/financial/money';
import { CompositeRateManager } from '../../../../infrastructure/rates/composite-manager';
import { OpenCurrencyProvider } from '../../../../infrastructure/rates/open-currency-provider';
import { WalletMapper } from '../../../../infrastructure/mappers/wallet-mapper';

import { SoftCard } from '../../../../components/common/SoftCard';
import { SoftButton } from '../../../../components/common/SoftButton';
import { CurrencySelect } from '../../../../components/common/CurrencySelect';
import { SearchableSelect } from '../../../../components/common/SearchableSelect';
import { CreateWalletModal } from '../../../../components/wallets/CreateWalletModal';
import { currencySymbol, formatAmount, formatMoney } from '../../../../lib/currency-format';
import { newId } from '../../../../lib/id';

const rateManager = new CompositeRateManager(new OpenCurrencyProvider());

const exchangeSchema = z.object({
  givenAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter an amount above zero'),
  givenCurrency: z.string().length(3),
  givenWalletId: z.string().optional(),

  receivedAmount: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter an amount above zero'),
  receivedCurrency: z.string().length(3),
  receivedWalletId: z.string().optional(),

  fee: z.string().optional(),
  provider: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
});

type ExchangeFormValues = z.infer<typeof exchangeSchema>;

const inputClasses =
  'field-surface';

type WalletSheetTarget = 'given' | 'received' | null;

export default function RecordExchangePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawWallets = useLiveQuery(
    () => db.wallets.where('tripId').equals(params.id).toArray(),
    [params.id]
  );

  const [marketRate, setMarketRate] = useState<number | null>(null);
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [walletSheet, setWalletSheet] = useState<WalletSheetTarget>(null);
  const [walletSheetName, setWalletSheetName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Once the traveller types their own received amount, the app stops
  // overwriting it — the money changer's real number is what matters.
  const receivedTouchedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExchangeFormValues>({
    resolver: zodResolver(exchangeSchema),
    defaultValues: {
      givenAmount: '',
      givenCurrency: '',
      givenWalletId: '',
      receivedAmount: '',
      receivedCurrency: '',
      receivedWalletId: '',
      fee: '0',
      provider: '',
      location: '',
      note: '',
    },
  });

  const givenCurrency = useWatch({ control, name: 'givenCurrency' });
  const receivedCurrency = useWatch({ control, name: 'receivedCurrency' });
  const givenAmount = useWatch({ control, name: 'givenAmount' });
  const receivedAmount = useWatch({ control, name: 'receivedAmount' });

  // Prefill the trip's own two currencies: you hand over home money and
  // receive the local money. No hardcoded currency, no second question.
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  useEffect(() => {
    if (defaultsApplied || !trip) return;
    setDefaultsApplied(true);
    setValue('givenCurrency', trip.baseCurrency);
    setValue('receivedCurrency', trip.localCurrency || trip.baseCurrency);
  }, [defaultsApplied, trip, setValue]);

  useEffect(() => {
    if (!givenCurrency || !receivedCurrency || givenCurrency === receivedCurrency) {
      setMarketRate(null);
      return;
    }
    let active = true;
    setIsRateLoading(true);
    rateManager
      .getRate(givenCurrency, receivedCurrency)
      .then((rate) => {
        if (active) setMarketRate(rate);
      })
      .catch(() => {
        if (active) setMarketRate(null);
      })
      .finally(() => {
        if (active) setIsRateLoading(false);
      });
    return () => {
      active = false;
    };
  }, [givenCurrency, receivedCurrency]);

  // Fill the expected received amount as the user types, so the common case
  // needs no extra tap. It only auto-fills until the user edits it themselves.
  useEffect(() => {
    if (receivedTouchedRef.current || !marketRate || !receivedCurrency) return;
    const numericGiven = Number(givenAmount);
    if (!numericGiven) {
      setValue('receivedAmount', '');
      return;
    }
    const expected = numericGiven * marketRate;
    setValue('receivedAmount', expected.toFixed(getCurrencyDecimals(receivedCurrency)));
  }, [givenAmount, marketRate, receivedCurrency, setValue]);

  const wallets = useMemo(() => (rawWallets ?? []).map(WalletMapper.toDomain), [rawWallets]);
  const givenWallets = useMemo(
    () => wallets.filter((w) => w.balance.currency === givenCurrency),
    [wallets, givenCurrency]
  );
  const receivedWallets = useMemo(
    () => wallets.filter((w) => w.balance.currency === receivedCurrency),
    [wallets, receivedCurrency]
  );

  const numericGiven = Number(givenAmount) || 0;
  const numericReceived = Number(receivedAmount) || 0;
  const actualRate = numericGiven > 0 ? (numericReceived / numericGiven).toFixed(4) : '0';
  const expectedReceived = marketRate ? numericGiven * marketRate : 0;
  const gainLoss = marketRate ? numericReceived - expectedReceived : 0;
  // Rounded to the currency's own smallest unit, a sub-unit difference is not
  // a gain or a loss — calling it one would be noise.
  const isRateMatch =
    Math.abs(gainLoss) < Math.pow(10, -getCurrencyDecimals(receivedCurrency || 'USD'));

  if (!trip || !rawWallets) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading exchange form...
      </div>
    );
  }

  function swapCurrencies() {
    const currentGiven = getValues('givenCurrency');
    const currentReceived = getValues('receivedCurrency');
    setValue('givenCurrency', currentReceived);
    setValue('receivedCurrency', currentGiven);
    setValue('givenWalletId', '');
    setValue('receivedWalletId', '');
    receivedTouchedRef.current = false;
  }

  const onSubmit = async (data: ExchangeFormValues) => {
    setSaveError(null);
    try {
      const givenMoney = Money.fromDecimal(data.givenAmount, data.givenCurrency);
      const receivedMoney = Money.fromDecimal(data.receivedAmount, data.receivedCurrency);
      const feeMoney = Money.fromDecimal(data.fee || '0', data.givenCurrency);
      const receivedDecimals = getCurrencyDecimals(data.receivedCurrency);

      const exchange = new Exchange({
        id: newId(),
        tripId: trip.id,
        givenWalletId: data.givenWalletId || undefined,
        givenAmount: givenMoney,
        receivedWalletId: data.receivedWalletId || undefined,
        receivedAmount: receivedMoney,
        actualRate,
        marketRate: marketRate ? marketRate.toString() : actualRate,
        difference: Money.fromDecimal(
          (expectedReceived - numericReceived).toFixed(receivedDecimals),
          data.receivedCurrency
        ),
        gainLoss: Money.fromDecimal(
          gainLoss.toFixed(receivedDecimals),
          data.receivedCurrency
        ),
        fee: feeMoney,
        date: new Date().toISOString(),
        location: data.location,
        provider: data.provider,
        note: data.note,
      });

      await exchangeRepository.save(exchange);
      router.push(`/trips/${trip.id}`);
    } catch (err) {
      console.error('Failed to save exchange:', err);
      setSaveError(
        'This exchange could not be saved. Check the wallet has enough balance and try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <CreateWalletModal
        tripId={trip.id}
        isOpen={walletSheet !== null}
        initialName={walletSheetName}
        defaultCurrency={walletSheet === 'given' ? givenCurrency : receivedCurrency}
        onClose={() => {
          setWalletSheet(null);
          setWalletSheetName('');
        }}
        onCreated={(walletId) => {
          if (walletSheet === 'given') setValue('givenWalletId', walletId);
          else setValue('receivedWalletId', walletId);
        }}
      />

      <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/trips/${trip.id}`)}
            aria-label="Go back to the trip"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-strong"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight text-foreground">
              Change money
            </h1>
            <p className="truncate text-xs text-muted-foreground">{trip.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-4 max-w-2xl px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SoftCard className="space-y-4 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              You hand over
            </h2>

            <div>
              <label htmlFor="given-amount" className="sr-only">
                Amount handed over
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-muted-foreground">
                  {givenCurrency ? currencySymbol(givenCurrency) : ''}
                </span>
                <input
                  id="given-amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('givenAmount')}
                  placeholder="0.00"
                  className="financial-num w-full bg-transparent text-3xl font-black text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {errors.givenAmount && (
                <p className="mt-1 text-xs text-destructive">{errors.givenAmount.message}</p>
              )}
            </div>

            <Controller
              name="givenCurrency"
              control={control}
              render={({ field }) => (
                <CurrencySelect
                  label="Money you give"
                  hint={field.value === trip.baseCurrency ? '— your home money' : undefined}
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    setValue('givenWalletId', '');
                    receivedTouchedRef.current = false;
                  }}
                />
              )}
            />

            <Controller
              name="givenWalletId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Take it from"
                  hint="— optional"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Not from a wallet"
                  options={[
                    { value: '', label: 'Not from a wallet', description: 'Nothing is deducted' },
                    ...givenWallets.map((w) => ({
                      value: w.id,
                      label: w.name,
                      description: formatMoney(w.balance),
                    })),
                  ]}
                  onCreate={(typedName) => {
                    setWalletSheetName(typedName);
                    setWalletSheet('given');
                  }}
                  createLabel="Create wallet"
                />
              )}
            />
          </SoftCard>

          <div className="relative z-10 -my-2 flex justify-center">
            <SoftButton
              type="button"
              variant="secondary"
              aria-label="Swap the two currencies"
              onClick={swapCurrencies}
              className="h-12 w-12 rounded-full p-0"
            >
              <ArrowUpDown className="h-5 w-5" />
            </SoftButton>
          </div>

          <SoftCard className="space-y-4 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              You get back
            </h2>

            <div>
              <label htmlFor="received-amount" className="sr-only">
                Amount received
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-muted-foreground">
                  {receivedCurrency ? currencySymbol(receivedCurrency) : ''}
                </span>
                <input
                  id="received-amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('receivedAmount', {
                    onChange: () => {
                      receivedTouchedRef.current = true;
                    },
                  })}
                  placeholder="0.00"
                  className="financial-num w-full bg-transparent text-3xl font-black text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {errors.receivedAmount && (
                <p className="mt-1 text-xs text-destructive">{errors.receivedAmount.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {isRateLoading
                  ? 'Checking today’s rate...'
                  : marketRate
                    ? `Filled in at today’s rate — change it to what the counter actually gave you.`
                    : 'No live rate available. Type what you received.'}
              </p>
            </div>

            <Controller
              name="receivedCurrency"
              control={control}
              render={({ field }) => (
                <CurrencySelect
                  label="Money you receive"
                  hint={
                    field.value === trip.localCurrency ? '— the local money on this trip' : undefined
                  }
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next);
                    setValue('receivedWalletId', '');
                    receivedTouchedRef.current = false;
                  }}
                />
              )}
            />

            <Controller
              name="receivedWalletId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Put it into"
                  hint="— optional"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Not into a wallet"
                  options={[
                    { value: '', label: 'Not into a wallet', description: 'Nothing is added' },
                    ...receivedWallets.map((w) => ({
                      value: w.id,
                      label: w.name,
                      description: formatMoney(w.balance),
                    })),
                  ]}
                  onCreate={(typedName) => {
                    setWalletSheetName(typedName);
                    setWalletSheet('received');
                  }}
                  createLabel="Create wallet"
                />
              )}
            />

            {receivedWallets.length === 0 && receivedCurrency && (
              <p className="text-xs text-muted-foreground">
                No {receivedCurrency} wallet yet — use “Create wallet” above to make one
                without leaving this page.
              </p>
            )}
          </SoftCard>

          {numericGiven > 0 && numericReceived > 0 && (
            <SoftCard variant="inset" className="space-y-2 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Rate you got</span>
                <span className="financial-num font-bold text-foreground">
                  1 {givenCurrency} = {actualRate} {receivedCurrency}
                </span>
              </div>
              {marketRate && (
                <>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Rate online today</span>
                    <span className="financial-num font-bold text-foreground">
                      1 {givenCurrency} = {marketRate.toFixed(4)} {receivedCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-border pt-2">
                    <span className="text-muted-foreground">
                      {isRateMatch
                        ? 'Compared to online'
                        : gainLoss > 0
                          ? 'You did better by'
                          : 'You lost'}
                    </span>
                    {isRateMatch ? (
                      <span className="font-bold text-foreground">Exactly the same</span>
                    ) : (
                      <span
                        className={`financial-num flex items-center gap-1 font-black ${
                          gainLoss > 0 ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {gainLoss > 0 ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {formatAmount(Math.abs(gainLoss), receivedCurrency)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </SoftCard>
          )}

          <SoftCard className="space-y-4 p-5">
            <p className="text-sm font-bold text-foreground">
              Details <span className="font-normal text-muted-foreground">— all optional</span>
            </p>

            <div className="space-y-1">
              <label
                htmlFor="exchange-provider"
                className="flex items-center gap-1 text-sm font-medium text-foreground"
              >
                <Building2 className="h-4 w-4" /> Money changer
              </label>
              <input
                id="exchange-provider"
                {...register('provider')}
                placeholder="e.g. BMC Money Changer"
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="exchange-location"
                className="flex items-center gap-1 text-sm font-medium text-foreground"
              >
                <MapPin className="h-4 w-4" /> Where
              </label>
              <input
                id="exchange-location"
                {...register('location')}
                placeholder="e.g. Seminyak"
                className={inputClasses}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="exchange-fee"
                className="flex items-center gap-1 text-sm font-medium text-foreground"
              >
                <FileText className="h-4 w-4" /> Fee charged
                {givenCurrency && <span className="text-muted-foreground">({givenCurrency})</span>}
              </label>
              <input
                id="exchange-fee"
                type="number"
                inputMode="decimal"
                step="any"
                {...register('fee')}
                placeholder="0.00"
                className={`financial-num ${inputClasses}`}
              />
            </div>
          </SoftCard>

          {saveError && (
            <p role="alert" className="text-sm text-destructive">
              {saveError}
            </p>
          )}

          <SoftButton
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-4 text-base"
          >
            {isSubmitting ? 'Saving...' : 'Save this exchange'}
          </SoftButton>
        </form>
      </main>
    </div>
  );
}
