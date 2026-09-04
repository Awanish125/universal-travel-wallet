'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { budgetRepository } from '../../infrastructure/repositories/budget-repository';
import { Budget } from '../../domain/entities/budget';
import { Money } from '../../domain/financial/money';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  tripId: string;
  baseCurrency: string;
  totalSpent: Money;
}

export function BudgetProgressCard({ tripId, baseCurrency, totalSpent }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputBudget, setInputBudget] = useState('');

  const rawBudgets = useLiveQuery(
    () => db.budgets.where('tripId').equals(tripId).toArray(), 
    [tripId]
  );

  if (!rawBudgets) return null;

  const overallBudgetRecord = rawBudgets.find(b => b.categoryId === 'OVERALL');
  const overallBudget = overallBudgetRecord 
    ? Money.fromDecimal(overallBudgetRecord.amount, baseCurrency)
    : null;

  const handleSaveBudget = async () => {
    if (!inputBudget || isNaN(Number(inputBudget)) || Number(inputBudget) <= 0) return;

    const budget = new Budget({
      id: overallBudgetRecord ? overallBudgetRecord.id : crypto.randomUUID(),
      tripId,
      categoryId: 'OVERALL',
      amount: Money.fromDecimal(inputBudget, baseCurrency),
      period: 'TRIP',
    });

    await budgetRepository.save(budget);
    setIsEditing(false);
  };

  // Calculations
  let percentSpent = 0;
  let isOverBudget = false;
  let remainingBudget = Money.zero(baseCurrency);

  if (overallBudget && !overallBudget.isZero()) {
    percentSpent = Math.min(100, Math.round((totalSpent.toNumber() / overallBudget.toNumber()) * 100));
    isOverBudget = totalSpent.isGreaterThan(overallBudget);
    remainingBudget = overallBudget.subtract(totalSpent);
  }

  // Progress Bar Colors
  let progressColor = 'bg-emerald-500';
  if (percentSpent > 75) progressColor = 'bg-amber-500';
  if (percentSpent > 90 || isOverBudget) progressColor = 'bg-destructive';

  return (
    <SoftCard className="p-5 relative overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-accent" />
          <h3 className="text-base font-bold text-foreground">Trip Budget</h3>
        </div>
        <button 
          onClick={() => {
            setInputBudget(overallBudget ? overallBudget.toDecimalString() : '');
            setIsEditing(!isEditing);
          }}
          className="text-xs font-bold text-brand-accent hover:underline"
        >
          {overallBudget ? 'Edit Budget' : '+ Set Budget'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-2">
          <label className="text-xs font-medium text-muted-foreground block">
            Set total trip budget ({baseCurrency})
          </label>
          <div className="flex gap-2">
            <input 
              type="number"
              step="any"
              value={inputBudget}
              onChange={(e) => setInputBudget(e.target.value)}
              placeholder="e.g. 1000"
              className="flex-1 bg-background border-2 border-transparent focus:border-brand-accent rounded-xl p-2 outline-none text-foreground font-bold shadow-soft-inner"
            />
            <SoftButton variant="primary" onClick={handleSaveBudget} className="px-4 text-xs font-bold bg-brand-accent">
              Save
            </SoftButton>
          </div>
        </div>
      ) : overallBudget ? (
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs text-muted-foreground block font-medium">Spent of {overallBudget.format()}</span>
              <span className="text-lg font-black text-foreground">{totalSpent.format()}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block font-medium">
                {isOverBudget ? 'Over by' : 'Remaining'}
              </span>
              <span className={`text-sm font-black ${isOverBudget ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {remainingBudget.format()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 shadow-soft-inner">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${percentSpent}%` }}
            />
          </div>

          {/* Alert Status */}
          {percentSpent > 80 && (
            <div className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-bold ${isOverBudget ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                {isOverBudget 
                  ? `Warning! You have exceeded your budget limit by ${totalSpent.subtract(overallBudget).format()}`
                  : `Careful! You have used ${percentSpent}% of your total budget.`}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">
          No budget set for this trip. Set a budget to receive spending alerts and track remaining limits!
        </p>
      )}
    </SoftCard>
  );
}
