'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const count100Ref = useRef<HTMLSpanElement>(null);
  const count180Ref = useRef<HTMLSpanElement>(null);
  const infinityRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);

  const isInView = useInView(containerRef, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    (async () => {
      const { default: gsap } = await import('gsap');

      const target100 = { val: 0 };
      const target180 = { val: 0 };

      // Animate 0 -> 100
      gsap.to(target100, {
        val: 100,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => {
          if (count100Ref.current) {
            count100Ref.current.textContent = Math.floor(target100.val).toString();
          }
        },
      });

      // Animate 0 -> 180
      gsap.to(target180, {
        val: 180,
        duration: 2.0,
        ease: 'power2.out',
        onUpdate: () => {
          if (count180Ref.current) {
            count180Ref.current.textContent = Math.floor(target180.val).toString();
          }
        },
      });

      // Animate infinity scale & fade
      if (infinityRef.current) {
        gsap.fromTo(
          infinityRef.current,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.7)' }
        );
      }
    })();
  }, [isInView]);

  return (
    <div
      ref={containerRef}
      className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-14 border-t border-border/60 pt-8 w-full max-w-2xl mx-auto"
    >
      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="flex flex-col items-center">
        <div className="financial-num text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          <span ref={count100Ref}>0</span>%
        </div>
        <div className="text-xs font-medium text-text-muted mt-0.5">Offline First</div>
      </motion.div>

      <div className="hidden sm:block h-8 w-[1px] bg-border/80" />

      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="flex flex-col items-center">
        <div className="financial-num text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          <span ref={count180Ref}>0</span>+
        </div>
        <div className="text-xs font-medium text-text-muted mt-0.5">Currencies Supported</div>
      </motion.div>

      <div className="hidden sm:block h-8 w-[1px] bg-border/80" />

      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="flex flex-col items-center">
        <div className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          <span ref={infinityRef} className="inline-block">
            ∞
          </span>
        </div>
        <div className="text-xs font-medium text-text-muted mt-0.5">Unlimited Trips</div>
      </motion.div>
    </div>
  );
}
