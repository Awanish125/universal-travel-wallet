'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Plane } from 'lucide-react';
import { FeatureHighlights } from './FeatureHighlights';
import { StatsSection } from './StatsSection';

export function HeroContent() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const line3Ref = useRef<HTMLSpanElement>(null);
  const highlight1Ref = useRef<HTMLSpanElement>(null);
  const highlight2Ref = useRef<HTMLSpanElement>(null);

  const [btnHovered, setBtnHovered] = useState(false);

  // Section 11: GSAP Headline Cinematic Animation
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    (async () => {
      const { default: gsap } = await import('gsap');

      const tl = gsap.timeline({ delay: 0.45 });

      // Heading container starts slightly below
      if (headlineRef.current) {
        gsap.set(headlineRef.current, { y: 24, opacity: 0 });
        tl.to(headlineRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      }

      // First line fades in and moves upward
      if (line1Ref.current) {
        gsap.set(line1Ref.current, { y: 30, opacity: 0 });
        tl.to(line1Ref.current, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
      }

      // Second line follows
      if (line2Ref.current) {
        gsap.set(line2Ref.current, { y: 30, opacity: 0 });
        tl.to(line2Ref.current, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35');
      }

      // Third line follows
      if (line3Ref.current) {
        gsap.set(line3Ref.current, { y: 30, opacity: 0 });
        tl.to(line3Ref.current, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.35');
      }

      // Highlighted words animate slightly later
      if (highlight1Ref.current && highlight2Ref.current) {
        gsap.set([highlight1Ref.current, highlight2Ref.current], { scale: 0.95 });
        tl.to(
          [highlight1Ref.current, highlight2Ref.current],
          {
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.5)',
          },
          '-=0.2'
        );
      }

      cleanup = () => tl.kill();
    })();

    return () => cleanup?.();
  }, []);

  return (
    <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
      {/* 450ms: Hero Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45, ease: 'easeOut' }}
        className="mb-6 inline-flex items-center gap-2 self-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-sky-500 dark:text-sky-400 uppercase shadow-sm backdrop-blur-sm"
      >
        <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
        YOUR TRAVEL COMPANION
      </motion.div>

      {/* 550ms: Main Headline with GSAP Cinematic Line Reveal */}
      <h1
        ref={headlineRef}
        className="text-4xl font-extrabold leading-[1.12] tracking-tight text-text-primary sm:text-6xl lg:text-7xl text-center"
      >
        <span ref={line1Ref} className="block">
          One wallet for every
        </span>
        <span ref={line2Ref} className="block mt-1 sm:mt-2">
          <span
            ref={highlight1Ref}
            className="inline-block bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent"
          >
            currency
          </span>
          ,{' '}
          <span
            ref={highlight2Ref}
            className="inline-block bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-400 bg-clip-text text-transparent"
          >
            every trip
          </span>
          ,
        </span>
        <span ref={line3Ref} className="block mt-1 sm:mt-2 text-text-primary">
          everywhere.
        </span>
      </h1>

      {/* 700ms: Supporting Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
        className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl text-center"
      >
        Track trips, split expenses, exchange money, and settle up with friends — fully
        offline, in any currency, on any device.
      </motion.p>

      {/* 800ms - 900ms: Action Buttons */}
      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        {/* Primary CTA: "Start a trip" */}
        <motion.a
          href="#get-started"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8, type: 'spring', stiffness: 120 }}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          whileHover={{
            scale: 1.03,
            boxShadow: '0 0 32px rgba(59, 130, 246, 0.5)',
          }}
          whileTap={{ scale: 0.96 }}
          className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all"
        >
          {/* Airplane travels forward on hover */}
          <motion.span
            animate={btnHovered ? { x: 5, y: -2, rotate: -40 } : { x: 0, y: 0, rotate: -45 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="inline-block"
          >
            <Plane className="h-4 w-4" />
          </motion.span>
          <span>Start a trip</span>
          {/* Arrow follows movement */}
          <motion.span
            animate={btnHovered ? { x: 4 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="inline-block"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </motion.a>

        {/* Secondary CTA: "See how it works" */}
        <motion.a
          href="#how-it-works"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9, type: 'spring', stiffness: 120 }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-7 py-3.5 text-sm font-semibold text-text-primary shadow-clay-convex-sm transition-all hover:border-accent/40"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent"
          >
            <Play className="h-3 w-3 fill-current ml-0.5" />
          </motion.div>
          <span>See how it works</span>
        </motion.a>
      </div>

      {/* Feature Row */}
      <FeatureHighlights />

      {/* Numbers Counter Statistics */}
      <StatsSection />
    </div>
  );
}
