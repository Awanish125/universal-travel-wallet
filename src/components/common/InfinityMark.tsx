'use client';

import React, { useId } from 'react';
import { clsx } from 'clsx';

/**
 * InfinityMark — a lemniscate drawn as an SVG path, with a light travelling
 * endlessly around it.
 *
 * Drawn rather than typed: the `∞` character is a font glyph, so it cannot
 * animate, and its weight and width change with whatever font happens to load.
 * A path is the same everywhere and can carry motion.
 *
 * The loop is a pure CSS `stroke-dashoffset` animation on a gradient-stroked
 * copy of the path, so it needs no animation frames and no JavaScript, and it
 * stops for `prefers-reduced-motion`.
 */
export function InfinityMark({ className }: { className?: string }) {
  const gradientId = useId();

  // A lemniscate of Bernoulli, traced as two mirrored cubic curves that cross
  // at the centre.
  const path =
    'M50 30 C 62 12, 92 12, 92 30 C 92 48, 62 48, 50 30 C 38 12, 8 12, 8 30 C 8 48, 38 48, 50 30 Z';

  return (
    <svg
      viewBox="0 0 100 60"
      role="img"
      aria-label="Unlimited"
      className={clsx('infinity-mark h-[1em] w-[1.7em] overflow-visible', className)}
      fill="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-primary)" />
          <stop offset="50%" stopColor="var(--accent-strong)" />
          <stop offset="100%" stopColor="var(--accent-primary)" />
        </linearGradient>
      </defs>

      {/* The full figure, held at low contrast so the shape always reads. */}
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        opacity="0.28"
      />

      {/* The travelling highlight. */}
      <path
        className="infinity-mark__spark"
        d={path}
        stroke={`url(#${gradientId})`}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}
