'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';
import { triggerHaptic } from '../../hooks/useHaptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface SoftButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

/**
 * Buttons share the inputs' physical language (ADR 005): convex at rest,
 * concave when pressed, lit by the accent rather than filled with a flat block
 * of it. The surfaces live in `globals.css` as `.btn-soft*` so a button and a
 * field are shaded from the same tokens and can never drift apart.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-soft btn-soft-primary font-bold',
  secondary: 'btn-soft btn-soft-secondary font-bold',
  ghost:
    'rounded-xl font-semibold text-muted-foreground transition-colors hover:bg-accent-soft hover:text-brand-accent',
  // Clay like the rest — the destructive intent is carried by the type colour,
  // not by a slab of red.
  danger: 'btn-soft font-bold text-destructive',
};

/**
 * Heights are floors, not fixed values, so a caller can add vertical padding
 * for a taller call-to-action without fighting a `h-*` class.
 */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[36px] px-3 text-xs gap-1.5',
  md: 'min-h-[44px] px-4 text-sm gap-2',
  lg: 'min-h-[52px] px-6 text-base gap-2.5',
};

/**
 * The button's classes, for the cases where the control has to be a link.
 * A `<Link>` wrapped in a `<button>` is invalid markup and breaks keyboard
 * activation, so a link that looks like a button wears these instead.
 */
export function softButtonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string
): string {
  return clsx(
    'inline-flex cursor-pointer select-none items-center justify-center no-underline',
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className
  );
}

export function SoftButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
  disabled,
  ...props
}: SoftButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic(variant === 'primary' ? 'medium' : 'light');
    onClick?.(event);
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        'inline-flex cursor-pointer select-none items-center justify-center',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
