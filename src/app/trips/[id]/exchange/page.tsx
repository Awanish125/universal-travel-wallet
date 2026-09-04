'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Repeat2, TrendingUp, TrendingDown, MapPin, Building2, FileText } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { exchangeRepository } from '../../../../infrastructure/repositories/exchange-repository';
import { Exchange } from '../../../../domain/entities/exchange';
import { Money } from '../../../../domain/financial/money';
import { CompositeRateManager } from '../../../../infrastructure/rates/composite-manager';
import { OpenCurrencyProvider } from '../../../../infrastructure/rates/open-currency-provider';
import { WalletMapper } from '../../../../infrastructure/mappers/wallet-mapper';

import { SoftCard } from '../../../../components/common/SoftCard';
import { SoftButton } from '../../../../components/common/SoftButton';
import { CurrencySelect } from '../../../../components/common/CurrencySelect';

const rateManager = new CompositeRateManager(new OpenCurrencyProvider());

const exchangeSchema = z.object({
  givenAmount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid amount'),
  givenCurrency: z.string().length(3),
  givenWalletId: z.string().optional(),

  receivedAmount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid amount'),
  receivedCurrency: z.string().length(3),
  receivedWalletId: z.string().optional(),

  fee: z.string().optional(),
  provider: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
});

type ExchangeFormValues = z.infer<typeof exchangeSchema>;

export default function RecordExchangePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawWallets = useLiveQuery(() => db.wallets.where('tripId').equals(params.id).toArray(), [params.id]);

  const [marketRate, setMarketRate] = useState<number | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, setValue } = useForm<ExchangeFormValues>({
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
    }
  });

  const givenCurrency = watch('givenCurrency');
  const receivedCurrency = watch('receivedCurrency');
  const givenAmount = watch('givenAmount');
  const receivedAmount = watch('receivedAmount');

  // Set default currencies on trip load
  useEffect(() => {
    if (trip && !givenCurrency) {
      setValue('givenCurrency', trip.baseCurrency);
      setValue('receivedCurrency', 'IDR'); // sensible fallback or another currency
    }
  }, [trip, givenCurrency, setValue]);

  // Fetch market exchange rate whenever currencies change
  useEffect(() => {
    if (givenCurrency && receivedCurrency && givenCurrency !== receivedCurrency) {
      rateManager.getRate(givenCurrency, receivedCurrency).then(rate => {
        setMarketRate(rate);
      }).catch(() => setMarketRate(null));
    }
  }, [givenCurrency, receivedCurrency]);

  if (!trip || !rawWallets) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading exchange form...</div>;
  }

  const wallets = rawWallets.map(WalletMapper.toDomain);
  const givenWallets = wallets.filter(w => w.balance.currency === givenCurrency);
  const receivedWallets = wallets.filter(w => w.balance.currency === receivedCurrency);

  // Auto-fill received amount if market rate is known and given amount is entered
  const handleAutoFillReceived = () => {
    if (givenAmount && marketRate) {
      const calculated = (Number(givenAmount) * marketRate).toFixed(2);
      setValue('receivedAmount', calculated);
    }
  };

  // Calculations for stats
  const numericGiven = Number(givenAmount) || 0;
  const numericReceived = Number(receivedAmount) || 0;
  const actualRate = numericGiven > 0 ? (numericReceived / numericGiven).toFixed(4) : '0';
  
  let expectedReceived = 0;
  let gainLoss = 0;
  if (numericGiven > 0 && marketRate) {
    expectedReceived = numericGiven * marketRate;
    gainLoss = numericReceived - expectedReceived;
  }

  const onSubmit = async (data: ExchangeFormValues) => {
    try {
      const givenMoney = Money.fromDecimal(data.givenAmount, data.givenCurrency);
      const receivedMoney = Money.fromDecimal(data.receivedAmount, data.receivedCurrency);
      const feeMoney = Money.fromDecimal(data.fee || '0', data.givenCurrency);
      const diffMoney = Money.fromDecimal((expectedReceived - numericReceived).toFixed(2), data.receivedCurrency);
      const gainLossMoney = Money.fromDecimal(gainLoss.toFixed(2), data.receivedCurrency);

      const exchange = new Exchange({
        id: crypto.randomUUID(),
        tripId: trip.id,
        givenWalletId: data.givenWalletId || undefined,
        givenAmount: givenMoney,
        receivedWalletId: data.receivedWalletId || undefined,
        receivedAmount: receivedMoney,
        actualRate: actualRate.toString(),
        marketRate: marketRate ? marketRate.toString() : '1',
        difference: diffMoney,
        gainLoss: gainLossMoney,
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
      alert('Failed to save currency exchange.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Record Exchange</h1>
        </div>
      </header>

      <main className="p-4 mt-2 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Given Card */}
          <SoftCard className="p-5 border-l-4 border-l-amber-500">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">You Give</h2>
            
            <div className="space-y-4">
              <div>
                <Controller
                  name="givenCurrency"
                  control={control}
                  render={({ field }) => (
                    <CurrencySelect 
                      label="Currency Given"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">Amount Given</label>
                <input 
                  type="number"
                  step="any"
                  {...register('givenAmount')}
                  placeholder="0.00"
                  className="w-full bg-transparent text-3xl font-black outline-none text-foreground"
                />
                {errors.givenAmount && <p className="text-xs text-destructive mt-1">{errors.givenAmount.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Deduct from Wallet (Optional)</label>
                <select 
                  {...register('givenWalletId')}
                  className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner mt-1"
                >
                  <option value="">No Wallet (External Cash)</option>
                  {givenWallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.balance.format()})</option>
                  ))}
                </select>
              </div>
            </div>
          </SoftCard>

          {/* Swap Indicator */}
          <div className="flex justify-center -my-3 relative z-10">
            <button 
              type="button" 
              onClick={handleAutoFillReceived}
              className="p-3 bg-brand-accent text-white rounded-full shadow-soft-accent hover:scale-105 transition-transform flex items-center gap-1 text-xs font-bold px-4"
            >
              <Repeat2 className="w-4 h-4" /> Auto-calc by Market Rate
            </button>
          </div>

          {/* Received Card */}
          <SoftCard className="p-5 border-l-4 border-l-emerald-500">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">You Receive</h2>
            
            <div className="space-y-4">
              <div>
                <Controller
                  name="receivedCurrency"
                  control={control}
                  render={({ field }) => (
                    <CurrencySelect 
                      label="Currency Received"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-foreground mb-1 block">Amount Received</label>
                <input 
                  type="number"
                  step="any"
                  {...register('receivedAmount')}
                  placeholder="0.00"
                  className="w-full bg-transparent text-3xl font-black outline-none text-foreground"
                />
                {errors.receivedAmount && <p className="text-xs text-destructive mt-1">{errors.receivedAmount.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Add to Wallet (Optional)</label>
                <select 
                  {...register('receivedWalletId')}
                  className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner mt-1"
                >
                  <option value="">No Wallet (External Cash)</option>
                  {receivedWallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.balance.format()})</option>
                  ))}
                </select>
              </div>
            </div>
          </SoftCard>

          {/* Exchange Performance Card */}
          {numericGiven > 0 && numericReceived > 0 && (
            <SoftCard className="p-4 bg-muted/40 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Actual Rate:</span>
                <span className="font-bold text-foreground">1 {givenCurrency} = {actualRate} {receivedCurrency}</span>
              </div>
              {marketRate && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Market Rate:</span>
                  <span className="font-bold text-foreground">1 {givenCurrency} = {marketRate} {receivedCurrency}</span>
                </div>
              )}
              {marketRate && (
                <div className="flex justify-between text-xs pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Gain / Loss:</span>
                  <span className={`font-black flex items-center gap-1 ${gainLoss >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                    {gainLoss >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                    {gainLoss.toFixed(2)} {receivedCurrency}
                  </span>
                </div>
              )}
            </SoftCard>
          )}

          {/* Optional Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Money Changer / Provider (Optional)
              </label>
              <input 
                {...register('provider')}
                placeholder="e.g. BMC Money Changer"
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Location (Optional)
              </label>
              <input 
                {...register('location')}
                placeholder="e.g. Seminyak, Bali"
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <FileText className="w-4 h-4" /> Fee in {givenCurrency} (Optional)
              </label>
              <input 
                type="number"
                step="any"
                {...register('fee')}
                placeholder="0.00"
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner mt-1"
              />
            </div>
          </div>

          <SoftButton 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
          >
            {isSubmitting ? 'Saving Exchange...' : 'Save Exchange Record'}
          </SoftButton>
        </form>
      </main>
    </div>
  );
}
