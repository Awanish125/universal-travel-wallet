'use client';
import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Bubble {
  symbol: string;
  label: string;
  gradient: string;
  style: React.CSSProperties;
  floatDuration: number;
  floatDelay: number;
}

const BUBBLES: Bubble[] = [
  { symbol: '$', label: 'US Dollar', gradient: 'bg-gradient-clay-sky', style: { left: '2%', top: '2%' }, floatDuration: 3.4, floatDelay: 0 },
  { symbol: '¥', label: 'Japanese Yen', gradient: 'bg-gradient-clay-amber', style: { right: '0%', top: '10%' }, floatDuration: 4.1, floatDelay: 0.4 },
  { symbol: '€', label: 'Euro', gradient: 'bg-gradient-clay-mint', style: { left: '-6%', top: '48%' }, floatDuration: 3.8, floatDelay: 0.8 },
  { symbol: '£', label: 'British Pound', gradient: 'bg-gradient-clay-lavender', style: { left: '6%', bottom: '0%' }, floatDuration: 4.4, floatDelay: 0.2 },
  { symbol: 'Rp', label: 'Indonesian Rupiah', gradient: 'bg-gradient-clay-coral', style: { right: '-4%', bottom: '10%' }, floatDuration: 3.6, floatDelay: 0.6 },
];

/**
 * Currency bubbles floating around the hero wallet mark. Motion drives the
 * per-bubble staggered entrance + continuous float; GSAP drives one slow,
 * shared sway across the whole cluster so it never feels perfectly static.
 */
export function CurrencyOrbit({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !groupRef.current) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import('gsap');
      if (cancelled || !groupRef.current) return;
      const tween = gsap.to(groupRef.current, {
        xPercent: 2.2,
        duration: 5.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
      cleanup = () => tween.kill();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [reducedMotion]);

  return (
    <div ref={groupRef} className="relative">
      {children}
      {BUBBLES.map((bubble, i) => (
        <motion.div
          key={bubble.symbol}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={
            reducedMotion
              ? { opacity: 1, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -9, 0] }
          }
          transition={
            reducedMotion
              ? { duration: 0.5, delay: 0.5 + i * 0.12 }
              : {
                  opacity: { duration: 0.5, delay: 0.5 + i * 0.12, ease: 'easeOut' },
                  scale: { duration: 0.5, delay: 0.5 + i * 0.12, ease: 'backOut' },
                  y: {
                    duration: bubble.floatDuration,
                    delay: bubble.floatDelay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }
          }
          className="absolute z-20"
          style={bubble.style}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-clay-convex-sm sm:h-12 sm:w-12 sm:text-base ${bubble.gradient}`}
            aria-label={bubble.label}
          >
            {bubble.symbol}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
