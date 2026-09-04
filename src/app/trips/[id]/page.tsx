'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Wallet as WalletIcon, Repeat2, Calculator, Settings, FileText, BarChart3 } from 'lucide-react';
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
import { useTripMetrics } from '../../../hooks/useTripMetrics';
import { AnimatedNumber } from '../../../components/common/AnimatedNumber';

import { ThemeToggle } from '../../../components/common/ThemeToggle';

export default function TripDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      try {
        const data = await tripRepository.findById(params.id);
        if (data) {
          setTrip(data);
        } else {
          router.replace('/trips');
        }
      } catch (err) {
        console.error('Failed to load trip', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrip();
  }, [params.id, router]);

  const metrics = useTripMetrics(trip?.id || '', trip?.baseCurrency || 'USD');

  if (loading || metrics.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <CreateWalletModal 
          tripId={trip.id} 
          isOpen={isWalletModalOpen} 
          onClose={() => setIsWalletModalOpen(false)}
          defaultCurrency={trip.baseCurrency}
        />
        <AddParticipantModal
          tripId={trip.id}
          isOpen={isParticipantModalOpen}
          onClose={() => setIsParticipantModalOpen(false)}
        />

        {/* Header */}
        <header className="py-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => router.push('/trips')}
              className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => router.push(`/trips/${trip.id}/analytics`)}
                className="p-2 rounded-full text-foreground hover:bg-surface-strong transition-colors text-brand-accent"
                title="View Analytics"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => router.push(`/trips/${trip.id}/summary`)}
                className="p-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
                title="View Summary Report"
              >
                <FileText className="w-5 h-5" />
              </button>
              <div className="md:hidden">
                <ThemeToggle />
              </div>
              <button 
                onClick={() => router.push('/settings/backup')}
                className="p-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
                title="Backup & Restore"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">{trip.name}</h1>
            <p className="text-sm font-bold text-brand-accent flex items-center gap-1 mt-1">
              {trip.country} • Base: {trip.baseCurrency}
            </p>
          </div>
        </header>

        {/* Main Content Layout Grid */}
        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2 Cols on Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Metric - Total Spent */}
            <SoftCard className="p-6 flex flex-col items-center justify-center text-center space-y-2 py-8 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-accent to-purple-500 opacity-50"></div>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</span>
              <div className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground flex items-center gap-1">
                <span className="text-2xl text-muted-foreground font-bold">{metrics.totalSpent.currency}</span>
                <AnimatedNumber 
                  value={metrics.totalSpent.toNumber()} 
                  decimals={2}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{metrics.expenseCount} expenses tracked</p>
            </SoftCard>

            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 px-1 uppercase tracking-wider">Quick Actions</h2>
              <div className="grid grid-cols-4 gap-3">
                <ActionIcon icon={Plus} label="Expense" color="emerald" onClick={() => router.push(`/trips/${trip.id}/expense`)} />
                <ActionIcon icon={WalletIcon} label="Wallet" color="blue" onClick={() => setIsWalletModalOpen(true)} />
                <ActionIcon icon={Repeat2} label="Exchange" color="amber" onClick={() => router.push(`/trips/${trip.id}/exchange`)} />
                <ActionIcon icon={Calculator} label="Calculate" color="purple" onClick={() => router.push('/calculator')} />
              </div>
            </div>

            {/* Wallets & Expenses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SoftCard className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-foreground">My Wallets</h3>
                  <SoftButton 
                    variant="ghost" 
                    onClick={() => setIsWalletModalOpen(true)}
                    className="text-xs px-2 py-1 h-auto text-brand-accent hover:text-brand-accent"
                  >
                    + Add
                  </SoftButton>
                </div>
                <WalletList tripId={trip.id} />
              </SoftCard>
              <SoftCard className="p-5">
                <h3 className="text-base font-bold text-foreground mb-4">Recent Expenses</h3>
                <ExpenseList tripId={trip.id} />
              </SoftCard>
            </div>

          </div>

          {/* Sidebar Column (1 Col on Desktop) */}
          <div className="space-y-6">
            
            {/* Budget Progress & Alert */}
            <BudgetProgressCard 
              tripId={trip.id} 
              baseCurrency={trip.baseCurrency} 
              totalSpent={metrics.totalSpent} 
            />

            {/* Dynamic Category Spending Donut Preview */}
            <MiniAnalyticsCard 
              tripId={trip.id} 
              baseCurrency={trip.baseCurrency} 
            />

            {/* Participants Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-bold text-foreground">Companions</h3>
                <SoftButton 
                  variant="ghost" 
                  onClick={() => setIsParticipantModalOpen(true)}
                  className="text-xs px-2 py-1 h-auto text-brand-accent hover:text-brand-accent"
                >
                  + Add
                </SoftButton>
              </div>
              <ParticipantList tripId={trip.id} />
            </div>

            {/* Group Balances */}
            <SoftCard className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-foreground">Who owes whom?</h3>
              </div>
              <ParticipantBalancesList tripId={trip.id} baseCurrency={trip.baseCurrency} />
            </SoftCard>

          </div>

        </main>
      </div>
    </div>
  );
}

function ActionIcon({ icon: Icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  // Map our requested color to actual Tailwind classes for the clay effect
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  // Simplified version since GradientIconTile is complex, we just use a nice button
  return (
    <div className="flex flex-col items-center gap-2">
      <SoftButton 
        onClick={onClick}
        className="w-14 h-14 rounded-2xl flex items-center justify-center p-0"
      >
        <Icon className="w-6 h-6" />
      </SoftButton>
      <span className="text-[11px] font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
