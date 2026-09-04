import React from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent/20 hover:bg-accent/30 text-accent-strong border-accent/40 font-medium shadow-sm',
  secondary: 'bg-white/10 hover:bg-white/15 text-text-primary border-white/20',
  ghost: 'bg-transparent hover:bg-white/5 text-text-secondary border-transparent',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs rounded-sm gap-1.5',
  md: 'h-11 px-4 text-sm rounded-md gap-2',
  lg: 'h-13 px-6 text-base rounded-lg gap-2.5',
};

/**
 * GlassButton Component
 * Liquid Glass button component implementing Section 13 of design-system/universal-travel-wallet.md.
 */
export function GlassButton({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: GlassButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center border transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none min-h-[44px] cursor-pointer',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
