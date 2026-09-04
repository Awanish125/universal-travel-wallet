'use client';
import { useEffect } from 'react';

/**
 * Lenis smooth scroll bridged into GSAP's ticker/ScrollTrigger so
 * scroll-driven (parallax) animations stay in sync with smooth-scroll
 * position instead of the raw native scroll event.
 * design-system/universal-travel-wallet.md Section 27.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lenis: import('lenis').default | undefined;
    let tickerFn: ((time: number) => void) | undefined;
    let cancelled = false;

    (async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('lenis'),
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      lenis.on('scroll', ScrollTrigger.update);

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
