import React from 'react';
import { clsx } from 'clsx';

export type GradientRole = 
  | 'primary'
  | 'blue'
  | 'cyan'
  | 'purple'
  | 'magenta'
  | 'green'
  | 'teal'
  | 'orange'
  | 'amber'
  | 'red'
  | 'pink'
  | 'indigo';

export type TileSize = 'sm' | 'md' | 'lg' | 'xl';

export interface GradientIconTileProps {
  icon: React.ReactNode;
  role?: GradientRole;
  size?: TileSize;
  className?: string;
}

const GRADIENT_ROLES: Record<GradientRole, string> = {
  primary: 'from-[#4DA3FF] to-[#68B4FF]',
  blue: 'from-[#3B82F6] to-[#60A5FA]',
  cyan: 'from-[#06B6D4] to-[#38BDF8]',
  purple: 'from-[#8B5CF6] to-[#C084FC]',
  magenta: 'from-[#D946EF] to-[#F472B6]',
  green: 'from-[#10B981] to-[#34D399]',
  teal: 'from-[#14B8A6] to-[#2DD4BF]',
  orange: 'from-[#F97316] to-[#FB923C]',
  amber: 'from-[#F59E0B] to-[#FBBF24]',
  red: 'from-[#EF4444] to-[#F87171]',
  pink: 'from-[#EC4899] to-[#F472B6]',
  indigo: 'from-[#6366F1] to-[#818CF8]',
};

const TILE_SIZES: Record<TileSize, { tile: string; icon: string }> = {
  sm: { tile: 'w-8 h-8 rounded-sm p-1.5', icon: 'w-4 h-4' },
  md: { tile: 'w-10 h-10 rounded-md p-2', icon: 'w-5 h-5' },
  lg: { tile: 'w-12 h-12 rounded-lg p-2.5', icon: 'w-6 h-6' },
  xl: { tile: 'w-16 h-16 rounded-xl p-3.5', icon: 'w-8 h-8' },
};

/**
 * GradientIconTile Component
 * Authoritative visual accent container from design-system/universal-travel-wallet.md (Section 4.1).
 * Encapsulates small icon containers with curated linear-gradient backgrounds.
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
        'relative inline-flex items-center justify-center shrink-0 bg-gradient-to-br border border-white/20 shadow-sm text-white transition-transform active:scale-95',
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
