'use client';

import { motion } from 'framer-motion';
import { Globe, Coins, Users, ShieldCheck } from 'lucide-react';

const FEATURES = [
  { label: 'Works Offline', icon: Globe },
  { label: 'Any Currency', icon: Coins },
  { label: 'For Solo & Groups', icon: Users },
  { label: 'Built for Travelers', icon: ShieldCheck },
];

/**
 * The four capability pills under the hero copy.
 *
 * Each pill carries the same sweeping accent border as `SoftCard`, through the
 * shared `animated-gradient-border` utility — one implementation, not a copy
 * (Rule 15). The sweep is staggered per pill so the four do not pulse in
 * lockstep, which would read as a loading state rather than as decoration.
 *
 * Entrances are not animated here: each pill is a `data-hero-item`, so the
 * hero's own GSAP timeline fades them up at the tail of its stagger. Running a
 * second, independent entrance would fight it for the same properties.
 */
export function FeatureHighlights() {
  return (
    <div className="mx-auto mt-12 grid w-full max-w-3xl grid-cols-2 gap-3.5 border-t border-border pt-8 sm:grid-cols-4">
      {FEATURES.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            data-hero-item
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            style={
              {
                '--card-fill': 'var(--surface-strong)',
                '--border-spin-duration': `${5.5 + index * 0.9}s`,
              } as React.CSSProperties
            }
            className="animated-gradient-border group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl p-2.5 shadow-clay-convex-sm"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent transition-transform duration-200 group-hover:scale-110">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-text-primary transition-colors group-hover:text-accent">
              {item.label}
            </span>

            {/* Accent underline that draws in on hover. */}
            <span className="absolute bottom-0 left-3 right-3 h-[2px] w-0 bg-gradient-clay-primary transition-all duration-300 group-hover:w-[calc(100%-24px)]" />
          </motion.div>
        );
      })}
    </div>
  );
}
