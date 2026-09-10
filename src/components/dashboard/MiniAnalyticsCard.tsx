'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { ExpenseMapper } from '../../infrastructure/mappers/expense-mapper';
import { CategoryMapper } from '../../infrastructure/mappers/category-mapper';
import { SoftCard } from '../common/SoftCard';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PieChart as PieIcon, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

interface Props {
  tripId: string;
  baseCurrency: string;
}

export function MiniAnalyticsCard({ tripId, baseCurrency }: Props) {
  const router = useRouter();
  const rawExpenses = useLiveQuery(() => db.expenses.where('tripId').equals(tripId).toArray(), [tripId]);
  const rawCategories = useLiveQuery(() => db.categories.toArray());

  if (!rawExpenses || !rawCategories || rawExpenses.length === 0) {
    return null; // Only show if expenses exist
  }

  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  const categories = rawCategories.map(CategoryMapper.toDomain);

  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses) {
    const catName = categories.find(c => c.id === exp.category)?.name || 'Other';
    categoryTotals[catName] = (categoryTotals[catName] || 0) + exp.baseAmount.toNumber();
  }

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  return (
    <SoftCard 
      interactive 
      onClick={() => router.push(`/trips/${tripId}/analytics`)}
      className="p-5 flex items-center justify-between hover:border-brand-accent/30 transition-colors"
    >
      <div className="flex flex-col space-y-1">
        <div className="flex items-center gap-1.5 text-brand-accent font-bold text-xs uppercase tracking-wider">
          <PieIcon className="w-4 h-4" /> Where it went
        </div>
        <span className="text-sm font-black text-foreground">
          {pieData.length} {pieData.length === 1 ? 'category' : 'categories'} so far
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          See the full breakdown <ArrowRight className="w-3 h-3" />
        </span>
      </div>

      <div className="w-20 h-20 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={36}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </SoftCard>
  );
}
