/**
 * Shared motion utilities.
 *
 * Adapted from the KP reference build's `src/lib/motion.ts`, whose contract
 * this project now follows as well:
 *
 *  - Entrance animations are triggered by IntersectionObserver, never by
 *    ScrollTrigger. A scroll-position plugin has to recompute start/end points
 *    against a smooth-scroll runtime on every scrolled frame; an observer costs
 *    nothing until it fires, and it keeps working when animation frames are
 *    throttled.
 *  - Per-frame work runs on `gsap.ticker` only, and only while the element is
 *    on screen.
 *  - `will-change` is set immediately before a tween and cleared the moment it
 *    finishes, so idle sections never hold a compositor layer.
 *  - Everything respects `prefers-reduced-motion` (Rule 42, Point 91).
 *
 * ScrollTrigger is still the right tool for genuinely scroll-*scrubbed* motion
 * (parallax, pinning); it is these one-shot reveals it was wrong for.
 */

import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fires `onEnter` the first time `el` crosses into view, then disconnects.
 *
 * The default `rootMargin` triggers when the element is ~18% up from the bottom
 * edge — the observer equivalent of ScrollTrigger's `start: "top 82%"`.
 *
 * @returns a cancel function, safe to call after the observer has fired.
 */
export function observeOnce(
  el: Element,
  onEnter: () => void,
  rootMargin = '0px 0px -18% 0px'
): () => void {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      onEnter();
    },
    { rootMargin, threshold: 0 }
  );
  observer.observe(el);
  return () => observer.disconnect();
}

/**
 * Runs a `gsap.ticker` callback only while `el` is on screen.
 *
 * The callback is added when the element scrolls in and removed when it scrolls
 * out, so an off-screen section costs nothing per frame.
 *
 * @returns a full cleanup function.
 */
export function tickWhileVisible(
  el: Element,
  onTick: () => void,
  options?: { onEnter?: () => void; onLeave?: () => void }
): () => void {
  let active = false;

  // The ticker is shared with Lenis. An exception thrown from one component's
  // tick must never take page scrolling down with it, so a throwing callback
  // logs once and ejects itself.
  const safeTick = () => {
    try {
      onTick();
    } catch (error) {
      console.error('Animation tick failed — removing it:', error);
      active = false;
      gsap.ticker.remove(safeTick);
    }
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true;
        options?.onEnter?.();
        gsap.ticker.add(safeTick);
      } else if (!entry.isIntersecting && active) {
        active = false;
        gsap.ticker.remove(safeTick);
        options?.onLeave?.();
      }
    },
    { threshold: 0 }
  );
  observer.observe(el);

  return () => {
    observer.disconnect();
    if (active) gsap.ticker.remove(safeTick);
  };
}

/** Sets `will-change` right before a tween and clears it when the tween ends. */
export function withWillChange(
  targets: Element | Element[],
  props: string
): { onStart: () => void; onComplete: () => void } {
  const list = Array.isArray(targets) ? targets : [targets];
  return {
    onStart: () => list.forEach((t) => ((t as HTMLElement).style.willChange = props)),
    onComplete: () => list.forEach((t) => ((t as HTMLElement).style.willChange = 'auto')),
  };
}

/**
 * Runs `play` once the loading screen has finished, or immediately if it
 * already has.
 *
 * `LoadingScreen` marks `<html>` with `page-revealed` and dispatches
 * `utw:loaded`; a hero entrance that ignored both would play out of sight
 * behind the still-closed loader panels.
 *
 * @returns a cleanup function that detaches the listener.
 */
export function onPageRevealed(play: () => void, timeoutMs = 6000): () => void {
  if (typeof document === 'undefined') return () => undefined;

  if (document.documentElement.classList.contains('page-revealed')) {
    play();
    return () => undefined;
  }

  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    play();
  };

  // The hero hides its own copy before animating it in, so a reveal signal
  // that never arrives would leave the first screen blank. After `timeoutMs`
  // the entrance plays regardless.
  const fallback = window.setTimeout(run, timeoutMs);
  window.addEventListener('utw:loaded', run, { once: true });

  return () => {
    window.clearTimeout(fallback);
    window.removeEventListener('utw:loaded', run);
  };
}
