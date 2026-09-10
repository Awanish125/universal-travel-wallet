import type { GradientRole } from '../components/common/GradientIconTile';

/**
 * Maps a category's stored colour name onto a design-system gradient role.
 *
 * Category icons used to be styled with interpolated classes like
 * `bg-${color}-100`, which Tailwind cannot see when it scans the source — those
 * classes were never generated, so the icons rendered with no colour at all.
 * A fixed table keeps the assignment deterministic, as Rule 73 requires, and
 * keeps every screen showing a category the same way.
 */
const COLOR_TO_GRADIENT: Record<string, GradientRole> = {
  emerald: 'mint',
  green: 'mint',
  lime: 'mint',
  teal: 'teal',
  cyan: 'teal',
  sky: 'sky',
  blue: 'sky',
  indigo: 'primary',
  violet: 'lavender',
  purple: 'lavender',
  fuchsia: 'pink',
  pink: 'pink',
  rose: 'coral',
  red: 'coral',
  orange: 'peach',
  amber: 'amber',
  yellow: 'amber',
  gray: 'primary',
  slate: 'primary',
};

export function gradientRoleForCategory(color: string | undefined): GradientRole {
  return COLOR_TO_GRADIENT[color ?? ''] ?? 'primary';
}
