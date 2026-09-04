export interface ParticipantProps {
  id: string;
  tripId: string;
  name: string;
  avatar?: string;
  isUser: boolean;
  createdAt: string;
}

export class Participant {
  readonly id: string;
  readonly tripId: string;
  readonly name: string;
  readonly avatar?: string;
  readonly isUser: boolean;
  readonly createdAt: string;

  constructor(props: ParticipantProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.name = props.name;
    this.avatar = props.avatar;
    this.isUser = props.isUser;
    this.createdAt = props.createdAt;
  }
}
