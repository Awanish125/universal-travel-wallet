'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { ExpenseMapper } from '../../infrastructure/mappers/expense-mapper';
import { CategoryMapper } from '../../infrastructure/mappers/category-mapper';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import * as Icons from 'lucide-react';
import { SoftCard } from '../common/SoftCard';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { StaggerContainer, StaggerItem } from '../common/StaggerContainer';

interface Props {
  tripId: string;
}

export function ExpenseList({ tripId }: Props) {
  const rawExpenses = useLiveQuery(() => 
    db.expenses.where('tripId').equals(tripId).reverse().sortBy('date'), [tripId]
  );
  const rawCategories = useLiveQuery(() => db.categories.toArray());
  const rawParticipants = useLiveQuery(() => db.participants.where('tripId').equals(tripId).toArray(), [tripId]);

  if (!rawExpenses || !rawCategories || !rawParticipants) {
    return <div className="text-sm text-muted-foreground animate-pulse text-center p-4">Loading expenses...</div>;
  }

  if (rawExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground text-center">No expenses recorded.</p>
      </div>
    );
  }

  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  const categories = rawCategories.map(CategoryMapper.toDomain);
  const participants = rawParticipants.map(ParticipantMapper.toDomain);

  return (
    <div className="flex flex-col gap-3">
      <StaggerContainer className="flex flex-col gap-3">
        {expenses.slice(0, 5).map(expense => {
          const category = categories.find(c => c.id === expense.category);
          const payer = participants.find(p => p.id === expense.payerId);
          
          const IconComponent = (category && (Icons as any)[category.icon]) ? (Icons as any)[category.icon] : Icons.Receipt;
          const color = category?.color || 'gray';

          return (
            <StaggerItem key={expense.id}>
              <SoftCard interactive className="p-3 flex items-center justify-between hover:border-brand-accent/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${color}-100 dark:bg-${color}-500/20 text-${color}-600 dark:text-${color}-400`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">
                      {category?.name || 'Unknown'} {expense.note ? `- ${expense.note}` : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Paid by {payer?.name || 'Someone'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <span className="text-sm font-black text-foreground flex items-center gap-1">
                    <span className="text-xs text-muted-foreground font-bold">{expense.originalAmount.currency}</span>
                    <AnimatedNumber value={expense.originalAmount.toNumber()} decimals={2} />
                  </span>
                  {expense.originalAmount.currency !== expense.baseAmount.currency && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>≈ {expense.baseAmount.currency}</span>
                      <AnimatedNumber value={expense.baseAmount.toNumber()} decimals={2} />
                    </span>
                  )}
                </div>
              </SoftCard>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {expenses.length > 5 && (
        <button className="text-xs font-bold text-brand-accent w-full text-center py-2 hover:underline mt-2">
          View all {expenses.length} expenses
        </button>
      )}
    </div>
  );
}
