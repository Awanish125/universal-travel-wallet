'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { walletRepository } from '../../infrastructure/repositories/wallet-repository';
import { Wallet, WalletType } from '../../domain/entities/wallet';
import { Money } from '../../domain/financial/money';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { CurrencySelect } from '../common/CurrencySelect';
import { SearchableSelect } from '../common/SearchableSelect';
import { newId } from '../../lib/id';

const WALLET_TYPES = [
  { value: 'CASH', label: 'Cash', description: 'Notes and coins in your pocket' },
  { value: 'CARD', label: 'Card', description: 'Debit or credit card' },
  { value: 'BANK', label: 'Bank', description: 'Bank account balance' },
  { value: 'UPI', label: 'UPI', description: 'UPI or mobile payments' },
  { value: 'OTHER', label: 'Other', description: 'Anything else' },
];

const walletSchema = z.object({
  name: z.string().min(1, 'Give the wallet a name').max(30),
  type: z.enum(['CASH', 'BANK', 'CARD', 'UPI', 'OTHER'] as const),
  currency: z.string().length(3, 'Pick a currency'),
  balance: z.string().refine((val) => !isNaN(Number(val)), { message: 'Enter a number' }),
});

type WalletFormValues = z.infer<typeof walletSchema>;

interface Props {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: string;
  /** Prefills the name — used when the user typed it into a picker's search. */
  initialName?: string;
  /** Receives the new wallet's id so the caller can select it right away. */
  onCreated?: (walletId: string) => void;
}

export function CreateWalletModal({
  tripId,
  isOpen,
  onClose,
  defaultCurrency = 'USD',
  initialName = '',
  onCreated,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: initialName,
      type: 'CASH',
      currency: defaultCurrency,
      balance: '0',
    },
  });

  // The sheet stays mounted between openings, so its defaults are re-applied
  // each time it opens — otherwise a stale currency would be shown.
  useEffect(() => {
    if (isOpen) {
      reset({ name: initialName, type: 'CASH', currency: defaultCurrency, balance: '0' });
    }
  }, [isOpen, initialName, defaultCurrency, reset]);

  const onSubmit = async (data: WalletFormValues) => {
    try {
      const newWallet = new Wallet({
        id: newId(),
        tripId,
        name: data.name,
        type: data.type as WalletType,
        currency: data.currency,
        balance: Money.fromDecimal(data.balance, data.currency),
        createdAt: new Date().toISOString(),
      });

      await walletRepository.save(newWallet);
      onCreated?.(newWallet.id);
      onClose();
    } catch (err) {
      console.error('Failed to save wallet:', err);
      window.alert('That wallet could not be saved. Please try again.');
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Add a wallet"
      description="Track cash, a card or a bank balance for this trip."
      footer={
        <SoftButton
          type="submit"
          form="create-wallet-form"
          variant="primary"
          disabled={isSubmitting}
          className="w-full py-4 text-base"
        >
          {isSubmitting ? 'Saving...' : 'Save wallet'}
        </SoftButton>
      }
    >
      <form id="create-wallet-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="wallet-name" className="text-sm font-medium text-foreground">
            Wallet name
          </label>
          <input
            id="wallet-name"
            {...register('name')}
            placeholder="e.g. Travel cash"
            aria-invalid={errors.name ? true : undefined}
            className="field-surface"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              label="Type"
              value={field.value}
              onChange={field.onChange}
              options={WALLET_TYPES}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="currency"
          control={control}
          render={({ field }) => (
            <CurrencySelect
              label="Money in this wallet"
              value={field.value}
              onChange={field.onChange}
              error={errors.currency?.message}
            />
          )}
        />

        <div className="space-y-1">
          <label htmlFor="wallet-balance" className="text-sm font-medium text-foreground">
            Starting balance
          </label>
          <input
            id="wallet-balance"
            type="number"
            inputMode="decimal"
            step="any"
            {...register('balance')}
            className="field-surface financial-num"
          />
          {errors.balance && <p className="text-xs text-destructive">{errors.balance.message}</p>}
        </div>
      </form>
    </Sheet>
  );
}
