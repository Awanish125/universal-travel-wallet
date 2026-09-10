'use client';

import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion, tickWhileVisible } from '../../lib/motion';

/**
 * CardAmbience — clouds drifting behind a small flock crossing the card.
 *
 * Purely decorative: clipped to the card, `aria-hidden`, `pointer-events: none`
 * and drawn behind the content.
 *
 * Everything is positioned in **pixels against the measured card**. An earlier
 * version used percentage transforms, which CSS resolves against the element's
 * own box — a 20px-wide bird moved 20px for `translateX(100%)`, so the birds
 * appeared to flap on the spot and the 110px clouds never left the left edge.
 *
 * Depth is what makes it read as three-dimensional rather than as stickers: one
 * `depth` value per object drives its size, its opacity and its speed together,
 * so distant things are small, faint and slow while near ones are large, solid
 * and quick.
 *
 * Perf contract (`src/lib/motion.ts`): every object on a card shares one tick,
 * added only while the card is on screen. Transforms are written directly, so
 * there is no React render per frame.
 */

interface Bird {
  el: SVGSVGElement | null;
  leftWing: SVGPathElement | null;
  rightWing: SVGPathElement | null;
  depth: number;
  scale: number;
  opacity: number;
  speed: number;
  leftToRight: boolean;
  /** Progress across the card, 0 to 1. */
  progress: number;
  baseY: number;
  drift: number;
  arc: number;
  flapSpeed: number;
  flapPhase: number;
  /** Seconds still to wait before this bird enters. */
  wait: number;
}

interface Cloud {
  el: SVGSVGElement | null;
  depth: number;
  scale: number;
  opacity: number;
  speed: number;
  x: number;
  baseY: number;
  bobAmplitude: number;
  bobSpeed: number;
  bobPhase: number;
  width: number;
}

interface Props {
  /** Defaults to a random 2–6, so no two cards share a flock. */
  birds?: number;
  clouds?: number;
}

const CLOUD_VIEW_W = 120;
const CLOUD_VIEW_H = 52;
const BIRD_VIEW_W = 24;

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * A cloud built as a row of circles sitting on a flat base.
 *
 * Circles guarantee every lobe is round — an earlier version placed free
 * ellipses, which could come out flat-sided and read as a smudge. The base
 * radii taper toward the ends so the silhouette is a cloud rather than a
 * sausage.
 */
function CloudShape({ seed }: { seed: number }) {
  const lobes = React.useMemo(() => {
    // A small deterministic generator, so a cloud keeps its shape between
    // renders instead of reshuffling on every paint.
    let state = (seed % 2147483647) + 1;
    const next = () => {
      state = (state * 16807) % 2147483647;
      return (state - 1) / 2147483646;
    };

    const count = 4 + Math.floor(next() * 3); // 4–6 lobes
    const baseY = 34;
    const spread = 88;
    const startX = 16;

    return Array.from({ length: count }, (_, index) => {
      const position = count === 1 ? 0.5 : index / (count - 1);
      // Taper: the middle lobes are the tallest, the ends the smallest.
      const taper = 0.55 + 0.45 * Math.sin(position * Math.PI);
      const radius = (9 + next() * 7) * taper;
      return {
        cx: startX + position * spread + (next() - 0.5) * 5,
        cy: baseY - radius * (0.55 + next() * 0.35),
        r: radius,
      };
    });
  }, [seed]);

  const baseLeft = Math.min(...lobes.map((l) => l.cx - l.r));
  const baseRight = Math.max(...lobes.map((l) => l.cx + l.r));

  return (
    <svg
      viewBox={`0 0 ${CLOUD_VIEW_W} ${CLOUD_VIEW_H}`}
      width={CLOUD_VIEW_W}
      height={CLOUD_VIEW_H}
      fill="currentColor"
      aria-hidden
    >
      {/* The flat underside every cloud has. */}
      <rect
        x={baseLeft}
        y={26}
        width={baseRight - baseLeft}
        height={8}
        rx={4}
      />
      {lobes.map((lobe, index) => (
        <circle key={index} cx={lobe.cx} cy={lobe.cy} r={lobe.r} />
      ))}
    </svg>
  );
}

export function CardAmbience({ birds, clouds = 2 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const birdRefs = useRef<Array<SVGSVGElement | null>>([]);
  const cloudRefs = useRef<Array<SVGSVGElement | null>>([]);
  const sizeRef = useRef({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);

  // Chosen once per mount, so counts and shapes are stable for this card.
  const birdCount = useRef(birds ?? 2 + Math.floor(Math.random() * 5)).current;
  const cloudSeeds = useRef(
    Array.from({ length: clouds }, () => 1 + Math.floor(Math.random() * 100000))
  ).current;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const measure = () => {
      const rect = root.getBoundingClientRect();
      sizeRef.current = { width: rect.width, height: rect.height };
      if (rect.width > 0 && rect.height > 0) setReady(true);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;

    const { width, height } = sizeRef.current;

    /** Distant objects are small, faint and slow; near ones large and quick. */
    const makeCloud = (el: SVGSVGElement | null, lane: number): Cloud => {
      const depth = randomBetween(0.15, 0.85);
      const scale = 0.55 + depth * 0.75;
      // Each cloud gets its own horizontal band, so two never sit on top of
      // one another — they used to be placed at random heights and overlap.
      const laneHeight = height / clouds;
      return {
        el,
        depth,
        scale,
        opacity: 0.02 + depth * 0.045,
        speed: 4 + depth * 12, // px per second
        // Staggered so they are spread across the card from the first frame
        // rather than all entering together.
        x: -CLOUD_VIEW_W * scale + ((lane + 0.35) / clouds) * (width + CLOUD_VIEW_W),
        baseY: lane * laneHeight + laneHeight * 0.5 - (CLOUD_VIEW_H * scale) / 2,
        bobAmplitude: randomBetween(1.5, 4),
        bobSpeed: randomBetween(0.12, 0.28),
        bobPhase: Math.random() * Math.PI * 2,
        width: CLOUD_VIEW_W * scale,
      };
    };

    const makeBird = (el: SVGSVGElement | null): Bird => {
      const depth = randomBetween(0.1, 1);
      return {
        el,
        leftWing: el?.querySelector<SVGPathElement>('[data-wing="l"]') ?? null,
        rightWing: el?.querySelector<SVGPathElement>('[data-wing="r"]') ?? null,
        depth,
        scale: 0.45 + depth * 0.85,
        opacity: 0.18 + depth * 0.4,
        speed: 0.045 + depth * 0.085, // progress per second
        leftToRight: Math.random() < 0.5,
        progress: 0,
        baseY: randomBetween(0.08, 0.72) * height,
        drift: randomBetween(-0.14, 0.14) * height,
        arc: randomBetween(0.04, 0.16) * height,
        flapSpeed: 5 + depth * 4,
        flapPhase: Math.random() * Math.PI * 2,
        wait: randomBetween(0, 7),
      };
    };

    const sky = cloudRefs.current.map((el, index) => makeCloud(el, index));
    const flock = birdRefs.current.map((el) => makeBird(el));

    if (prefersReducedMotion()) {
      // Parked, not animated — motion is what was opted out of, not the scene.
      sky.forEach((cloud) => {
        if (!cloud.el) return;
        cloud.el.style.opacity = String(cloud.opacity);
        cloud.el.style.transform = `translate(${cloud.x}px, ${cloud.baseY}px) scale(${cloud.scale})`;
      });
      flock.forEach((bird, index) => {
        if (!bird.el) return;
        bird.el.style.opacity = String(bird.opacity * 0.8);
        const x = ((index + 1) / (flock.length + 1)) * width;
        bird.el.style.transform = `translate(${x}px, ${bird.baseY}px) scale(${bird.scale})`;
      });
      return;
    }

    let last = performance.now();
    const startedAt = last;

    const tick = () => {
      const now = performance.now();
      // Clamped so a backgrounded tab does not teleport everything on return.
      const delta = Math.min((now - last) / 1000, 0.064);
      last = now;
      const elapsed = (now - startedAt) / 1000;

      for (const cloud of sky) {
        if (!cloud.el) continue;

        cloud.x += cloud.speed * delta;
        // Wrap once fully past the right edge, re-entering from fully off the
        // left. The fade below means the wrap is never seen.
        if (cloud.x > width) cloud.x = -cloud.width;

        // Fade in and out at the edges, so a cloud dissolves rather than
        // popping — the visible "jump back" of the previous version.
        const fadeIn = Math.min(1, (cloud.x + cloud.width) / (cloud.width * 0.9));
        const fadeOut = Math.min(1, (width - cloud.x) / (cloud.width * 0.9));
        const edge = Math.max(0, Math.min(fadeIn, fadeOut));

        // A slow vertical bob, so it drifts rather than sliding on rails.
        const y =
          cloud.baseY +
          Math.sin(elapsed * cloud.bobSpeed * Math.PI * 2 + cloud.bobPhase) *
            cloud.bobAmplitude;

        cloud.el.style.opacity = String(cloud.opacity * edge);
        cloud.el.style.transform = `translate(${cloud.x}px, ${y}px) scale(${cloud.scale})`;
      }

      for (const bird of flock) {
        if (!bird.el) continue;

        if (bird.wait > 0) {
          bird.wait -= delta;
          bird.el.style.opacity = '0';
          continue;
        }

        bird.progress += bird.speed * delta;
        if (bird.progress >= 1) {
          // A fresh crossing: new lane, new size, new depth, new direction.
          Object.assign(bird, makeBird(bird.el), { wait: randomBetween(0.5, 6) });
          continue;
        }

        const t = bird.progress;
        const span = width + BIRD_VIEW_W * 2 * bird.scale;
        const x = bird.leftToRight
          ? -BIRD_VIEW_W * bird.scale + t * span
          : width + BIRD_VIEW_W * bird.scale - t * span;

        // Rises and falls along a shallow arc rather than a straight line.
        const y = bird.baseY + bird.drift * t - Math.sin(t * Math.PI) * bird.arc;

        // Bank into the direction of travel, taken from the vertical slope.
        const slope = bird.drift - Math.cos(t * Math.PI) * Math.PI * bird.arc;
        const bank =
          Math.max(-18, Math.min(18, (slope / Math.max(height, 1)) * 60)) *
          (bird.leftToRight ? 1 : -1);

        // Fade at the edges so it never pops in or out.
        const edge = Math.min(1, Math.min(t, 1 - t) / 0.1);

        bird.el.style.opacity = String(bird.opacity * edge);
        bird.el.style.transform =
          `translate(${x}px, ${y}px) scale(${bird.scale}) ` +
          `scaleX(${bird.leftToRight ? 1 : -1}) rotate(${bank}deg)`;

        // Distant birds beat their wings more slowly, like distant birds do.
        const flap = Math.sin(elapsed * bird.flapSpeed + bird.flapPhase);
        const lift = 10 + flap * 13;
        bird.leftWing?.setAttribute('transform', `rotate(${-lift} 12 7)`);
        bird.rightWing?.setAttribute('transform', `rotate(${lift} 12 7)`);
      }
    };

    return tickWhileVisible(root, tick);
  }, [ready, birdCount, clouds]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
    >
      {cloudSeeds.map((seed, index) => (
        <svg
          key={`cloud-${seed}`}
          ref={(el) => {
            cloudRefs.current[index] = el;
          }}
          viewBox={`0 0 ${CLOUD_VIEW_W} ${CLOUD_VIEW_H}`}
          width={CLOUD_VIEW_W}
          height={CLOUD_VIEW_H}
          className="absolute left-0 top-0 text-text-primary"
          style={{ opacity: 0, transformOrigin: '0 0', willChange: 'transform, opacity' }}
        >
          <CloudShape seed={seed} />
        </svg>
      ))}

      {Array.from({ length: birdCount }, (_, index) => (
        <svg
          key={`bird-${index}`}
          ref={(el) => {
            birdRefs.current[index] = el;
          }}
          viewBox="0 0 24 14"
          width={BIRD_VIEW_W}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          className="absolute left-0 top-0 text-accent"
          style={{ opacity: 0, transformOrigin: '50% 50%', willChange: 'transform, opacity' }}
        >
          <path data-wing="l" d="M12 7 C 9 4, 6 3.4, 2.5 5" />
          <path data-wing="r" d="M12 7 C 15 4, 18 3.4, 21.5 5" />
        </svg>
      ))}
    </div>
  );
}
