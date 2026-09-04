import { Trip, TripProps } from '../../domain/entities/trip';
import { TripRecord } from '../db/dexie-db';

export class TripMapper {
  static toDomain(record: TripRecord): Trip {
    const props: TripProps = {
      id: record.id,
      name: record.name,
      country: record.country,
      startDate: record.startDate,
      endDate: record.endDate,
      baseCurrency: record.baseCurrency,
      additionalCurrencies: record.additionalCurrencies,
      budget: record.budget,
      dailyBudget: record.dailyBudget,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return new Trip(props);
  }

  static toPersistence(trip: Trip): TripRecord {
    return {
      id: trip.id,
      name: trip.name,
      country: trip.country,
      startDate: trip.startDate,
      endDate: trip.endDate,
      baseCurrency: trip.baseCurrency,
      additionalCurrencies: trip.additionalCurrencies,
      budget: trip.budget,
      dailyBudget: trip.dailyBudget,
      status: trip.status,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
    };
  }
}
