'use client';

import Link from 'next/link';
import { SoftCard } from '../common/SoftCard';
import { softButtonClasses } from '../common/SoftButton';
import { ScrollReveal } from '../common/ScrollReveal';

/**
 * The closing call to action.
 *
 * The pointer-tracked tilt this card used to own by itself now lives in
 * `SoftCard`, so every card in the product hovers the same way and this section
 * no longer carries its own copy of the motion values.
 */
export function CTASection() {
  return (
    <section id="get-started" className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
      <ScrollReveal distance={44} staggerChildren={false} from="bottom" className="mx-auto max-w-3xl">
        <SoftCard
          variant="floating"
          className="flex flex-col items-center gap-5 py-10 text-center sm:py-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Ready for your next trip?
          </h2>
          <p className="max-w-md text-sm text-text-secondary sm:text-base">
            No account, no server, no signup. Your data stays on your device.
          </p>
          <Link href="/trips/new" className={softButtonClasses('primary', 'lg', 'px-7')}>
            Create your first trip
          </Link>
        </SoftCard>
      </ScrollReveal>
    </section>
  );
}
