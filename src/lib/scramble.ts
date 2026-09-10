/**
 * scrambleDecode — a left-to-right character reveal.
 *
 * Every character cycles through a set of glyphs while it is unresolved, then
 * locks in from the left as a GSAP tween scrubs a progress value from 0 to 1.
 *
 * Adapted from the KP reference build's `src/lib/scramble.ts`.
 */
import gsap from 'gsap';

/**
 * Glyphs shown while a character is still resolving. Block characters give the
 * effect its texture; the rest keep the line roughly its final width so the
 * layout does not jitter as it decodes.
 */
export const SCRAMBLE_GLYPHS = '█▓▒░ABCDEFGHIKLMNOPRSTUVXZ0123456789°./—';

function randomGlyph(): string {
  return SCRAMBLE_GLYPHS[(Math.random() * SCRAMBLE_GLYPHS.length) | 0];
}

/**
 * Scrambles `el`'s text and resolves it to `finalText`.
 *
 * Spaces are never scrambled, so word boundaries stay readable throughout.
 *
 * @returns the tween, so callers can kill it on unmount.
 */
export function scrambleDecode(
  el: HTMLElement,
  finalText: string,
  duration = 0.75,
  delay = 0
): gsap.core.Tween {
  const state = { progress: 0 };

  // Seed with a scrambled placeholder so the element is never briefly blank.
  el.textContent = finalText
    .split('')
    .map((char) => (char === ' ' ? ' ' : randomGlyph()))
    .join('');

  return gsap.to(state, {
    progress: 1,
    duration,
    delay,
    ease: 'none',
    onUpdate() {
      const resolved = Math.floor(state.progress * finalText.length);
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        const char = finalText[i];
        out += char === ' ' || i < resolved ? char : randomGlyph();
      }
      el.textContent = out;
    },
    onComplete() {
      el.textContent = finalText;
    },
  });
}
