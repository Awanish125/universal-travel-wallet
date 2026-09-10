'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, FileText, Info, User, Users, Wallet as WalletIcon } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { expenseRepository } from '../../../../infrastructure/repositories/expense-repository';
import { Expense } from '../../../../domain/entities/expense';
import { Money } from '../../../../domain/financial/money';
import { calculateEqualSplits } from '../../../../domain/financial/splits';
import { CompositeRateManager } from '../../../../infrastructure/rates/composite-manager';
import { OpenCurrencyProvider } from '../../../../infrastructure/rates/open-currency-provider';

import { SoftCard } from '../../../../components/common/SoftCard';
import { SoftButton } from '../../../../components/common/SoftButton';
import { CurrencySelect } from '../../../../components/common/CurrencySelect';
import { SearchableSelect } from '../../../../components/common/SearchableSelect';
import { SegmentedControl } from '../../../../components/common/SegmentedControl';
import { PeoplePicker } from '../../../../components/participants/PeoplePicker';
import { BillChipsInput } from '../../../../components/expenses/BillChipsInput';
import { AddParticipantModal } from '../../../../components/participants/AddParticipantModal';
import { AddCategoryModal } from '../../../../components/categories/AddCategoryModal';
import { CreateWalletModal } from '../../../../components/wallets/CreateWalletModal';
import { ParticipantMapper } from '../../../../infrastructure/mappers/participant-mapper';
import { CategoryMapper } from '../../../../infrastructure/mappers/category-mapper';
import { WalletMapper } from '../../../../infrastructure/mappers/wallet-mapper';
import { currencyBadge, formatMoney } from '../../../../lib/currency-format';
import { newId } from '../../../../lib/id';

const rateManager = new CompositeRateManager(new OpenCurrencyProvider());

/** Point 15 payment methods, in plain words. */
const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'UPI', label: 'UPI' },
  { value: 'BANK', label: 'Bank transfer' },
  { value: 'OTHER', label: 'Other' },
];

const expenseSchema = z
  .object({
    amount: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Enter an amount above zero'),
    currency: z.string().length(3, 'Pick a currency'),
    payerId: z.string().min(1, 'Choose who paid'),
    categoryId: z.string().min(1, 'Choose a category'),
    paymentMethod: z.string().min(1),
    walletId: z.string().optional(),
    note: z.string().max(100).optional(),
    isShared: z.boolean(),
    sharedWith: z.array(z.string()),
  })
  .refine((data) => !data.isShared || data.sharedWith.length > 0, {
    message: 'Pick at least one person to split with',
    path: ['sharedWith'],
  });

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const inputClasses =
  'field-surface';

export default function AddExpensePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // The bargaining calculator hands a negotiated price over through the URL
  // (Point 40). Nothing is saved until the user confirms it here.
  const searchParams = useSearchParams();
  const prefill = {
    amount: searchParams.get('amount') ?? '',
    currency: searchParams.get('currency') ?? '',
    category: searchParams.get('category') ?? '',
  };

  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawParticipants = useLiveQuery(
    () => db.participants.where('tripId').equals(params.id).toArray(),
    [params.id]
  );
  const rawCategories = useLiveQuery(() => db.categories.toArray());
  const rawWallets = useLiveQuery(
    () => db.wallets.where('tripId').equals(params.id).toArray(),
    [params.id]
  );

  // Inline creation sheets, so no step of this form sends the user elsewhere.
  const [personSheet, setPersonSheet] = useState<{ open: boolean; name: string; target: 'payer' | 'split' }>(
    { open: false, name: '', target: 'payer' }
  );
  const [categorySheetName, setCategorySheetName] = useState<string | null>(null);
  const [walletSheetName, setWalletSheetName] = useState<string | null>(null);

  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      currency: '',
      payerId: '',
      categoryId: '',
      paymentMethod: 'CASH',
      walletId: '',
      note: '',
      isShared: false,
      sharedWith: [],
    },
  });

  const currency = useWatch({ control, name: 'currency' });
  const amount = useWatch({ control, name: 'amount' });
  const isShared = useWatch({ control, name: 'isShared' });
  const sharedWith = useWatch({ control, name: 'sharedWith' });
  const walletId = useWatch({ control, name: 'walletId' });

  // Fill the defaults the app already knows: the trip's spending currency and
  // the traveller as the payer. Runs once, then leaves the form alone.
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  useEffect(() => {
    if (defaultsApplied || !trip || !rawParticipants) return;
    setDefaultsApplied(true);

    setValue('currency', prefill.currency || trip.localCurrency || trip.baseCurrency);
    if (prefill.amount) setValue('amount', prefill.amount);
    if (prefill.category) setValue('categoryId', prefill.category);
    const me = rawParticipants.find((p) => p.isUser) ?? rawParticipants[0];
    if (me) {
      setValue('payerId', me.id);
      setValue('sharedWith', [me.id]);
    }
    // `prefill` is read once, on the first render after the trip loads, so it
    // deliberately stays out of the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultsApplied, trip, rawParticipants, setValue]);

  // A wallet carries its own currency, so selecting one must not leave the
  // expense recorded in a different one.
  useEffect(() => {
    if (!walletId || !rawWallets) return;
    const wallet = rawWallets.find((w) => w.id === walletId);
    if (wallet && wallet.currency !== getValues('currency')) {
      setValue('currency', wallet.currency);
    }
  }, [walletId, rawWallets, setValue, getValues]);

  const participants = useMemo(
    () => (rawParticipants ?? []).map(ParticipantMapper.toDomain),
    [rawParticipants]
  );
  const categories = useMemo(
    () => (rawCategories ?? []).map(CategoryMapper.toDomain),
    [rawCategories]
  );
  const wallets = useMemo(() => (rawWallets ?? []).map(WalletMapper.toDomain), [rawWallets]);

  const applicableWallets = useMemo(
    () => wallets.filter((w) => w.balance.currency === currency),
    [wallets, currency]
  );

  /** Live preview of each person's share, so the split is never a surprise. */
  const sharePreview = useMemo(() => {
    const numericAmount = Number(amount);
    if (!isShared || !currency || !numericAmount || sharedWith.length === 0) return null;
    const shares = calculateEqualSplits(Money.fromDecimal(amount, currency), sharedWith);
    return formatMoney(shares[0].amount);
  }, [isShared, amount, currency, sharedWith]);

  if (!trip || !rawParticipants || !rawCategories || !rawWallets) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
    );
  }

  const onSubmit = async (data: ExpenseFormValues) => {
    setSaveError(null);
    try {
      const rate = await rateManager.getRate(data.currency, trip.baseCurrency);

      const originalAmount = Money.fromDecimal(data.amount, data.currency);
      const converted = originalAmount.multiply(rate);
      const baseAmount = Money.fromDecimal(converted.toDecimalString(), trip.baseCurrency);

      // A personal expense creates no group obligation (Point 12); a shared one
      // splits only across the people actually chosen (Point 13).
      const splitParticipants = data.isShared ? data.sharedWith : [data.payerId];
      // calculateEqualSplits distributes the rounding remainder to the payer,
      // so the shares always add back up to the exact total (Point 94).
      const splits = calculateEqualSplits(originalAmount, splitParticipants, data.payerId);

      const newExpense = new Expense({
        id: newId(),
        tripId: trip.id,
        payerId: data.payerId,
        originalAmount,
        baseAmount,
        exchangeRate: rate.toString(),
        category: data.categoryId,
        paymentMethod: data.walletId ? 'WALLET' : data.paymentMethod,
        walletId: data.walletId || undefined,
        isShared: data.isShared,
        splitMethod: 'EQUAL',
        splits,
        note: data.note,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      await expenseRepository.save(newExpense);
      router.push(`/trips/${trip.id}`);
    } catch (error) {
      console.error('Failed to save expense', error);
      setSaveError(
        'This expense could not be saved. Check the wallet has enough balance and try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <AddParticipantModal
        tripId={trip.id}
        isOpen={personSheet.open}
        initialName={personSheet.name}
        onClose={() => setPersonSheet((s) => ({ ...s, open: false }))}
        onCreated={(participantId) => {
          if (personSheet.target === 'payer') {
            setValue('payerId', participantId, { shouldValidate: true });
          } else {
            setValue('sharedWith', [...getValues('sharedWith'), participantId], {
              shouldValidate: true,
            });
          }
        }}
      />

      <AddCategoryModal
        isOpen={categorySheetName !== null}
        initialName={categorySheetName ?? ''}
        onClose={() => setCategorySheetName(null)}
        onCreated={(categoryId) => setValue('categoryId', categoryId, { shouldValidate: true })}
      />

      <CreateWalletModal
        tripId={trip.id}
        isOpen={walletSheetName !== null}
        initialName={walletSheetName || ''}
        defaultCurrency={currency || trip.localCurrency}
        onClose={() => setWalletSheetName(null)}
        onCreated={(newWalletId) => setValue('walletId', newWalletId)}
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
              Add expense
            </h1>
            <p className="truncate text-xs text-muted-foreground">{trip.name}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-4 max-w-2xl px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <SoftCard className="flex flex-col gap-4 p-5">
            <div>
              <label htmlFor="expense-amount" className="mb-1 block text-sm font-bold text-foreground">
                How much?
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-muted-foreground">
                  {currency ? currencyBadge(currency).split(' ')[0] : ''}
                </span>
                <input
                  id="expense-amount"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  {...register('amount')}
                  placeholder="0.00"
                  aria-invalid={errors.amount ? true : undefined}
                  className="financial-num w-full bg-transparent text-4xl font-black tracking-tighter text-foreground outline-none placeholder:text-muted-foreground/40"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>
              )}

              <BillChipsInput
                currency={currency || trip.localCurrency}
                onAddAmount={(addValue) => {
                  const current = Number(getValues('amount')) || 0;
                  setValue('amount', String(current + addValue), { shouldValidate: true });
                }}
              />
            </div>

            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <CurrencySelect
                  label="Money used"
                  hint={
                    field.value === trip.localCurrency
                      ? '— the local money on this trip'
                      : field.value === trip.baseCurrency
                        ? '— your home money'
                        : undefined
                  }
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.currency?.message}
                />
              )}
            />
          </SoftCard>

          <SoftCard className="space-y-4 p-5">
            <Controller
              name="isShared"
              control={control}
              render={({ field }) => (
                <SegmentedControl
                  label="Who is this for?"
                  value={field.value ? 'shared' : 'personal'}
                  onChange={(next) => field.onChange(next === 'shared')}
                  options={[
                    { value: 'personal', label: 'Just me', icon: User },
                    { value: 'shared', label: 'Split with others', icon: Users },
                  ]}
                />
              )}
            />

            <Controller
              name="payerId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Who paid?"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.payerId?.message}
                  placeholder="Choose a person"
                  searchPlaceholder="Search people..."
                  options={participants.map((p) => ({
                    value: p.id,
                    label: p.isUser ? `${p.name} (you)` : p.name,
                  }))}
                  onCreate={(typedName) =>
                    setPersonSheet({ open: true, name: typedName, target: 'payer' })
                  }
                  createLabel="Add person"
                />
              )}
            />

            {isShared && (
              <Controller
                name="sharedWith"
                control={control}
                render={({ field }) => (
                  <PeoplePicker
                    label="Split between"
                    people={participants}
                    selectedIds={field.value}
                    onChange={field.onChange}
                    onAddPerson={() =>
                      setPersonSheet({ open: true, name: '', target: 'split' })
                    }
                    error={errors.sharedWith?.message}
                  />
                )}
              />
            )}

            {sharePreview && (
              <p className="flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-sm text-foreground">
                <Info className="h-4 w-4 shrink-0 text-brand-accent" />
                {sharedWith.length === 1 ? (
                  <>
                    One share of{' '}
                    <span className="financial-num font-bold">{sharePreview}</span>
                  </>
                ) : (
                  <>
                    Split {sharedWith.length} ways —{' '}
                    <span className="financial-num font-bold">{sharePreview}</span> each
                  </>
                )}
              </p>
            )}
          </SoftCard>

          <SoftCard className="space-y-4 p-5">
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="What was it for?"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                  placeholder="Choose a category"
                  searchPlaceholder="Search categories..."
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  onCreate={(typedName) => setCategorySheetName(typedName)}
                  createLabel="Add category"
                />
              )}
            />

            <Controller
              name="walletId"
              control={control}
              render={({ field }) => (
                <SearchableSelect
                  label="Paid from"
                  hint="— optional"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  searchPlaceholder="Search wallets..."
                  placeholder="Not from a wallet"
                  options={[
                    { value: '', label: 'Not from a wallet', description: 'Nothing is deducted' },
                    ...applicableWallets.map((w) => ({
                      value: w.id,
                      label: w.name,
                      description: `${w.type.toLowerCase()} · ${formatMoney(w.balance)}`,
                    })),
                  ]}
                  onCreate={(typedName) => setWalletSheetName(typedName)}
                  createLabel="Create wallet"
                />
              )}
            />

            {!walletId && (
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <SearchableSelect
                    label="How did you pay?"
                    value={field.value}
                    onChange={field.onChange}
                    options={PAYMENT_METHODS}
                  />
                )}
              />
            )}

            {applicableWallets.length === 0 && currency && (
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <WalletIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                No {currency} wallet yet — use “Create wallet” above to add one without
                leaving this page.
              </p>
            )}

            <div className="space-y-1">
              <label
                htmlFor="expense-note"
                className="flex items-center gap-1 text-sm font-medium text-foreground"
              >
                <FileText className="h-4 w-4" /> Note
                <span className="font-normal text-muted-foreground">— optional</span>
              </label>
              <input
                id="expense-note"
                {...register('note')}
                placeholder="What was this for?"
                className={inputClasses}
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
            {isSubmitting ? 'Saving...' : 'Save expense'}
          </SoftButton>
        </form>
      </main>
    </div>
  );
}
