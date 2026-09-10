'use client';

import React from 'react';
import { Check, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { Participant } from '../../domain/entities/participant';

interface Props {
  people: Participant[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  error?: string;
  /** Opens the caller's "add person" sheet without leaving the form (Point 4). */
  onAddPerson?: () => void;
}

/**
 * Multi-select for the people an expense is split between. Rendered as tappable
 * chips rather than a multi-select list, because on a phone a list of checkboxes
 * is slower and easier to mis-tap.
 */
export function PeoplePicker({
  people,
  selectedIds,
  onChange,
  label,
  error,
  onAddPerson,
}: Props) {
  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id]
    );
  }

  const allSelected = people.length > 0 && selectedIds.length === people.length;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        {label && <span className="text-sm font-medium text-foreground">{label}</span>}
        {people.length > 1 && (
          <button
            type="button"
            onClick={() => onChange(allSelected ? [] : people.map((p) => p.id))}
            className="text-xs font-bold text-brand-accent"
          >
            {allSelected ? 'Clear all' : 'Select everyone'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {people.map((person) => {
          const isSelected = selectedIds.includes(person.id);
          return (
            <button
              key={person.id}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              onClick={() => toggle(person.id)}
              className={clsx(
                'flex min-h-[44px] items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors',
                isSelected
                  ? 'border-brand-accent bg-accent-soft text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-accent" />}
              {person.isUser ? `${person.name} (you)` : person.name}
            </button>
          );
        })}

        {onAddPerson && (
          <button
            type="button"
            onClick={onAddPerson}
            className="flex min-h-[44px] items-center gap-1.5 rounded-full border-2 border-dashed border-border px-4 text-sm font-bold text-brand-accent transition-colors hover:border-brand-accent"
          >
            <Plus className="h-4 w-4 shrink-0" />
            Add person
          </button>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
