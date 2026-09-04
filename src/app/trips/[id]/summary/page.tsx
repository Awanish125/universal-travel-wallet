'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, PieChart, Wallet as WalletIcon, FileText, CheckCircle2, Award, Printer } from 'lucide-react';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { ExpenseMapper } from '../../../../infrastructure/mappers/expense-mapper';
import { CategoryMapper } from '../../../../infrastructure/mappers/category-mapper';
import { WalletMapper } from '../../../../infrastructure/mappers/wallet-mapper';
import { Money } from '../../../../domain/financial/money';

import { SoftCard } from '../../../../components/common/SoftCard';
import { SoftButton } from '../../../../components/common/SoftButton';

export default function TripSummaryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawExpenses = useLiveQuery(() => db.expenses.where('tripId').equals(params.id).toArray(), [params.id]);
  const rawCategories = useLiveQuery(() => db.categories.toArray());
  const rawWallets = useLiveQuery(() => db.wallets.where('tripId').equals(params.id).toArray(), [params.id]);
  const rawBudgets = useLiveQuery(() => db.budgets.where('tripId').equals(params.id).toArray(), [params.id]);
  const rawExchanges = useLiveQuery(() => db.exchanges.where('tripId').equals(params.id).toArray(), [params.id]);

  if (!trip || !rawExpenses || !rawCategories || !rawWallets || !rawBudgets || !rawExchanges) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Generating Trip Report...</div>;
  }

  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  const categories = rawCategories.map(CategoryMapper.toDomain);
  const wallets = rawWallets.map(WalletMapper.toDomain);
  const baseCurrency = trip.baseCurrency;

  // 1. Total Spent
  const totalSpent = expenses.reduce(
    (sum, exp) => sum.add(exp.baseAmount), 
    Money.zero(baseCurrency)
  );

  // 2. Daily Average
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const diffTime = Math.max(1, Math.abs(endDate.getTime() - startDate.getTime()));
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const dailyAverage = totalSpent.divide(days);

  // 3. Category Breakdown
  const categoryTotals: Record<string, Money> = {};
  for (const exp of expenses) {
    const catId = exp.category;
    if (!categoryTotals[catId]) {
      categoryTotals[catId] = Money.zero(baseCurrency);
    }
    categoryTotals[catId] = categoryTotals[catId].add(exp.baseAmount);
  }

  // 4. Budget Status
  const budgetRecord = rawBudgets.find(b => b.categoryId === 'OVERALL');
  const budget = budgetRecord ? Money.fromDecimal(budgetRecord.amount, baseCurrency) : null;
  const isWithinBudget = budget ? totalSpent.isLessThan(budget) || totalSpent.equals(budget) : true;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background pb-20 print:bg-white print:text-black">
      {/* Header (Hidden on print) */}
      <header className="px-4 py-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-border/50 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Trip Summary Report</h1>
          </div>
          <button 
            onClick={handlePrint}
            className="p-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-2xl mx-auto mt-2">
        {/* Title Card */}
        <SoftCard className="p-6 text-center space-y-2 border-t-4 border-t-brand-accent">
          <h2 className="text-3xl font-black tracking-tight text-foreground">{trip.name}</h2>
          <p className="text-sm text-brand-accent font-bold">
            {trip.country} • {trip.startDate} to {trip.endDate} ({days} days)
          </p>
          <div className="pt-4 flex justify-center gap-8 border-t border-border/40 mt-4">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Total Spent</span>
              <span className="text-2xl font-black text-foreground">{totalSpent.format()}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Daily Average</span>
              <span className="text-2xl font-black text-foreground">{dailyAverage.format()}</span>
            </div>
          </div>
        </SoftCard>

        {/* Budget Performance */}
        {budget && (
          <SoftCard className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWithinBudget ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Budget Performance</h3>
                <p className="text-xs text-muted-foreground">Target: {budget.format()}</p>
              </div>
            </div>
            <span className={`text-sm font-black ${isWithinBudget ? 'text-emerald-600' : 'text-destructive'}`}>
              {isWithinBudget ? 'Under Budget' : 'Over Budget'}
            </span>
          </SoftCard>
        )}

        {/* Category Breakdown */}
        <SoftCard className="p-5">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-brand-accent" /> Category Expenses
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([catId, amount]) => {
              const category = categories.find(c => c.id === catId);
              const percentage = Math.round((amount.toNumber() / totalSpent.toNumber()) * 100) || 0;
              return (
                <div key={catId} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-foreground">{category?.name || 'Other'}</span>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{amount.format()}</span>
                    <span className="text-xs text-muted-foreground ml-2">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </SoftCard>

        {/* Remaining Wallet Balances */}
        <SoftCard className="p-5">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-brand-accent" /> Final Wallet Balances
          </h3>
          <div className="space-y-3">
            {wallets.map(w => (
              <div key={w.id} className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">{w.name} ({w.type})</span>
                <span className="font-black text-foreground">{w.balance.format()}</span>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* Exchanges Summary */}
        <SoftCard className="p-5">
          <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-accent" /> Exchanges Conducted
          </h3>
          <p className="text-sm font-bold text-foreground">{rawExchanges.length} Currency Exchanges Recorded</p>
        </SoftCard>

        <div className="print:hidden pt-4">
          <SoftButton 
            variant="primary" 
            onClick={handlePrint}
            className="w-full py-4 text-base font-bold bg-brand-accent shadow-soft-accent flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" /> Export / Print Report
          </SoftButton>
        </div>
      </main>
    </div>
  );
}
