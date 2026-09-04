import React from 'react';
import { clsx } from 'clsx';

export type GlassVariant = 'standard' | 'elevated' | 'subtle' | 'solid';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<GlassVariant, string> = {
  standard: 'bg-white/[0.055] backdrop-blur-md border-white/10 text-text-primary',
  elevated: 'bg-white/[0.085] backdrop-blur-lg border-white/20 text-text-primary shadow-lg',
  subtle: 'bg-white/[0.035] backdrop-blur-sm border-white/[0.08] text-text-secondary',
  solid: 'bg-[#151518] border-white/10 text-text-primary',
};

/**
 * GlassCard Component
 * Liquid Glass material surface component implementing Section 5 of design-system/universal-travel-wallet.md.
 */
export function GlassCard({
  variant = 'standard',
  children,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        'rounded-md border p-4 transition-all duration-200',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
