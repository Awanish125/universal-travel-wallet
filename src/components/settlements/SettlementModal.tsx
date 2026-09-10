'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet as WalletIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { settlementRepository } from '../../infrastructure/repositories/settlement-repository';
import { Settlement } from '../../domain/entities/settlement';
import { Money } from '../../domain/financial/money';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { SearchableSelect } from '../common/SearchableSelect';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import { WalletMapper } from '../../infrastructure/mappers/wallet-mapper';
import { formatMoney } from '../../lib/currency-format';
import { newId } from '../../lib/id';

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
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<SettleFormValues>({
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
        id: newId(),
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
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={headerText}
      description={`Settling in ${baseCurrency}. The original expenses are never changed.`}
      footer={
        <SoftButton
          type="submit"
          form="settlement-form"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-4 text-base"
        >
          {isSubmitting ? 'Processing...' : 'Confirm settlement'}
        </SoftButton>
      }
    >
      <form id="settlement-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="settle-amount" className="text-sm font-medium text-foreground">
            How much is changing hands?
          </label>
          <div className="field-focus-ring">
            <input
              id="settle-amount"
              type="number"
              inputMode="decimal"
              step="any"
              {...register('settledAmount')}
              aria-invalid={errors.settledAmount ? true : undefined}
              className="field-surface financial-num text-xl font-black"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Owed: {formatMoney(originalBalance)}. Pay less to settle part of it now.
          </p>
          {errors.settledAmount && (
            <p className="text-xs text-destructive">{errors.settledAmount.message}</p>
          )}
        </div>

        <Controller
          name="walletId"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              label="Paid from"
              hint="— optional"
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Not from a wallet"
              options={[
                {
                  value: '',
                  label: 'Not from a wallet',
                  description: 'Marked paid, nothing deducted',
                },
                ...applicableWallets.map((w) => ({
                  value: w.id,
                  label: w.name,
                  description: formatMoney(w.balance),
                })),
              ]}
            />
          )}
        />

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <WalletIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Choosing a wallet deducts the amount from it.
        </p>
      </form>
    </Sheet>
  );
}
