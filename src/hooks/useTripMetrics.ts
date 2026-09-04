import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../infrastructure/db/dexie-db';
import { ExpenseMapper } from '../infrastructure/mappers/expense-mapper';
import { Money } from '../domain/financial/money';

export function useTripMetrics(tripId: string, baseCurrency: string) {
  const rawExpenses = useLiveQuery(() => db.expenses.where('tripId').equals(tripId).toArray(), [tripId]);

  if (!rawExpenses) {
    return {
      totalSpent: Money.zero(baseCurrency),
      expenseCount: 0,
      isLoading: true
    };
  }

  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  
  // Calculate total spent in the base currency
  const totalSpent = expenses.reduce(
    (total, exp) => total.add(exp.baseAmount),
    Money.zero(baseCurrency)
  );

  return {
    totalSpent,
    expenseCount: expenses.length,
    isLoading: false
  };
}
