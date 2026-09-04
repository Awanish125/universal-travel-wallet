'use client';

import { useEffect, useRef, useState } from 'react';
import { HeroContent } from './HeroContent';

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const contentColRef = useRef<HTMLDivElement>(null);

  // Track light mode state to pass to child components if needed
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const checkLight = () => {
      setIsLightMode(document.documentElement.classList.contains('light'));
    };
    checkLight();

    const observer = new MutationObserver(checkLight);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // GSAP Scroll Exit Parallax
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      if (!containerRef.current) return;

      const gctx = gsap.context(() => {
        // Content moves upward and fades slightly on scroll exit
        if (contentColRef.current) {
          gsap.to(contentColRef.current, {
            yPercent: -6,
            opacity: 0.9,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: 1,
            },
          });
        }
      }, containerRef);

      cleanup = () => gctx.revert();
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] overflow-hidden px-5 pt-12 pb-20 sm:px-8 lg:px-12 lg:pt-20 transition-colors duration-500 flex flex-col items-center justify-center"
    >
      {/* Background CSS radial glow wash (NO photographic background) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[700px] w-[1000px] -translate-x-1/2 rounded-full opacity-35 blur-[140px] transition-colors duration-500"
        style={{
          background: isLightMode
            ? 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.22) 0%, rgba(59, 130, 246, 0.14) 50%, transparent 75%)'
            : 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3) 0%, rgba(139, 92, 246, 0.18) 50%, transparent 75%)',
        }}
      />

      <div ref={contentColRef} className="mx-auto w-full max-w-5xl flex flex-col items-center">
        <HeroContent />
      </div>
    </section>
  );
}
