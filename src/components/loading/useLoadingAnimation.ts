import { useEffect } from 'react';
import gsap from 'gsap';

interface Refs {
  overlay: React.RefObject<HTMLDivElement | null>;
  leftPanel: React.RefObject<HTMLDivElement | null>;
  rightPanel: React.RefObject<HTMLDivElement | null>;
  seam: React.RefObject<HTMLDivElement | null>;
  logo: React.RefObject<HTMLDivElement | null>;
  title: React.RefObject<HTMLDivElement | null>;
  subtitle: React.RefObject<HTMLDivElement | null>;
}

export function useLoadingAnimation(refs: Refs) {
  useEffect(() => {
    const { overlay, leftPanel, rightPanel, seam, logo, title, subtitle } = refs;
    if (
      !overlay.current || !leftPanel.current || !rightPanel.current ||
      !seam.current || !logo.current || !title.current || !subtitle.current
    ) return;

    const reveal = () => {
      if (overlay.current) overlay.current.style.display = 'none';
      document.body.style.overflow = '';
      document.documentElement.classList.add('page-revealed');
      window.dispatchEvent(new Event('utw:loaded'));
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      reveal();
      return;
    }

    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

    tl.set(leftPanel.current, { x: '0%' })
      .set(rightPanel.current, { x: '0%' })
      .set(seam.current, { opacity: 0 })
      .set(logo.current, { opacity: 0, scale: 0.7, rotateY: 15 })
      .set(title.current, { opacity: 0, y: 16 })
      .set(subtitle.current, { opacity: 0, y: 10 });

    tl.to(seam.current, { opacity: 1, duration: 0.4, ease: 'power2.out' });

    tl.to(logo.current, {
      opacity: 1, scale: 1, rotateY: 0, duration: 0.6, ease: 'back.out(1.4)',
    }, '+=0.05');

    tl.to(logo.current, { filter: 'brightness(1.25)', duration: 0.2 }, '+=0.1');
    tl.to(logo.current, { filter: 'brightness(1)', duration: 0.4 });

    tl.to(title.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.25');
    tl.to(subtitle.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '+=0.05');

    tl.to({}, { duration: 0.45 });

    tl.to([logo.current, title.current, subtitle.current], {
      opacity: 0, y: -10, duration: 0.28, ease: 'power2.in',
    });
    tl.to(seam.current, { opacity: 0, duration: 0.2 }, '<');

    tl.to(leftPanel.current, { x: '-102%', duration: 1.2, ease: 'power4.inOut' });
    tl.to(rightPanel.current, { x: '102%', duration: 1.2, ease: 'power4.inOut' }, '<');

    tl.add(reveal);

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
