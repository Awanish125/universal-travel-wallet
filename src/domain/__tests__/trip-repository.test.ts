import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { tripRepository } from '../../infrastructure/repositories/trip-repository';
import { Trip } from '../entities/trip';

describe('TripRepository', () => {
  beforeEach(async () => {
    await db.trips.clear();
  });

  const createSampleTrip = (id: string, status: 'ACTIVE' | 'FINISHED' = 'ACTIVE') => {
    return new Trip({
      id,
      name: `Trip ${id}`,
      country: 'ID',
      startDate: '2026-10-01',
      endDate: '2026-10-15',
      baseCurrency: 'USD',
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  it('saves and retrieves a trip by ID', async () => {
    const trip = createSampleTrip('trip-1');
    await tripRepository.save(trip);

    const retrieved = await tripRepository.findById('trip-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('trip-1');
    expect(retrieved?.name).toBe('Trip trip-1');
    expect(retrieved?.baseCurrency).toBe('USD');
  });

  it('returns null for non-existent trip', async () => {
    const retrieved = await tripRepository.findById('non-existent');
    expect(retrieved).toBeNull();
  });

  it('finds all trips', async () => {
    await tripRepository.save(createSampleTrip('trip-1'));
    await tripRepository.save(createSampleTrip('trip-2'));

    const all = await tripRepository.findAll();
    expect(all.length).toBe(2);
  });

  it('filters trips by status', async () => {
    await tripRepository.save(createSampleTrip('trip-1', 'ACTIVE'));
    await tripRepository.save(createSampleTrip('trip-2', 'FINISHED'));

    const activeTrips = await tripRepository.findAll('ACTIVE');
    expect(activeTrips.length).toBe(1);
    expect(activeTrips[0].id).toBe('trip-1');

    const finishedTrips = await tripRepository.findAll('FINISHED');
    expect(finishedTrips.length).toBe(1);
    expect(finishedTrips[0].id).toBe('trip-2');
  });

  it('deletes a trip', async () => {
    await tripRepository.save(createSampleTrip('trip-1'));
    let retrieved = await tripRepository.findById('trip-1');
    expect(retrieved).not.toBeNull();

    await tripRepository.delete('trip-1');
    retrieved = await tripRepository.findById('trip-1');
    expect(retrieved).toBeNull();
  });
});
