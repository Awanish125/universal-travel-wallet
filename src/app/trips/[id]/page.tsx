'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Calculator,
  FileText,
  Plus,
  Repeat2,
  Tags,
  Trash2,
  Wallet as WalletIcon,
} from 'lucide-react';
import { tripRepository } from '../../../infrastructure/repositories/trip-repository';
import { Trip } from '../../../domain/entities/trip';
import { SoftCard } from '../../../components/common/SoftCard';
import { SoftButton } from '../../../components/common/SoftButton';
import { WalletList } from '../../../components/wallets/WalletList';
import { CreateWalletModal } from '../../../components/wallets/CreateWalletModal';
import { ParticipantList } from '../../../components/participants/ParticipantList';
import { AddParticipantModal } from '../../../components/participants/AddParticipantModal';
import { ExpenseList } from '../../../components/expenses/ExpenseList';
import { ParticipantBalancesList } from '../../../components/participants/ParticipantBalancesList';
import { BudgetProgressCard } from '../../../components/dashboard/BudgetProgressCard';
import { MiniAnalyticsCard } from '../../../components/dashboard/MiniAnalyticsCard';
import { DeleteTripDialog } from '../../../components/trips/DeleteTripDialog';
import { CurrencyAmount } from '../../../components/common/CurrencyAmount';
import { useTripMetrics } from '../../../hooks/useTripMetrics';
import { ThemeToggle } from '../../../components/common/ThemeToggle';
import { currencyBadge } from '../../../lib/currency-format';

export default function TripDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadTrip() {
      try {
        const data = await tripRepository.findById(params.id);
        if (!active) return;
        if (data) setTrip(data);
        else router.replace('/trips');
      } catch (err) {
        console.error('Failed to load trip', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTrip();
    return () => {
      active = false;
    };
  }, [params.id, router]);

  const metrics = useTripMetrics(trip?.id || '', trip?.baseCurrency || 'USD');

  if (loading || metrics.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="animate-pulse text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <CreateWalletModal
          tripId={trip.id}
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          defaultCurrency={trip.localCurrency}
        />
        <AddParticipantModal
          tripId={trip.id}
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
        />
        <DeleteTripDialog
          isOpen={isDeleteOpen}
          tripId={trip.id}
          tripName={trip.name}
          onClose={() => setIsDeleteOpen(false)}
          onDeleted={() => router.replace('/trips')}
        />

        <header className="border-b border-border py-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.push('/trips')}
              aria-label="Back to all trips"
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-strong"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-1">
              <HeaderAction
                icon={BarChart3}
                label="Charts"
                onClick={() => router.push(`/trips/${trip.id}/analytics`)}
              />
              <HeaderAction
                icon={FileText}
                label="Report"
                onClick={() => router.push(`/trips/${trip.id}/summary`)}
              />
              <HeaderAction
                icon={Tags}
                label="Categories"
                onClick={() => router.push(`/trips/${trip.id}/categories`)}
              />
              <HeaderAction
                icon={Trash2}
                label="Delete trip"
                destructive
                onClick={() => setIsDeleteOpen(true)}
              />
              <span className="md:hidden">
                <ThemeToggle />
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-foreground">{trip.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-bold text-brand-accent">{trip.country}</span>
            <span aria-hidden>·</span>
            <span>
              You count in{' '}
              <span className="font-bold text-foreground">{currencyBadge(trip.baseCurrency)}</span>
            </span>
            <span aria-hidden>·</span>
            <span>
              You spend in{' '}
              <span className="font-bold text-foreground">{currencyBadge(trip.localCurrency)}</span>
            </span>
          </p>
        </header>

        <main className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SoftCard className="relative flex flex-col items-center justify-center gap-2 overflow-hidden py-8 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Spent so far
              </span>
              <CurrencyAmount
                money={metrics.totalSpent}
                animate
                className="text-4xl font-black tracking-tighter text-foreground sm:text-5xl"
                symbolClassName="text-2xl"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {metrics.expenseCount === 0
                  ? 'No expenses yet'
                  : `${metrics.expenseCount} expense${metrics.expenseCount === 1 ? '' : 's'} recorded`}
              </p>
            </SoftCard>

            <div>
              <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-foreground">
                Quick actions
              </h2>
              <div className="grid grid-cols-4 gap-3">
                <QuickAction
                  icon={Plus}
                  label="Expense"
                  onClick={() => router.push(`/trips/${trip.id}/expense`)}
                />
                <QuickAction
                  icon={Repeat2}
                  label="Change money"
                  onClick={() => router.push(`/trips/${trip.id}/exchange`)}
                />
                <QuickAction
                  icon={WalletIcon}
                  label="Wallet"
                  onClick={() => setIsWalletModalOpen(true)}
                />
                <QuickAction
                  icon={Calculator}
                  label="Bargain"
                  onClick={() => router.push('/calculator')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SoftCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">My wallets</h3>
                  <SoftButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsWalletModalOpen(true)}
                    className="text-brand-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </SoftButton>
                </div>
                <WalletList tripId={trip.id} />
              </SoftCard>

              <SoftCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-bold text-foreground">Recent expenses</h3>
                  <SoftButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/trips/${trip.id}/expense`)}
                    className="text-brand-accent"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </SoftButton>
                </div>
                <ExpenseList tripId={trip.id} />
              </SoftCard>
            </div>
          </div>

          <div className="space-y-6">
            <BudgetProgressCard
              tripId={trip.id}
              baseCurrency={trip.baseCurrency}
              totalSpent={metrics.totalSpent}
            />

            <MiniAnalyticsCard tripId={trip.id} baseCurrency={trip.baseCurrency} />

            <SoftCard className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Who&apos;s with you</h3>
                <SoftButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsParticipantModalOpen(true)}
                  className="text-brand-accent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </SoftButton>
              </div>
              <ParticipantList tripId={trip.id} />
            </SoftCard>

            <SoftCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-foreground">Who owes whom</h3>
              <ParticipantBalancesList tripId={trip.id} baseCurrency={trip.baseCurrency} />
            </SoftCard>
          </div>
        </main>
      </div>
    </div>
  );
}

function HeaderAction({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface-strong ${
        destructive ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <SoftButton
        variant="secondary"
        onClick={onClick}
        aria-label={label}
        className="h-14 w-14 rounded-2xl p-0"
      >
        <Icon className="h-6 w-6" />
      </SoftButton>
      <span className="text-center text-[11px] font-semibold leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
