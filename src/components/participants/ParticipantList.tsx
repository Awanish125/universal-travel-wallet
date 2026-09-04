'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import { User, Users } from 'lucide-react';

interface Props {
  tripId: string;
}

export function ParticipantList({ tripId }: Props) {
  const records = useLiveQuery(() => db.participants.where('tripId').equals(tripId).toArray());
  
  if (records === undefined) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading participants...</div>;
  }

  const participants = records.map(ParticipantMapper.toDomain);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {participants.map(p => (
        <div key={p.id} className="flex flex-col items-center gap-1 shrink-0">
          <div className="w-12 h-12 rounded-full bg-surface-strong shadow-clay-convex-sm flex items-center justify-center border border-white/5 overflow-hidden">
            {p.isUser ? (
              <User className="w-5 h-5 text-brand-accent" />
            ) : (
              <Users className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs font-semibold text-foreground max-w-[60px] truncate text-center">
            {p.name}
          </span>
        </div>
      ))}
    </div>
  );
}
