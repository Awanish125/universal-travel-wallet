'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface SegmentOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface Props {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/**
 * A two-or-three-way choice shown as one tap target per option, so a decision
 * like personal-versus-shared needs no dropdown (Point 0: fast common actions).
 */
export function SegmentedControl({ options, value, onChange, label, className }: Props) {
  const groupId = useId();

  return (
    <div className={className}>
      {label && (
        <span id={`${groupId}-label`} className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        className="flex gap-1 rounded-2xl bg-background p-1 shadow-soft-inner"
      >
        {options.map((option) => {
          const isSelected = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(option.value)}
              className={clsx(
                'relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition-colors',
                isSelected ? 'text-brand-accent' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId={`${groupId}-segment`}
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-xl bg-surface-strong shadow-soft-outer-sm"
                />
              )}
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
