'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { ExpenseMapper } from '../../infrastructure/mappers/expense-mapper';
import { CategoryMapper } from '../../infrastructure/mappers/category-mapper';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import * as Icons from 'lucide-react';
import { SoftCard } from '../common/SoftCard';
import { CurrencyAmount } from '../common/CurrencyAmount';
import { GradientIconTile } from '../common/GradientIconTile';
import { gradientRoleForCategory } from '../../lib/category-visuals';
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
          
          const IconComponent =
            (category && (Icons as Record<string, any>)[category.icon]) || Icons.Receipt;
          const gradientRole = gradientRoleForCategory(category?.color);

          return (
            <StaggerItem key={expense.id}>
              <SoftCard interactive className="p-3 flex items-center justify-between hover:border-brand-accent/20 transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <GradientIconTile icon={<IconComponent />} role={gradientRole} size="md" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-bold text-foreground">
                      {category?.name || 'Uncategorised'}
                      {expense.note ? ` · ${expense.note}` : ''}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {expense.isShared ? 'Split · ' : ''}Paid by{' '}
                      {payer?.isUser ? 'you' : payer?.name || 'someone'}
                    </span>
                  </div>
                </div>
                
                <div className="flex shrink-0 flex-col items-end text-right">
                  <CurrencyAmount
                    money={expense.originalAmount}
                    className="text-sm font-black text-foreground"
                    symbolClassName="text-xs"
                  />
                  {expense.originalAmount.currency !== expense.baseAmount.currency && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span aria-hidden>≈</span>
                      <CurrencyAmount money={expense.baseAmount} />
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
