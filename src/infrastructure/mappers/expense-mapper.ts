import { Expense } from '../../domain/entities/expense';
import { ExpenseRecord, ExpenseSplitRecord } from '../db/dexie-db';
import { Money } from '../../domain/financial/money';

export class ExpenseMapper {
  static toDomain(record: ExpenseRecord): Expense {
    return new Expense({
      id: record.id,
      tripId: record.tripId,
      payerId: record.payerId,
      originalAmount: Money.fromDecimal(record.amount, record.originalCurrency),
      baseAmount: Money.fromDecimal(record.baseAmount, record.baseCurrency),
      exchangeRate: record.exchangeRate,
      category: record.category,
      paymentMethod: record.paymentMethod,
      walletId: record.walletId,
      isShared: record.isShared,
      splitMethod: record.splitMethod,
      splits: record.splits.map(s => ({
        participantId: s.participantId,
        amount: Money.fromDecimal(s.amount, record.originalCurrency),
        percentage: s.percentage,
      })),
      note: record.note,
      imageUrl: record.imageUrl,
      date: record.date,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(expense: Expense): ExpenseRecord {
    return {
      id: expense.id,
      tripId: expense.tripId,
      payerId: expense.payerId,
      amount: expense.originalAmount.toDecimalString(),
      originalCurrency: expense.originalAmount.currency,
      baseAmount: expense.baseAmount.toDecimalString(),
      baseCurrency: expense.baseAmount.currency,
      exchangeRate: expense.exchangeRate,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      walletId: expense.walletId,
      isShared: expense.isShared,
      splitMethod: expense.splitMethod,
      splits: expense.splits.map(s => ({
        participantId: s.participantId,
        amount: s.amount.toDecimalString(),
        percentage: s.percentage,
      })),
      note: expense.note,
      imageUrl: expense.imageUrl,
      date: expense.date,
      createdAt: expense.createdAt,
    };
  }
}
