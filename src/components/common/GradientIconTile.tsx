import React from 'react';
import { clsx } from 'clsx';

export type GradientRole =
  | 'primary'
  | 'lavender'
  | 'mint'
  | 'pink'
  | 'peach'
  | 'sky'
  | 'coral'
  | 'amber'
  | 'teal';

export type TileSize = 'sm' | 'md' | 'lg' | 'xl';

export interface GradientIconTileProps {
  icon: React.ReactNode;
  role?: GradientRole;
  size?: TileSize;
  className?: string;
}

const GRADIENT_ROLES: Record<GradientRole, string> = {
  primary: 'bg-gradient-clay-primary',
  lavender: 'bg-gradient-clay-lavender',
  mint: 'bg-gradient-clay-mint',
  pink: 'bg-gradient-clay-pink',
  peach: 'bg-gradient-clay-peach',
  sky: 'bg-gradient-clay-sky',
  coral: 'bg-gradient-clay-coral',
  amber: 'bg-gradient-clay-amber',
  teal: 'bg-gradient-clay-teal',
};

const TILE_SIZES: Record<TileSize, { tile: string; icon: string }> = {
  sm: { tile: 'w-8 h-8 rounded-sm p-1.5', icon: 'w-4 h-4' },
  md: { tile: 'w-10 h-10 rounded-md p-2', icon: 'w-5 h-5' },
  lg: { tile: 'w-12 h-12 rounded-lg p-2.5', icon: 'w-6 h-6' },
  xl: { tile: 'w-16 h-16 rounded-xl p-3.5', icon: 'w-8 h-8' },
};

/**
 * GradientIconTile — puffy clay gradient icon container.
 * Implements design-system/universal-travel-wallet.md Section 4.1.
 * Pastel/matte gradients only, dual-tone clay shadow, deterministic role assignment.
 */
export function GradientIconTile({
  icon,
  role = 'primary',
  size = 'md',
  className,
}: GradientIconTileProps) {
  const gradientClass = GRADIENT_ROLES[role] || GRADIENT_ROLES.primary;
  const sizeConfig = TILE_SIZES[size] || TILE_SIZES.md;

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center shrink-0 text-white shadow-clay-convex-sm transition-transform active:scale-95',
        gradientClass,
        sizeConfig.tile,
        className
      )}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
            className: clsx(sizeConfig.icon, (icon.props as { className?: string })?.className),
          })
        : icon}
    </div>
  );
}
