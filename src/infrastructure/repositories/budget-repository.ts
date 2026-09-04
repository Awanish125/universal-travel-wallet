import { Budget } from '../../domain/entities/budget';
import { db } from '../db/dexie-db';
import { BudgetMapper } from '../mappers/budget-mapper';

export class BudgetRepository {
  async save(budget: Budget): Promise<void> {
    const record = BudgetMapper.toPersistence(budget);
    await db.budgets.put(record);
  }

  async findByTripId(tripId: string, baseCurrency: string): Promise<Budget[]> {
    const records = await db.budgets.where('tripId').equals(tripId).toArray();
    return records.map(r => BudgetMapper.toDomain(r, baseCurrency));
  }

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id);
  }
}

export const budgetRepository = new BudgetRepository();
