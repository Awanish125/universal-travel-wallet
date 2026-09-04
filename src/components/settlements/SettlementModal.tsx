'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Wallet as WalletIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { settlementRepository } from '../../infrastructure/repositories/settlement-repository';
import { Settlement } from '../../domain/entities/settlement';
import { Money } from '../../domain/financial/money';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import { WalletMapper } from '../../infrastructure/mappers/wallet-mapper';

interface Props {
  tripId: string;
  baseCurrency: string;
  debt: { fromId: string; toId: string; amount: string };
  isOpen: boolean;
  onClose: () => void;
}

const settleSchema = z.object({
  settledAmount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Enter a valid amount'),
  walletId: z.string().optional(),
});

type SettleFormValues = z.infer<typeof settleSchema>;

export function SettlementModal({ tripId, baseCurrency, debt, isOpen, onClose }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<SettleFormValues>({
    resolver: zodResolver(settleSchema),
    defaultValues: {
      settledAmount: debt.amount,
      walletId: '',
    }
  });

  const rawParticipants = useLiveQuery(() => db.participants.where('tripId').equals(tripId).toArray(), [tripId]);
  const rawWallets = useLiveQuery(() => db.wallets.where('tripId').equals(tripId).toArray(), [tripId]);

  if (!isOpen || !rawParticipants || !rawWallets) return null;

  const participants = rawParticipants.map(ParticipantMapper.toDomain);
  const wallets = rawWallets.map(WalletMapper.toDomain);
  
  // We only show wallets matching the base currency for simple settlement MVP
  const applicableWallets = wallets.filter(w => w.balance.currency === baseCurrency);

  const fromPerson = participants.find(p => p.id === debt.fromId);
  const toPerson = participants.find(p => p.id === debt.toId);

  if (!fromPerson || !toPerson) return null;

  const originalBalance = Money.fromDecimal(debt.amount, baseCurrency);

  const onSubmit = async (data: SettleFormValues) => {
    try {
      const settledAmountMoney = Money.fromDecimal(data.settledAmount, baseCurrency);
      
      // Determine remaining balance
      // If they paid more than owed, remaining is 0 (we don't create negative debts in this simple modal)
      let remainingBalance = originalBalance.subtract(settledAmountMoney);
      if (remainingBalance.isNegative()) {
        remainingBalance = Money.zero(baseCurrency);
      }

      const settlement = new Settlement({
        id: crypto.randomUUID(),
        tripId,
        payerId: debt.fromId,
        receiverId: debt.toId,
        amount: settledAmountMoney,
        baseAmount: settledAmountMoney, // Same because we settle in base currency for MVP
        exchangeRate: '1',
        paymentMethod: data.walletId ? 'WALLET' : 'CASH',
        walletId: data.walletId || undefined,
        isPartial: !remainingBalance.isZero(),
        originalBalance,
        settledAmount: settledAmountMoney,
        remainingBalance,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      await settlementRepository.save(settlement);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to save settlement:', err);
      alert('Failed to save settlement.');
    }
  };

  const isFromMe = fromPerson.isUser;
  const isToMe = toPerson.isUser;
  
  let headerText = 'Settle Debt';
  if (isFromMe) headerText = `Pay ${toPerson.name}`;
  if (isToMe) headerText = `Receive from ${fromPerson.name}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <SoftCard className="w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">{headerText}</h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Amount to Settle ({baseCurrency})</label>
            <input 
              type="number"
              step="any"
              {...register('settledAmount')}
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner font-black text-xl"
            />
            {errors.settledAmount && <p className="text-xs text-destructive mt-1">{errors.settledAmount.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-1">
              <WalletIcon className="w-4 h-4" /> Pay from Wallet (Optional)
            </label>
            <select 
              {...register('walletId')}
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
            >
              <option value="">No Wallet (Cash/External)</option>
              {applicableWallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.balance.format()})</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">If selected, the balance will be deducted from this wallet.</p>
          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Settlement'}
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
