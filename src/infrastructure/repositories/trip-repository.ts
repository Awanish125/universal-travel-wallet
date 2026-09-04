import { Trip } from '../../domain/entities/trip';
import { db } from '../db/dexie-db';
import { TripMapper } from '../mappers/trip-mapper';

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
          id: crypto.randomUUID(),
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
   * Deletes a Trip by ID.
   */
  async delete(id: string): Promise<void> {
    await db.trips.delete(id);
  }
}

export const tripRepository = new TripRepository();
