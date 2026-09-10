'use client';

import React, { useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  HTMLMotionProps,
} from 'framer-motion';
import { CardAmbience } from './CardAmbience';

export type SoftCardVariant = 'standard' | 'elevated' | 'floating' | 'inset';

export interface SoftCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: SoftCardVariant;
  /** Adds the press/tap feedback of a control. */
  interactive?: boolean;
  /**
   * The pointer-tracking 3D tilt. On by default — it is the house hover for
   * every card. Set false for a card inside another tilting card, where two
   * perspectives fight each other.
   */
  tilt?: boolean;
  /**
   * Drifting clouds and a small flock crossing the card. On by default, but
   * skipped automatically on anything too small to read as a scene.
   */
  ambience?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<SoftCardVariant, string> = {
  standard: 'shadow-clay-convex',
  elevated: 'shadow-clay-elevated',
  floating: 'shadow-clay-floating',
  inset: 'shadow-clay-concave',
};

/**
 * Every card is filled from the same token, so a card reads the same wherever
 * it appears. The variants differ in depth, not in colour.
 */
const CARD_FILL = 'var(--surface-strong)';

/** Below this, a card is a list row: no clouds, no birds. */
const MIN_AMBIENCE_WIDTH = 260;
const MIN_AMBIENCE_HEIGHT = 116;

/**
 * SoftCard — the Claymorphic (day) / Neumorphic (night) card primitive.
 *
 * Carries the house hover: a small pointer-tracked 3D tilt with a spring, the
 * effect that used to live only on the call-to-action card.
 */
export function SoftCard({
  variant = 'standard',
  interactive = false,
  tilt = true,
  ambience = true,
  children,
  className,
  style,
  ...props
}: SoftCardProps) {
  const reducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [showAmbience, setShowAmbience] = useState(false);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22 };
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), spring);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), spring);

  const tiltEnabled = tilt && !reducedMotion;

  // Measured rather than guessed: the same component is a hero panel on one
  // screen and a wallet row on another.
  React.useEffect(() => {
    if (!ambience) return;
    const el = rootRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setShowAmbience(
        rect.width >= MIN_AMBIENCE_WIDTH && rect.height >= MIN_AMBIENCE_HEIGHT
      );
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // A ResizeObserver normally covers this, but a viewport change that does
    // not resize the element's own box (a zoom, an emulated viewport) would
    // otherwise leave a card measured at its first, possibly zero, size.
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ambience]);

  function handlePointerMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!tiltEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.div
      ref={rootRef}
      onMouseMove={tiltEnabled ? handlePointerMove : undefined}
      onMouseLeave={tiltEnabled ? handlePointerLeave : undefined}
      whileHover={tiltEnabled ? { scale: 1.015 } : undefined}
      whileTap={interactive && !reducedMotion ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={clsx(
        'animated-gradient-border relative rounded-2xl p-5 text-text-primary transition-shadow duration-200',
        VARIANT_CLASSES[variant],
        interactive && 'cursor-pointer select-none',
        className
      )}
      style={
        {
          '--card-fill': CARD_FILL,
          ...(tiltEnabled ? { rotateX, rotateY, transformPerspective: 900 } : null),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {showAmbience && <CardAmbience />}
      {/* Content sits above the ambience layer. */}
      <div className="relative">{children}</div>
    </motion.div>
  );
}
