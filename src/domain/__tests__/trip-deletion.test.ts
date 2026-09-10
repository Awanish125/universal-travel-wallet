import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { tripRepository } from '../../infrastructure/repositories/trip-repository';
import { Trip } from '../entities/trip';
import { BackupService } from '../services/backup-service';

const TRIP_ID = 'trip-delete-1';
const OTHER_TRIP_ID = 'trip-delete-2';

function makeTrip(id: string, name: string): Trip {
  return new Trip({
    id,
    name,
    country: 'Indonesia',
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    baseCurrency: 'INR',
    localCurrency: 'IDR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/** Writes one record of every trip-scoped kind, for both trips. */
async function seedTripData(): Promise<void> {
  for (const tripId of [TRIP_ID, OTHER_TRIP_ID]) {
    await db.expenses.put({
      id: `exp-${tripId}`,
      tripId,
      payerId: 'p1',
      amount: '100',
      originalCurrency: 'IDR',
      baseCurrency: 'INR',
      exchangeRate: '0.0052',
      baseAmount: '0.52',
      category: 'cat-food',
      paymentMethod: 'CASH',
      isShared: false,
      splitMethod: 'EQUAL',
      splits: [],
      date: '2026-01-02',
      createdAt: '2026-01-02',
    });
    await db.wallets.put({
      id: `wal-${tripId}`,
      tripId,
      name: 'Cash',
      type: 'CASH',
      currency: 'IDR',
      balance: '500000',
      createdAt: '2026-01-01',
    });
    await db.walletMovements.put({
      id: `mov-${tripId}`,
      tripId,
      walletId: `wal-${tripId}`,
      amount: '100',
      currency: 'IDR',
      type: 'EXPENSE',
      referenceType: 'EXPENSE',
      referenceId: `exp-${tripId}`,
      date: '2026-01-02',
    });
    await db.exchanges.put({
      id: `exc-${tripId}`,
      tripId,
      givenAmount: '1000',
      givenCurrency: 'INR',
      receivedAmount: '190000',
      receivedCurrency: 'IDR',
      actualRate: '190',
      marketRate: '191',
      difference: '1000',
      gainLoss: '-1000',
      fee: '0',
      date: '2026-01-01',
    });
    await db.settlements.put({
      id: `set-${tripId}`,
      tripId,
      payerId: 'p1',
      receiverId: 'p2',
      amount: '50',
      currency: 'INR',
      baseAmount: '50',
      baseCurrency: 'INR',
      exchangeRate: '1',
      paymentMethod: 'CASH',
      isPartial: false,
      originalBalance: '50',
      settledAmount: '50',
      remainingBalance: '0',
      date: '2026-01-05',
      createdAt: '2026-01-05',
    });
    await db.budgets.put({ id: `bud-${tripId}`, tripId, categoryId: 'OVERALL', amount: '20000', period: 'TRIP' });
    await db.negotiations.put({
      id: `neg-${tripId}`,
      tripId,
      originalPrice: '500000',
      finalPrice: '375000',
      currency: 'IDR',
      baseCurrency: 'INR',
      exchangeRate: '0.0052',
      discountPercentage: 25,
      amountSaved: '125000',
      baseAmountSaved: '650',
      date: '2026-01-03',
    });
  }
}

describe('Deleting a trip', () => {
  beforeEach(async () => {
    await Promise.all([
      db.trips.clear(),
      db.participants.clear(),
      db.expenses.clear(),
      db.wallets.clear(),
      db.walletMovements.clear(),
      db.exchanges.clear(),
      db.settlements.clear(),
      db.budgets.clear(),
      db.negotiations.clear(),
    ]);

    await tripRepository.save(makeTrip(TRIP_ID, 'Bali'));
    await tripRepository.save(makeTrip(OTHER_TRIP_ID, 'Vietnam'));
    await seedTripData();
  });

  it('removes every record belonging to the trip', async () => {
    await tripRepository.delete(TRIP_ID);

    expect(await db.trips.get(TRIP_ID)).toBeUndefined();
    expect(await db.expenses.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.wallets.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.walletMovements.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.exchanges.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.settlements.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.budgets.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.negotiations.where('tripId').equals(TRIP_ID).count()).toBe(0);
    expect(await db.participants.where('tripId').equals(TRIP_ID).count()).toBe(0);
  });

  it('leaves other trips completely intact', async () => {
    await tripRepository.delete(TRIP_ID);

    expect(await db.trips.get(OTHER_TRIP_ID)).toBeDefined();
    expect(await db.expenses.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.wallets.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.walletMovements.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.exchanges.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.settlements.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.budgets.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.negotiations.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
    expect(await db.participants.where('tripId').equals(OTHER_TRIP_ID).count()).toBe(1);
  });

  it('can export the whole trip before it is deleted', async () => {
    const exported = await BackupService.collectTripData(TRIP_ID);

    expect(exported).not.toBeNull();
    expect((exported!.trip as { name: string }).name).toBe('Bali');
    expect(exported!.expenses).toHaveLength(1);
    expect(exported!.wallets).toHaveLength(1);
    expect(exported!.walletMovements).toHaveLength(1);
    expect(exported!.exchanges).toHaveLength(1);
    expect(exported!.settlements).toHaveLength(1);
    expect(exported!.budgets).toHaveLength(1);
    expect(exported!.negotiations).toHaveLength(1);
    // The seeded "You" participant is included.
    expect(exported!.participants).toHaveLength(1);
  });

  it('returns null when exporting a trip that does not exist', async () => {
    expect(await BackupService.collectTripData('no-such-trip')).toBeNull();
  });
});
