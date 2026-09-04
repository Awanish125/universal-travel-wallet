import { Budget } from '../../domain/entities/budget';
import { BudgetRecord } from '../db/dexie-db';
import { Money } from '../../domain/financial/money';

export class BudgetMapper {
  static toDomain(record: BudgetRecord, currency: string): Budget {
    return new Budget({
      id: record.id,
      tripId: record.tripId,
      categoryId: record.categoryId,
      amount: Money.fromDecimal(record.amount, currency),
      period: record.period,
    });
  }

  static toPersistence(budget: Budget): BudgetRecord {
    return {
      id: budget.id,
      tripId: budget.tripId,
      categoryId: budget.categoryId,
      amount: budget.amount.toDecimalString(),
      period: budget.period,
    };
  }
}
