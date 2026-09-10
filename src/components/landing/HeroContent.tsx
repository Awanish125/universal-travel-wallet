'use client';

/**
 * HeroContent — the hero's copy and its entrance.
 *
 * The entrance follows the KP reference build's hero:
 *  1. Supporting items (badge, rule, paragraph, buttons) fade up on a short
 *     stagger.
 *  2. The headline lines "rack focus": each snaps from oversized and heavily
 *     blurred to sharp and settled, 0.12s apart, on an `expo.out` curve. It
 *     reads like a lens pulling focus rather than a fade.
 *  3. Once settled, a slow idle loop dips one random letter of the plain lines
 *     and brings it back, so the headline never looks like a static image.
 *
 * The blur here is a transient property of the *animation*, not a material.
 * ADR 005 forbids `backdrop-filter` and translucent surfaces; a filter that
 * runs for 1.4s and ends at `blur(0px)` leaves no glass behind it.
 *
 * The whole sequence waits for the loading screen to finish, otherwise it
 * would play out of sight behind the still-closed loader panels.
 */

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Play, Plane } from 'lucide-react';
import { FeatureHighlights } from './FeatureHighlights';
import { ScrambleText } from '../common/ScrambleText';
import { softButtonClasses } from '../common/SoftButton';
import { onPageRevealed, prefersReducedMotion } from '../../lib/motion';

/** The three headline lines. The middle one carries the gradient treatment. */
const HEADLINE = {
  line1: 'One wallet for every',
  line2: 'currency, every trip,',
  line3: 'everywhere.',
};

export function HeroContent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = prefersReducedMotion();
    const focusLines = gsap.utils.toArray<HTMLElement>('[data-focus-line]', section);
    const regularItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]', section);

    let timeline: gsap.core.Timeline | null = null;
    const idleCalls: gsap.core.Tween[] = [];

    /**
     * Wraps each letter of the two plain lines in its own span so a single
     * random one can dip and recover. The gradient line is skipped: splitting
     * it would break `background-clip: text` across the fragments.
     */
    const startLetterDropout = () => {
      if (reduced) return;

      const letters: HTMLSpanElement[] = [];
      [focusLines[0], focusLines[2]].filter(Boolean).forEach((line) => {
        Array.from(line.childNodes).forEach((node) => {
          if (node.nodeType !== Node.TEXT_NODE) return;
          const fragment = document.createDocumentFragment();
          Array.from(node.textContent ?? '').forEach((char) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.display = 'inline';
            fragment.appendChild(span);
            if (char.trim()) letters.push(span);
          });
          node.replaceWith(fragment);
        });
      });
      if (letters.length === 0) return;

      const flicker = () => {
        const letter = letters[(Math.random() * letters.length) | 0];
        gsap
          .timeline({
            onComplete: () => {
              idleCalls.push(gsap.delayedCall(2.4 + Math.random() * 3.6, flicker));
            },
          })
          .to(letter, { opacity: 0.18, duration: 0.08, ease: 'power2.in' })
          .to(letter, { opacity: 1, duration: 0.45, ease: 'power2.out' });
      };
      idleCalls.push(gsap.delayedCall(1.5, flicker));
    };

    const play = () => {
      if (reduced) {
        gsap.set([...regularItems, ...focusLines], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'none',
        });
        return;
      }

      timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: startLetterDropout,
      });

      timeline
        .to(regularItems, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.075 })
        .fromTo(
          focusLines,
          { scale: 1.18, filter: 'blur(22px)', autoAlpha: 0, transformOrigin: '0% 100%' },
          {
            scale: 1,
            filter: 'blur(0px)',
            autoAlpha: 1,
            duration: 1.4,
            stagger: 0.12,
            ease: 'expo.out',
          },
          '<0.15'
        );
    };

    // Hidden here rather than in JSX, so a reduced-motion visitor and a failed
    // script both still see the copy.
    gsap.set(regularItems, { autoAlpha: reduced ? 1 : 0, y: reduced ? 0 : 24 });
    gsap.set(focusLines, { autoAlpha: reduced ? 1 : 0 });

    const cancel = onPageRevealed(play);

    return () => {
      cancel();
      timeline?.kill();
      idleCalls.forEach((call) => call.kill());
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
    >
      <div
        data-hero-item
        className="mb-6 inline-flex items-center gap-2 self-center rounded-full border border-accent/25 bg-accent-soft px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent"
      >
        <span className="h-2 w-2 rounded-full bg-accent" />
        <ScrambleText text="Your travel companion" duration={1} trigger="immediate" />
      </div>

      {/*
        The three lines are separate blocks with no literal space between them,
        so a screen reader would otherwise run them together. `aria-label`
        carries the real sentence and the animated lines are hidden from it.
      */}
      <h1
        aria-label={`${HEADLINE.line1} ${HEADLINE.line2} ${HEADLINE.line3}`}
        className="text-balance text-center text-4xl font-extrabold leading-[1.12] tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
      >
        <span aria-hidden="true">
          <span data-focus-line className="block">
            {HEADLINE.line1}
          </span>
          <span
            data-focus-line
            className="block bg-gradient-clay-primary bg-clip-text text-transparent"
          >
            {HEADLINE.line2}
          </span>
          <span data-focus-line className="block">
            {HEADLINE.line3}
          </span>
        </span>
      </h1>

      <span
        data-hero-item
        aria-hidden
        className="mt-7 block h-px w-16 bg-gradient-to-r from-accent/80 to-transparent sm:w-24"
      />

      <p
        data-hero-item
        className="mt-6 max-w-2xl text-center text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl"
      >
        Track trips, split expenses, change money and settle up with friends — fully
        offline, in any currency, on any device.
      </p>

      <div data-hero-item className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/trips/new"
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          className={softButtonClasses('primary', 'lg', 'group px-8')}
        >
          <motion.span
            animate={
              btnHovered && !reducedMotion
                ? { x: 5, y: -2, rotate: -40 }
                : { x: 0, y: 0, rotate: -45 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="inline-block"
          >
            <Plane className="h-4 w-4" />
          </motion.span>
          <span>Start a trip</span>
          <motion.span
            animate={btnHovered && !reducedMotion ? { x: 4 } : { x: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="inline-block"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </Link>

        <Link
          href="#how-it-works"
          className={softButtonClasses('secondary', 'lg', 'group px-7')}
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Play className="ml-0.5 h-3 w-3 fill-current" />
          </span>
          <span>See how it works</span>
        </Link>
      </div>

      <FeatureHighlights />
    </div>
  );
}
