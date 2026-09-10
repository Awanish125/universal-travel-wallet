'use client';

/**
 * Hero — the landing page's opening section.
 *
 * This is a normal section, not a pinned one. The KP reference build pins its
 * hero and scrubs the copy away because there is a full-bleed photograph behind
 * it to reveal; this product has no such image, so the same move would just
 * hold an empty stage while the visitor scrolled. Its entrance animation is
 * kept — see `HeroContent` — and its scroll behaviour is not.
 */

import { HeroContent } from './HeroContent';
import { StatsSection } from './StatsSection';

export function Hero() {
  return (
    <section className="relative flex min-h-[88svh] flex-col items-center justify-center px-5 pb-16 pt-12 sm:px-8 lg:px-12 lg:pt-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <HeroContent />
        <StatsSection />
      </div>
    </section>
  );
}
