'use client';
import { useEffect, useRef } from 'react';

/**
 * A small distant bird silhouette that flies across its parent card.
 * Pure SVG + rAF transforms (no React state per frame, no new libraries).
 * Purely decorative: absolutely positioned, clipped to the card, pointer-events none.
 * Colour comes from the theme's own accent token via currentColor.
 */
export function CardBird() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const birdRef = useRef<SVGSVGElement>(null);
  const leftWingRef = useRef<SVGPathElement>(null);
  const rightWingRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !birdRef.current || !leftWingRef.current || !rightWingRef.current) return;
    const bird: SVGSVGElement = birdRef.current;
    const leftWing: SVGPathElement = leftWingRef.current;
    const rightWing: SVGPathElement = rightWingRef.current;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Static, subtle resting position — no flight, no wing motion.
      bird.style.transform = 'translate(72%, 32%) rotate(-4deg)';
      bird.style.opacity = '0.5';
      return;
    }

    let rafId = 0;
    let flight = newFlight();
    let startTime = performance.now();

    function newFlight() {
      const leftToRight = Math.random() < 0.5;
      return {
        leftToRight,
        startY: 18 + Math.random() * 40, // % of card height
        drift: (Math.random() - 0.5) * 26, // vertical drift over the crossing
        arc: 8 + Math.random() * 16, // sine arc amplitude
        duration: 7000 + Math.random() * 5000,
        delay: 1200 + Math.random() * 4200,
        flapSpeed: 4.2 + Math.random() * 2.2,
      };
    }

    function frame(now: number) {
      const elapsed = now - startTime;

      if (elapsed < flight.delay) {
        bird.style.opacity = '0';
        rafId = requestAnimationFrame(frame);
        return;
      }

      const t = (elapsed - flight.delay) / flight.duration;

      if (t >= 1) {
        flight = newFlight();
        startTime = performance.now();
        rafId = requestAnimationFrame(frame);
        return;
      }

      // Ease in/out so it accelerates in and glides out rather than moving linearly.
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const xPct = flight.leftToRight ? -10 + eased * 120 : 110 - eased * 120;
      const yPct = flight.startY + flight.drift * eased - Math.sin(t * Math.PI) * flight.arc;

      // Bank into the direction of travel, derived from the vertical slope.
      const slope = flight.drift / 100 - (Math.cos(t * Math.PI) * Math.PI * flight.arc) / 100;
      const bank = Math.max(-16, Math.min(16, slope * 40)) * (flight.leftToRight ? 1 : -1);

      // Fade at the edges so it never pops in or out.
      const edgeFade = Math.min(1, Math.min(t, 1 - t) / 0.12);

      bird.style.opacity = String(0.55 * edgeFade);
      bird.style.transform = `translate(${xPct}%, ${yPct}%) scaleX(${flight.leftToRight ? 1 : -1}) rotate(${bank}deg)`;

      const flap = Math.sin(elapsed / 1000 * flight.flapSpeed);
      const wingLift = 10 + flap * 12;
      leftWing.setAttribute('transform', `rotate(${-wingLift} 12 7)`);
      rightWing.setAttribute('transform', `rotate(${wingLift} 12 7)`);

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg text-accent"
    >
      <svg
        ref={birdRef}
        viewBox="0 0 24 14"
        width="22"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, willChange: 'transform, opacity' }}
      >
        <path ref={leftWingRef} d="M12 7 C 9 4, 6 3.4, 2.5 5" />
        <path ref={rightWingRef} d="M12 7 C 15 4, 18 3.4, 21.5 5" />
      </svg>
    </div>
  );
}
