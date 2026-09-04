import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { BackupService } from '../services/backup-service';
import { Trip } from '../entities/trip';
import { Expense } from '../entities/expense';
import { Money } from '../financial/money';
import { TripMapper } from '../../infrastructure/mappers/trip-mapper';
import { ExpenseMapper } from '../../infrastructure/mappers/expense-mapper';

describe('BackupService & Data Persistence', () => {
  beforeEach(async () => {
    await db.trips.clear();
    await db.expenses.clear();
    await db.wallets.clear();
    await db.participants.clear();
  });

  it('persists data in IndexedDB correctly', async () => {
    const trip = new Trip({
      id: 'trip-persist-1',
      name: 'Japan Adventure',
      country: 'Japan',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      baseCurrency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.trips.put(TripMapper.toPersistence(trip));

    const savedTrip = await db.trips.get('trip-persist-1');
    expect(savedTrip).not.toBeUndefined();
    expect(savedTrip?.name).toBe('Japan Adventure');
  });

  it('exports and restores JSON backups without data loss', async () => {
    // 1. Populate DB with test trip and expense
    const trip = new Trip({
      id: 't-1',
      name: 'Bali Trip',
      country: 'Indonesia',
      startDate: '2026-09-01',
      endDate: '2026-09-10',
      baseCurrency: 'USD',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await db.trips.put(TripMapper.toPersistence(trip));

    const expense = new Expense({
      id: 'exp-1',
      tripId: 't-1',
      payerId: 'p-1',
      originalAmount: Money.fromDecimal('150000', 'IDR'),
      baseAmount: Money.fromDecimal('10', 'USD'),
      exchangeRate: '0.000066',
      category: 'Food',
      paymentMethod: 'CASH',
      isShared: false,
      splitMethod: 'EQUAL',
      splits: [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    await db.expenses.put(ExpenseMapper.toPersistence(expense));

    // 2. Generate JSON backup string
    const backupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      trips: await db.trips.toArray(),
      participants: await db.participants.toArray(),
      expenses: await db.expenses.toArray(),
      wallets: await db.wallets.toArray(),
      exchanges: await db.exchanges.toArray(),
      settlements: await db.settlements.toArray(),
      categories: await db.categories.toArray(),
      budgets: await db.budgets.toArray(),
      negotiations: await db.negotiations.toArray(),
      settings: await db.settings.toArray(),
    };

    const jsonString = JSON.stringify(backupData);

    // 3. Clear DB completely
    await db.trips.clear();
    await db.expenses.clear();

    expect(await db.trips.count()).toBe(0);
    expect(await db.expenses.count()).toBe(0);

    // 4. Restore from JSON
    const result = await BackupService.importFromJson(jsonString);
    expect(result).toBe(true);

    // 5. Verify restored data
    const restoredTrip = await db.trips.get('t-1');
    const restoredExpense = await db.expenses.get('exp-1');

    expect(restoredTrip?.name).toBe('Bali Trip');
    expect(restoredExpense?.amount).toBe('150000');
    expect(restoredExpense?.originalCurrency).toBe('IDR');
  });
});
