import { Participant, ParticipantProps } from '../../domain/entities/participant';
import { ParticipantRecord } from '../db/dexie-db';

export class ParticipantMapper {
  static toDomain(record: ParticipantRecord): Participant {
    const props: ParticipantProps = {
      id: record.id,
      tripId: record.tripId,
      name: record.name,
      avatar: record.avatar,
      isUser: record.isUser,
      createdAt: record.createdAt,
    };
    return new Participant(props);
  }

  static toPersistence(participant: Participant): ParticipantRecord {
    return {
      id: participant.id,
      tripId: participant.tripId,
      name: participant.name,
      avatar: participant.avatar,
      isUser: participant.isUser,
      createdAt: participant.createdAt,
    };
  }
}
