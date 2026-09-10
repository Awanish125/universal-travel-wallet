'use client';

/**
 * ScrollReveal — wraps a section and plays its entrance the first time it
 * scrolls into view.
 *
 * Follows the KP reference build's `SectionReveal` contract:
 *  - IntersectionObserver trigger, no ScrollTrigger and no scroll listeners.
 *  - `will-change` set in `onStart`, cleared in `onComplete`.
 *  - Nothing is hidden in JSX, only by `gsap.set` once the observer is wired,
 *    so reduced motion and a failed script both render the content normally.
 *
 * `from` sets the direction content travels in from. Alternating it down the
 * page stops every section arriving on the same axis, which is what makes a
 * long page of reveals feel mechanical.
 */

import React, { createElement, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { observeOnce, prefersReducedMotion, withWillChange } from '../../lib/motion';

/** Where the content travels in from. */
export type RevealFrom = 'bottom' | 'top' | 'left' | 'right';

interface Props {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  as?: 'div' | 'section';
  /**
   * Stagger the wrapper's direct children instead of animating it as one
   * block. Defaults to true, matching the reference behaviour.
   */
  staggerChildren?: boolean;
  from?: RevealFrom;
  /**
   * Give each staggered child its own direction, cycling through this list.
   * Overrides `from` for the children.
   */
  fromCycle?: RevealFrom[];
  /** How far the elements travel, in pixels. */
  distance?: number;
  /** Seconds between staggered children. */
  stagger?: number;
  duration?: number;
  ease?: string;
  rootMargin?: string;
}

/** Turns a direction into the offset an element starts at. */
function offsetFor(from: RevealFrom, distance: number): { x: number; y: number } {
  switch (from) {
    case 'top':
      return { x: 0, y: -distance };
    case 'left':
      return { x: -distance, y: 0 };
    case 'right':
      return { x: distance, y: 0 };
    default:
      return { x: 0, y: distance };
  }
}

export function ScrollReveal({
  children,
  className,
  style,
  id,
  as = 'div',
  staggerChildren = true,
  from = 'bottom',
  fromCycle,
  distance = 28,
  stagger = 0.08,
  duration = 0.85,
  ease = 'expo.out',
  rootMargin = '0px 0px -12% 0px',
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  // `fromCycle` is almost always written as an inline array literal, which is a
  // fresh identity on every render. Depending on it directly re-ran the effect
  // continuously, re-hiding the children each time. The joined key changes only
  // when the directions actually change.
  const cycleKey = fromCycle?.join(',') ?? '';

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return; // The default rendered state is visible.

    const targets: HTMLElement[] = staggerChildren
      ? (Array.from(el.children) as HTMLElement[])
      : [el as HTMLElement];
    if (targets.length === 0) return;

    const cycle = cycleKey ? (cycleKey.split(',') as RevealFrom[]) : null;
    const directionFor = (index: number): RevealFrom =>
      cycle && cycle.length > 0 ? cycle[index % cycle.length] : from;

    targets.forEach((target, index) => {
      const { x, y } = offsetFor(directionFor(index), distance);
      gsap.set(target, { opacity: 0, x, y });
    });

    const cancel = observeOnce(
      el,
      () => {
        const willChange = withWillChange(targets, 'transform, opacity');
        gsap.to(targets, {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          ease,
          stagger,
          overwrite: 'auto',
          onStart: willChange.onStart,
          onComplete: () => {
            willChange.onComplete();
            // Drop the transform so hover lifts on the children are not
            // fighting a leftover translate.
            gsap.set(targets, { clearProps: 'transform' });
          },
        });
      },
      rootMargin
    );

    return () => {
      cancel();
      gsap.set(targets, { clearProps: 'opacity,transform,willChange' });
    };
  }, [staggerChildren, from, cycleKey, distance, stagger, duration, ease, rootMargin]);

  return createElement(as, { ref, className, style, id }, children);
}
