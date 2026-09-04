'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { walletRepository } from '../../infrastructure/repositories/wallet-repository';
import { Wallet, WalletType } from '../../domain/entities/wallet';
import { Money } from '../../domain/financial/money';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { CurrencySelect } from '../common/CurrencySelect';

const walletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required').max(30),
  type: z.enum(['CASH', 'BANK', 'CARD', 'UPI', 'OTHER'] as const),
  currency: z.string().length(3, 'Currency code must be 3 letters'),
  balance: z.string().refine((val) => !isNaN(Number(val)), { message: 'Must be a valid number' }),
});

type WalletFormValues = z.infer<typeof walletSchema>;

interface Props {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
  defaultCurrency?: string;
}

export function CreateWalletModal({ tripId, isOpen, onClose, defaultCurrency = 'USD' }: Props) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: '',
      type: 'CASH',
      currency: defaultCurrency,
      balance: '0',
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: WalletFormValues) => {
    try {
      const newWallet = new Wallet({
        id: crypto.randomUUID(),
        tripId,
        name: data.name,
        type: data.type as WalletType,
        currency: data.currency,
        balance: Money.fromDecimal(data.balance, data.currency),
        createdAt: new Date().toISOString(),
      });

      await walletRepository.save(newWallet);
      reset();
      onClose();
    } catch (err) {
      console.error('Failed to save wallet:', err);
      alert('Failed to save wallet.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <SoftCard className="w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">Add Wallet</h2>
          <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Wallet Name</label>
            <input 
              {...register('name')}
              placeholder="e.g. Travel Cash"
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select 
                {...register('type')}
                className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK">Bank</option>
                <option value="UPI">UPI</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.type && <p className="text-xs text-destructive mt-1">{errors.type.message}</p>}
            </div>

            <div className="space-y-1">
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
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Starting Balance</label>
            <input 
              type="number"
              step="any"
              {...register('balance')}
              className="w-full bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-3 outline-none transition-colors shadow-soft-inner"
            />
            {errors.balance && <p className="text-xs text-destructive mt-1">{errors.balance.message}</p>}
          </div>

          <div className="pt-4">
            <SoftButton 
              type="submit" 
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent"
            >
              {isSubmitting ? 'Saving...' : 'Save Wallet'}
            </SoftButton>
          </div>
        </form>
      </SoftCard>
    </div>
  );
}
