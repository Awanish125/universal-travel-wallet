'use client';

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';

/**
 * Emblem — the small square that leads a country or currency row.
 *
 * Flag emoji are built from two regional-indicator characters that the platform
 * is supposed to compose into one glyph. Windows does not: it renders the two
 * letters instead, which is why every country row read "AF", "AX", "AL" rather
 * than showing a flag.
 *
 * Bundling 250 flag SVGs is not an option either — this app has to work
 * offline, so it cannot fetch them, and shipping them all is a lot of weight
 * for decoration.
 *
 * So: use the emoji where the platform actually composes it, and fall back to a
 * clean monospace code chip where it does not. The chip is deliberate rather
 * than broken, and for currencies it can show the symbol, which is more use to
 * a traveller than a flag anyway.
 */

/** Cached across every Emblem on the page — the test costs a canvas measure. */
let flagSupport: boolean | null = null;

function detectFlagSupport(): boolean {
  if (flagSupport !== null) return flagSupport;
  if (typeof document === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return (flagSupport = false);

    context.font = '16px sans-serif';
    // A composed flag is one glyph, so it is narrower than its two halves
    // measured separately. An uncomposed one is exactly twice as wide.
    const composed = context.measureText('\u{1F1EE}\u{1F1F3}').width;
    const single = context.measureText('\u{1F1EE}').width;
    flagSupport = composed < single * 1.8;
  } catch {
    flagSupport = false;
  }

  return flagSupport;
}

interface Props {
  /** The emoji flag, when one is known. */
  emoji?: string;
  /** Shown when the platform cannot draw the flag — an ISO or currency code. */
  code: string;
  /** Preferred over `code` in the fallback chip when it is short, e.g. "₹". */
  symbol?: string;
  className?: string;
}

export function Emblem({ emoji, code, symbol, className }: Props) {
  // Rendered as the chip on the server and on the first client paint, then
  // swapped for the emoji only if this platform composes it. Deciding during
  // render would mismatch the server's HTML.
  const [canDrawFlags, setCanDrawFlags] = useState(false);
  useEffect(() => setCanDrawFlags(detectFlagSupport()), []);

  if (canDrawFlags && emoji) {
    return (
      <span aria-hidden className={clsx('text-lg leading-none', className)}>
        {emoji}
      </span>
    );
  }

  // A symbol is only useful in the chip when it is a glyph or two; a symbol
  // that is just the code repeated adds nothing.
  const label =
    symbol && symbol.length <= 2 && symbol.toUpperCase() !== code.toUpperCase()
      ? symbol
      : code.slice(0, 3).toUpperCase();

  return (
    <span
      aria-hidden
      className={clsx(
        'inline-flex h-6 min-w-[1.75rem] shrink-0 items-center justify-center rounded-md px-1',
        'bg-accent-soft text-[10px] font-bold tracking-wide text-accent',
        className
      )}
    >
      {label}
    </span>
  );
}
