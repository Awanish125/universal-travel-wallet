'use client';
import { useEffect } from 'react';

/**
 * Lenis smooth scroll, driven from GSAP's ticker so scroll-driven animation and
 * scroll position advance on the same frame.
 *
 * The ScrollTrigger bridge this used to register is gone: no component uses
 * ScrollTrigger any more. Entrance animations trigger on IntersectionObserver
 * and the pinned hero reads `window.scrollY` directly on the ticker — see
 * `src/lib/motion.ts` for the reasoning.
 *
 * design-system/universal-travel-wallet.md Section 27.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis: import('lenis').default | undefined;
    let tickerFn: ((time: number) => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { default: gsap }] = await Promise.all([
        import('lenis'),
        import('gsap'),
      ]);

      if (cancelled) return;

      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    })();

    return () => {
      cancelled = true;
      if (tickerFn) {
        import('gsap').then(({ default: gsap }) => gsap.ticker.remove(tickerFn!));
      }
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
