'use client';

import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { walletRepository } from '../../infrastructure/repositories/wallet-repository';
import { Money } from '../../domain/financial/money';
import { parseShorthandAmount } from '../../domain/financial/shorthand';
import { Wallet } from '../../domain/entities/wallet';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { SegmentedControl } from '../common/SegmentedControl';
import { currencySymbol, formatMoney, formatAmount } from '../../lib/currency-format';

interface Props {
  wallet: Wallet | null;
  isOpen: boolean;
  onClose: () => void;
  /** Called after the wallet is deleted, so the caller can close and refresh. */
  onDeleted?: () => void;
}

type Direction = 'ADD' | 'TAKE';

/**
 * Point 9's missing "Adjust balance" action. Until this existed, the only way
 * to put money into a wallet was to record a full currency exchange — every
 * wallet card was tappable (`SoftCard interactive`) but had no `onClick`, so
 * tapping one did nothing. This is what that tap now opens.
 */
export function WalletDetailSheet({ wallet, isOpen, onClose, onDeleted }: Props) {
  const [direction, setDirection] = useState<Direction>('ADD');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form each time a (possibly different) wallet is opened, rather
  // than leaving the previous wallet's typed amount sitting in the field.
  useEffect(() => {
    if (isOpen) {
      setDirection('ADD');
      setAmount('');
      setNote('');
      setError(null);
    }
  }, [isOpen, wallet?.id]);

  if (!wallet) return null;

  const numericAmount = Number(parseShorthandAmount(amount || '')) || 0;
  const signedAmount = direction === 'ADD' ? numericAmount : -numericAmount;
  const resultingBalance = wallet.balance.toNumber() + signedAmount;
  const canSave = numericAmount > 0 && (direction === 'ADD' || resultingBalance >= 0);

  async function handleSave() {
    if (!wallet || !canSave) return;
    setIsSaving(true);
    setError(null);
    try {
      await walletRepository.adjustBalance(
        wallet.id,
        Money.fromDecimal(signedAmount, wallet.currency),
        note || undefined
      );
      onClose();
    } catch (err) {
      console.error('Failed to adjust wallet balance:', err);
      setError('Could not save that. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!wallet) return;
    const confirmed = window.confirm(
      `Delete "${wallet.name}"? Its balance and history go with it — expenses or exchanges that used it keep their own amounts, they just won't show a wallet any more.`
    );
    if (!confirmed) return;
    await walletRepository.delete(wallet.id);
    onDeleted?.();
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={wallet.name}
      description={`${wallet.type.charAt(0)}${wallet.type.slice(1).toLowerCase()} · Currently ${formatMoney(wallet.balance)}`}
      footer={
        <SoftButton
          type="button"
          variant="primary"
          disabled={!canSave || isSaving}
          onClick={handleSave}
          className="w-full py-4 text-base"
        >
          {isSaving
            ? 'Saving...'
            : numericAmount > 0
              ? `${direction === 'ADD' ? 'Add' : 'Take out'} ${formatAmount(numericAmount, wallet.currency)}`
              : direction === 'ADD'
                ? 'Add money'
                : 'Take money out'}
        </SoftButton>
      }
    >
      <div className="space-y-4">
        <SegmentedControl
          label="What happened"
          value={direction}
          onChange={(v) => setDirection(v as Direction)}
          options={[
            { value: 'ADD', label: 'Add money' },
            { value: 'TAKE', label: 'Take money out' },
          ]}
        />

        <div>
          <label htmlFor="wallet-adjust-amount" className="sr-only">
            Amount
          </label>
          <div className="flex items-baseline gap-2 rounded-2xl bg-background p-4 shadow-soft-inner">
            <span className="text-xl font-bold text-muted-foreground">
              {currencySymbol(wallet.currency)}
            </span>
            <input
              id="wallet-adjust-amount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0 or 100K"
              className="financial-num w-full bg-transparent text-2xl font-black text-foreground outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          {!canSave && direction === 'TAKE' && numericAmount > 0 && (
            <p className="mt-1 text-xs text-destructive">
              That&apos;s more than the wallet holds ({formatMoney(wallet.balance)}).
            </p>
          )}
          {numericAmount > 0 && canSave && (
            <p className="mt-1 text-xs text-muted-foreground">
              New balance: {formatAmount(resultingBalance, wallet.currency)}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label htmlFor="wallet-adjust-note" className="text-sm font-medium text-foreground">
            Note <span className="font-normal text-muted-foreground">— optional</span>
          </label>
          <input
            id="wallet-adjust-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. ATM withdrawal"
            className="field-surface"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleDelete}
          className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" /> Delete this wallet
        </button>
      </div>
    </Sheet>
  );
}
