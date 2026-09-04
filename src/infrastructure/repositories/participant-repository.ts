import { Participant } from '../../domain/entities/participant';
import { db } from '../db/dexie-db';
import { ParticipantMapper } from '../mappers/participant-mapper';

export class ParticipantRepository {
  /**
   * Saves a Participant to the database (create or update).
   */
  async save(participant: Participant): Promise<void> {
    const record = ParticipantMapper.toPersistence(participant);
    await db.participants.put(record);
  }

  /**
   * Finds a Participant by ID.
   */
  async findById(id: string): Promise<Participant | null> {
    const record = await db.participants.get(id);
    if (!record) return null;
    return ParticipantMapper.toDomain(record);
  }

  /**
   * Retrieves all Participants for a specific Trip.
   */
  async findByTripId(tripId: string): Promise<Participant[]> {
    const records = await db.participants
      .where('tripId')
      .equals(tripId)
      .toArray();
    
    return records.map(ParticipantMapper.toDomain);
  }

  /**
   * Deletes a Participant by ID.
   */
  async delete(id: string): Promise<void> {
    await db.participants.delete(id);
  }
}

export const participantRepository = new ParticipantRepository();
