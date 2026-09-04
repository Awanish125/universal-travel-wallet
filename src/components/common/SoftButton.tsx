'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion, HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface SoftButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-brand-accent text-white font-bold shadow-soft-accent hover:brightness-105',
  secondary: 'bg-surface text-foreground font-bold shadow-soft-outer hover:bg-surface-strong',
  ghost: 'bg-transparent text-muted-foreground shadow-none hover:text-foreground hover:bg-muted/30',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs rounded-xl gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-2xl gap-2.5',
};

import { triggerHaptic } from '../../hooks/useHaptics';

export function SoftButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  onClick,
  ...props
}: SoftButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    triggerHaptic(variant === 'primary' ? 'medium' : 'light');
    if (onClick) onClick(e as any);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleClick}
      className={clsx(
        'inline-flex items-center justify-center border-0 transition-colors disabled:opacity-50 disabled:pointer-events-none min-h-[44px] cursor-pointer select-none',
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
