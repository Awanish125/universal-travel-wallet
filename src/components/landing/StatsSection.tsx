'use client';

/**
 * StatsSection — the three headline numbers beneath the hero copy.
 *
 * Rendered as a panel carrying the same sweeping accent border as `SoftCard`
 * and the capability pills, through the shared `animated-gradient-border`
 * utility. Its sweep runs slower than the pills' so the eye reads it as one
 * calm surface rather than as another row of chips.
 *
 * The real figures are in the markup, so a reduced-motion visitor, a crawler
 * and a no-JS visitor all read the finished numbers. The count-up only rewrites
 * text that is already correct.
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { observeOnce, prefersReducedMotion, withWillChange } from '../../lib/motion';
import { InfinityMark } from '../common/InfinityMark';

const STATS: Array<{ value: number; suffix: string; label: string }> = [
  { value: 100, suffix: '%', label: 'Offline first' },
  { value: 180, suffix: '+', label: 'Currencies supported' },
];

export function StatsSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const items = gsap.utils.toArray<HTMLElement>('[data-stat-item]', root);
    const values = gsap.utils.toArray<HTMLElement>('[data-stat-value]', root);
    if (items.length === 0) return;

    // Counting starts partway to the target rather than from zero, so it reads
    // as a tally settling rather than a number booting up.
    const counters = values.map((el) => {
      const target = Number(el.dataset.value) || 0;
      return { el, value: target * 0.65, target, suffix: el.dataset.suffix ?? '' };
    });

    gsap.set(items, { opacity: 0, y: 20 });

    const cancel = observeOnce(root, () => {
      const willChange = withWillChange(items, 'transform, opacity');
      const timeline = gsap.timeline();

      timeline
        .to(items, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: 'expo.out',
          onStart: willChange.onStart,
          onComplete: () => {
            willChange.onComplete();
            gsap.set(items, { clearProps: 'transform' });
          },
        })
        .to(
          counters,
          {
            value: (index: number) => counters[index].target,
            duration: 1,
            ease: 'power2.out',
            onUpdate() {
              counters.forEach((counter) => {
                counter.el.textContent =
                  Math.round(counter.value).toLocaleString() + counter.suffix;
              });
            },
          },
          '<0.1'
        );
    });

    return () => {
      cancel();
      gsap.set(items, { clearProps: 'opacity,transform,willChange' });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      style={
        {
          '--card-fill': 'var(--surface)',
          '--border-spin-duration': '11s',
        } as React.CSSProperties
      }
      className="animated-gradient-border mt-10 flex w-full max-w-2xl flex-wrap items-center justify-center gap-8 rounded-sheet px-6 py-6 shadow-clay-convex sm:gap-14 sm:px-10"
    >
      {STATS.map((stat) => (
        <div key={stat.label} data-stat-item className="flex flex-col items-center">
          <div className="financial-num text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            <span data-stat-value data-value={stat.value} data-suffix={stat.suffix}>
              {stat.value.toLocaleString()}
              {stat.suffix}
            </span>
          </div>
          <div className="mt-0.5 text-xs font-medium text-text-muted">{stat.label}</div>
        </div>
      ))}

      <div aria-hidden className="hidden h-8 w-px bg-border-strong sm:block" />

      <div data-stat-item className="flex flex-col items-center">
        <div className="flex h-[1.9rem] items-center text-2xl text-text-primary sm:h-[2.25rem] sm:text-3xl">
          <InfinityMark />
        </div>
        <div className="mt-0.5 text-xs font-medium text-text-muted">Unlimited trips</div>
      </div>
    </div>
  );
}
