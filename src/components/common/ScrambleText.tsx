'use client';

/**
 * ScrambleText — decode animation for a short run of inline text.
 *
 * Characters cycle through glyphs, then resolve left to right.
 *
 * - `trigger="inview"` (default) fires once when the element scrolls into view.
 * - `trigger="immediate"` fires as soon as the component mounts.
 *
 * Renders the real text on the server, so crawlers and a no-JS visitor always
 * see the finished string. Reduced motion skips the effect entirely.
 *
 * Adapted from the KP reference build's `ScrambleText`.
 */

import { createElement, useEffect, useRef } from 'react';
import { observeOnce, prefersReducedMotion } from '../../lib/motion';
import { scrambleDecode } from '../../lib/scramble';

type Tag = keyof React.JSX.IntrinsicElements;

interface ScrambleTextProps {
  text: string;
  duration?: number;
  delay?: number;
  trigger?: 'inview' | 'immediate';
  as?: Tag;
  className?: string;
  style?: React.CSSProperties;
}

export function ScrambleText({
  text,
  duration = 0.75,
  delay = 0,
  trigger = 'inview',
  as = 'span',
  className,
  style,
}: ScrambleTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = text;
      return;
    }

    let tween: gsap.core.Tween | undefined;
    const run = () => {
      tween = scrambleDecode(el, text, duration, delay);
    };

    if (trigger === 'immediate') {
      run();
      return () => tween?.kill();
    }

    // Stays readable until the observer fires.
    el.textContent = text;
    const cancel = observeOnce(el, run, '0px 0px -8% 0px');
    return () => {
      cancel();
      tween?.kill();
    };
  }, [text, duration, delay, trigger]);

  return createElement(as, { ref, className, style }, text);
}
