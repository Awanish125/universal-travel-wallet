'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Split, Wallet as WalletIcon, FileText } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { expenseRepository } from '../../../../infrastructure/repositories/expense-repository';
import { Expense } from '../../../../domain/entities/expense';
import { Money } from '../../../../domain/financial/money';
import { CompositeRateManager } from '../../../../infrastructure/rates/composite-manager';
import { OpenCurrencyProvider } from '../../../../infrastructure/rates/open-currency-provider';

import { SoftCard } from '../../../../components/common/SoftCard';
import { SoftButton } from '../../../../components/common/SoftButton';
import { CurrencySelect } from '../../../../components/common/CurrencySelect';
import { BillChipsInput } from '../../../../components/expenses/BillChipsInput';
import { ParticipantMapper } from '../../../../infrastructure/mappers/participant-mapper';
import { CategoryMapper } from '../../../../infrastructure/mappers/category-mapper';
import { WalletMapper } from '../../../../infrastructure/mappers/wallet-mapper';

const rateManager = new CompositeRateManager(new OpenCurrencyProvider());

const expenseSchema = z.object({
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid amount'),
  currency: z.string().length(3),
  payerId: z.string().min(1, 'Select who paid'),
  categoryId: z.string().min(1, 'Select a category'),
  walletId: z.string().optional(),
  note: z.string().max(100).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function AddExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Data Fetching
  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawParticipants = useLiveQuery(() => db.participants.where('tripId').equals(params.id).toArray(), [params.id]);
  const rawCategories = useLiveQuery(() => db.categories.toArray());
  const rawWallets = useLiveQuery(() => db.wallets.where('tripId').equals(params.id).toArray(), [params.id]);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch, reset, setValue } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      currency: '',
      payerId: '',
      categoryId: '',
      walletId: '',
      note: '',
    }
  });

  // Set defaults once data loads
  useEffect(() => {
    if (trip && rawParticipants && rawCategories) {
      const me = rawParticipants.find(p => p.isUser);
      const formCurrency = watch('currency');
      if (!formCurrency) {
        // Only reset the currency and payerId, keeping amount/note empty
        reset((formValues) => ({
          ...formValues,
          currency: trip.baseCurrency,
          payerId: me ? me.id : rawParticipants[0]?.id || '',
        }));
      }
    }
  }, [trip, rawParticipants, rawCategories, reset, watch]);

  if (!trip || !rawParticipants || !rawCategories || !rawWallets) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>;
  }

  const participants = rawParticipants.map(ParticipantMapper.toDomain);
  const categories = rawCategories.map(CategoryMapper.toDomain);
  const wallets = rawWallets.map(WalletMapper.toDomain);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      // 1. Fetch live exchange rate between the expense currency and the trip's base currency
      const rate = await rateManager.getRate(data.currency, trip.baseCurrency);
      
      // 2. Parse Money values
      const originalAmount = Money.fromDecimal(data.amount, data.currency);
      const baseAmount = originalAmount.multiply(rate); // Converted to base currency
      
      // 3. Create Entity (Defaulting to EQUAL split for everyone for now)
      // We divide the total amount evenly among all participants by default.
      const perPersonShare = originalAmount.divide(participants.length);
      
      const splits = participants.map(p => ({
        participantId: p.id,
        amount: perPersonShare,
        percentage: 100 / participants.length,
      }));

      const newExpense = new Expense({
        id: crypto.randomUUID(),
        tripId: trip.id,
        payerId: data.payerId,
        originalAmount,
        baseAmount: Money.fromDecimal(baseAmount.toDecimalString(), trip.baseCurrency),
        exchangeRate: rate.toString(),
        category: data.categoryId,
        paymentMethod: data.walletId ? 'WALLET' : 'CASH', // simplified
        walletId: data.walletId || undefined,
        isShared: true,
        splitMethod: 'EQUAL',
        splits,
        note: data.note,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      // 4. Save and return
      await expenseRepository.save(newExpense);
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error('Failed to save expense', error);
      alert('Failed to save expense. Please check your balance or inputs.');
    }
  };

  const selectedCurrency = watch('currency');
  const applicableWallets = wallets.filter(w => w.balance.currency === selectedCurrency);

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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Add Expense</h1>
        </div>
      </header>

      <main className="p-4 mt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Amount & Currency */}
          <SoftCard className="p-5 flex flex-col gap-4">
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">Amount</label>
              <input 
                type="number"
                step="any"
                {...register('amount')}
                placeholder="0.00"
                className="w-full bg-transparent text-4xl font-black tracking-tighter outline-none text-foreground placeholder:text-muted-foreground/30"
              />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount.message}</p>}
              
              <BillChipsInput 
                currency={selectedCurrency || 'USD'} 
                onAddAmount={(addVal) => {
                  const current = Number(watch('amount')) || 0;
                  setValue('amount', (current + addVal).toString());
                }}
              />
            </div>

            <div>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CurrencySelect 
                    label="Currency"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.currency && <p className="text-xs text-destructive mt-1">{errors.currency.message}</p>}
            </div>
          </SoftCard>

          {/* Details */}
          <div className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Who paid?</label>
              <select 
                {...register('payerId')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              >
                <option value="">Select payer</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name} {p.isUser ? '(You)' : ''}</option>
                ))}
              </select>
              {errors.payerId && <p className="text-xs text-destructive mt-1">{errors.payerId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select 
                {...register('categoryId')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <WalletIcon className="w-4 h-4" /> Paid from Wallet (Optional)
              </label>
              <select 
                {...register('walletId')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              >
                <option value="">No Wallet (External)</option>
                {applicableWallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.balance.format()})</option>
                ))}
              </select>
              {applicableWallets.length === 0 && selectedCurrency && (
                <p className="text-xs text-muted-foreground mt-1">No {selectedCurrency} wallets found.</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground flex items-center gap-1">
                <FileText className="w-4 h-4" /> Note (Optional)
              </label>
              <input 
                {...register('note')}
                placeholder="What was this for?"
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              />
            </div>

          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Expense'}
            </SoftButton>
          </div>
        </form>
      </main>
    </div>
  );
}
