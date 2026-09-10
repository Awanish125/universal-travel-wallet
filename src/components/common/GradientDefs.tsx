'use client';

import React from 'react';

/**
 * Hidden SVG holding shared `<linearGradient>` definitions that icons
 * elsewhere reference by id via `stroke="url(#id)"` — Lucide icons forward an
 * explicit `stroke` prop straight onto their root `<svg>` (`createLucideIcon`
 * sets `stroke: color` first, then spreads the caller's own props over it),
 * so this is a drop-in replacement for the usual `text-*` color class.
 *
 * Mounted once, reused by id everywhere (Rule 15) — the SVG stroke
 * equivalent of `.animated-gradient-border`'s rotating conic-gradient border
 * in `globals.css`. CSS alone cannot animate an SVG gradient's rotation, so
 * this uses SMIL (`<animateTransform>`) instead; no JS, broadly supported.
 *
 * Stops are the existing `gradient-clay-primary` token (tailwind.config.ts)
 * verbatim — the Custom Gradient Accent Pattern (Rule 73) requires every
 * gradient to come from a centralized token, never a bespoke color pulled in
 * for one spot.
 */
export function GradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="icon-gradient-violet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9B8CFF" />
          <stop offset="55%" stopColor="#7C6FEF" />
          <stop offset="100%" stopColor="#5B4FE0" />
          <animateTransform
            attributeName="gradientTransform"
            type="rotate"
            from="0 0.5 0.5"
            to="360 0.5 0.5"
            dur="4s"
            repeatCount="indefinite"
          />
        </linearGradient>
      </defs>
    </svg>
  );
}
