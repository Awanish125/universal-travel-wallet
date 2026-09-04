'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, PieChart as PieIcon, TrendingUp, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, AreaChart, Area, XAxis, YAxis } from 'recharts';

import { db } from '../../../../infrastructure/db/dexie-db';
import { tripRepository } from '../../../../infrastructure/repositories/trip-repository';
import { ExpenseMapper } from '../../../../infrastructure/mappers/expense-mapper';
import { CategoryMapper } from '../../../../infrastructure/mappers/category-mapper';
import { Money } from '../../../../domain/financial/money';

import { SoftCard } from '../../../../components/common/SoftCard';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const trip = useLiveQuery(() => tripRepository.findById(params.id), [params.id]);
  const rawExpenses = useLiveQuery(() => db.expenses.where('tripId').equals(params.id).toArray(), [params.id]);
  const rawCategories = useLiveQuery(() => db.categories.toArray());

  if (!trip || !rawExpenses || !rawCategories) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Analytics...</div>;
  }

  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  const categories = rawCategories.map(CategoryMapper.toDomain);
  const baseCurrency = trip.baseCurrency;

  if (expenses.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <h2 className="text-lg font-bold text-foreground">No Analytics Data Yet</h2>
        <p className="text-sm text-muted-foreground max-w-xs mt-1">Add expenses to unlock interactive spending charts and trends.</p>
        <button onClick={() => router.back()} className="mt-6 text-sm font-bold text-brand-accent">
          Go Back
        </button>
      </div>
    );
  }

  // 1. Prepare Category Pie Data
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    const catName = categories.find(c => c.id === exp.category)?.name || 'Other';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + exp.baseAmount.toNumber();
  }

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  // 2. Prepare Spending Over Time Area Data
  const timeTotals: Record<string, number> = {};
  for (const exp of expenses) {
    const dateStr = exp.date.slice(0, 10);
    timeTotals[dateStr] = (timeTotals[dateStr] || 0) + exp.baseAmount.toNumber();
  }

  const areaData = Object.entries(timeTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, total]) => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      amount: Number(total.toFixed(2)),
    }));

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
          <h1 className="text-2xl font-black tracking-tight text-foreground">Expense Analytics</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto mt-2">
        
        {/* Category Spending Donut Chart */}
        <SoftCard className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-brand-accent" /> Category Distribution
            </h2>
            <span className="text-xs font-bold text-muted-foreground">{baseCurrency}</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${baseCurrency} ${val}`, 'Spent']}
                  contentStyle={{ backgroundColor: 'var(--surface-strong)', borderRadius: '12px', border: 'none', color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                <span className="text-muted-foreground truncate">{entry.name}</span>
                <span className="font-bold text-foreground ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* Daily Spending Trend Area Chart */}
        <SoftCard className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Daily Spending Trend
            </h2>
            <span className="text-xs font-bold text-muted-foreground">{baseCurrency}</span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`${baseCurrency} ${val}`, 'Spent']}
                  contentStyle={{ backgroundColor: 'var(--surface-strong)', borderRadius: '12px', border: 'none', color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SoftCard>

      </main>
    </div>
  );
}
