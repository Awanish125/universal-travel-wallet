import { Trip } from '../../domain/entities/trip';
import { db } from '../db/dexie-db';
import { TripMapper } from '../mappers/trip-mapper';
import { newId } from '../../lib/id';

export class TripRepository {
  /**
   * Saves a Trip to the database (create or update).
   */
  async save(trip: Trip): Promise<void> {
    const record = TripMapper.toPersistence(trip);
    
    await db.transaction('rw', db.trips, db.participants, async () => {
      const isNew = (await db.trips.where('id').equals(trip.id).count()) === 0;
      await db.trips.put(record);

      if (isNew) {
        await db.participants.put({
          id: newId(),
          tripId: trip.id,
          name: 'You',
          isUser: true,
          createdAt: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Finds a Trip by ID.
   */
  async findById(id: string): Promise<Trip | null> {
    const record = await db.trips.get(id);
    if (!record) return null;
    return TripMapper.toDomain(record);
  }

  /**
   * Retrieves all Trips, optionally filtered by status.
   * Sorted by createdAt descending.
   */
  async findAll(status?: Trip['status']): Promise<Trip[]> {
    let query = db.trips.orderBy('createdAt').reverse();
    
    if (status) {
      query = query.filter((trip) => trip.status === status) as any;
    }
    
    const records = await query.toArray();
    return records.map(TripMapper.toDomain);
  }

  /**
   * Deletes a Trip and everything that belongs to it.
   *
   * Deleting only the trip row would leave orphaned expenses, wallets and
   * settlements behind, which then skew every global total and can never be
   * reached again. All tables are cleared in one transaction so a failure
   * halfway through leaves the trip intact.
   */
  async delete(id: string): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.trips,
        db.participants,
        db.expenses,
        db.wallets,
        db.walletMovements,
        db.exchanges,
        db.settlements,
        db.budgets,
        db.negotiations,
      ],
      async () => {
        await Promise.all([
          db.participants.where('tripId').equals(id).delete(),
          db.expenses.where('tripId').equals(id).delete(),
          db.wallets.where('tripId').equals(id).delete(),
          db.walletMovements.where('tripId').equals(id).delete(),
          db.exchanges.where('tripId').equals(id).delete(),
          db.settlements.where('tripId').equals(id).delete(),
          db.budgets.where('tripId').equals(id).delete(),
          db.negotiations.where('tripId').equals(id).delete(),
        ]);
        await db.trips.delete(id);
      }
    );
  }
}

export const tripRepository = new TripRepository();
