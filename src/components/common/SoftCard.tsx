'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type SoftCardVariant = 'standard' | 'elevated' | 'floating' | 'inset';

export interface SoftCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: SoftCardVariant;
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<SoftCardVariant, string> = {
  standard: 'shadow-clay-convex',
  elevated: 'shadow-clay-elevated',
  floating: 'shadow-clay-floating',
  inset: 'shadow-clay-concave',
};

const VARIANT_FILL: Record<SoftCardVariant, string> = {
  standard: 'var(--surface)',
  elevated: 'var(--surface-strong)',
  floating: 'var(--surface-strong)',
  inset: 'var(--surface-subtle)',
};

/**
 * SoftCard — Framer Motion enhanced Claymorphic (day) / Neumorphic (night) card primitive.
 */
export function SoftCard({
  variant = 'standard',
  interactive = false,
  children,
  className,
  style,
  ...props
}: SoftCardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -3 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={clsx(
        'rounded-2xl p-5 text-text-primary transition-shadow duration-200 animated-gradient-border',
        VARIANT_CLASSES[variant],
        interactive && 'cursor-pointer select-none',
        className
      )}
      style={{ '--card-fill': VARIANT_FILL[variant], ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </motion.div>
  );
}
