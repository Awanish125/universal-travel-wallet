# 2026-09-05 — Home-Page Animation Language Ported From the KP Reference Build

## USER REQUEST (verbatim)

```
@"D:\awi\KP/"
see this project and take refrence of animation from Home page and animate same like that
```

---

## WHAT THE REFERENCE BUILD DOES

Read before changing anything, in `D:/awi/KP`:

| File | What it establishes |
|---|---|
| `src/lib/motion.ts` | The whole contract. IntersectionObserver triggers instead of ScrollTrigger; `gsap.ticker` work gated to on-screen only; `will-change` set before a tween and cleared after; reduced motion respected everywhere. |
| `src/lib/scramble.ts` | `scrambleDecode` — characters cycle through glyphs and resolve left to right as a tween scrubs 0→1. |
| `src/components/ScrambleText` | That decode as a component, SSR-safe, with `inview` / `immediate` triggers. |
| `src/components/SectionReveal` | One reveal used by every section: children staggered, hidden by `gsap.set` after mount rather than in JSX. |
| `src/components/hero/HeroSectionContent.tsx` | The hero entrance: supporting items fade up on a 0.075 stagger, then the headline lines "rack focus" from `scale(1.18) blur(22px)` to sharp on `expo.out`, 0.12 apart. Afterwards a slow idle loop dips one random letter and recovers it. Gated on the loader's `kp:loaded` event. |
| `src/components/hero/PinnedHero.tsx` | The pinned intro. A tall runway with a `position: sticky` stage, and a paused timeline driven from `window.scrollY` on `gsap.ticker` with a 0.14 lerp — explicitly *not* a ScrollTrigger pin. Two beats: `depart` (copy lifts and fades) then `compose` (stats panel rises and counts up). |
| `src/styles/hero.css` | `350svh` runway, `100svh` sticky stage, with a comment warning that `overflow: hidden` on the runway would break the sticky child. |
| `src/components/ServicesStrip` | The section-level idiom: `expo.out`, ~0.85s, 0.07 stagger, `clearProps` afterwards. |

Two of its constraints are worth calling out, because they are the reason the
architecture looks the way it does:

- **No ScrollTrigger anywhere.** Its comments record the measurement: a
  ScrollTrigger pin on a viewport-sized stage cost ~5ms/frame of pure
  compositing and its smoothed scrub could wedge near the top of the page.
- **No `filter: blur()` in a scrubbed tween**, because blur re-rasterises the
  layer on every scrub frame. Blur is used only in the one-shot rack focus,
  off the scroll path.

---

## AI RESULT

### Ported, adapted rather than copied

**`src/lib/motion.ts`** — `prefersReducedMotion`, `observeOnce`,
`tickWhileVisible`, `withWillChange`, matching the reference contract. Added
`onPageRevealed`, which gates an entrance on this project's own loader signal
(`utw:loaded` / the `page-revealed` class on `<html>`, both of which
`LoadingScreen` already dispatched) with a 6-second fallback, so a signal that
never arrives cannot leave the first screen blank.

**`src/lib/scramble.ts` + `src/components/common/ScrambleText.tsx`** — the glyph
decode, SSR-safe, reduced-motion aware, killing its tween on unmount.

**`src/components/common/ScrollReveal.tsx`** — rebuilt on `observeOnce` +
`withWillChange`, `expo.out` at 0.85s with a 0.08 stagger. This replaces the
ScrollTrigger version written earlier today, along with the IntersectionObserver
safety net and settle-timer it needed: with the observer *as* the trigger rather
than a backstop, there is nothing left to back up.

**`src/components/landing/HeroContent.tsx`** — the rack-focus entrance. Regular
items fade up on a 0.075 stagger; the three headline lines run
`scale: 1.18, filter: blur(22px), autoAlpha: 0` → sharp over 1.4s on `expo.out`,
0.12 apart; the eyebrow decodes through glyphs. On completion, the two
non-gradient lines have their letters wrapped in spans so a random one can dip to
0.18 opacity and recover every few seconds. The gradient line is deliberately
skipped — splitting it would break `background-clip: text` across the fragments.
`aria-label` on the `<h1>` carries the real sentence and the animated lines are
`aria-hidden`, so the three blocks are not read as one run-on word.

**`src/components/landing/Hero.tsx`** — the pinned stage. A `240svh` runway with
a sticky `100svh` stage, and a paused timeline scrubbed from `window.scrollY` on
`gsap.ticker`, gated by `tickWhileVisible` and smoothed with a 0.14 lerp:

- `depart` — hero copy to `autoAlpha: 0, y: -54, scale: 0.975`; scroll cue fades.
- `compose` — the stats panel rises from `y: 28, scale: 0.985`, its items stagger
  in at 0.08, and the figures count from 65% of target to full.

Measurements are cached and only recomputed on resize. A runway measuring
shorter than the viewport is treated as "layout not settled yet" and re-measured
instead of driving the timeline — dividing by it would snap the sequence to its
end on the first scrolled pixel.

**`src/components/landing/StatsSection.tsx`** — moved out of the hero copy into
the stage's lower panel and stripped of its own animation. The hero timeline
finds it by data attribute, which keeps the pinned sequence's timing in one file
rather than split across two components that would each have to know the
other's. The real figures stay in the markup, so reduced motion, crawlers and a
no-JS visitor all read the finished numbers.

**`src/components/landing/ScrollCue.tsx`** — new. The stage holds still for more
than a screen of scrolling, which without a hint reads as a stuck page.

**Landing sections** — `FeatureGrid`, `HowItWorks` and `CTASection` now reveal
through the shared `ScrollReveal` on the reference's `expo.out` curve. Motion
keeps the hover lifts; GSAP owns the entrances.

### Removed

- `src/hooks/useGsapScrollTrigger.ts` — nothing used it once the reveals moved to
  IntersectionObserver.
- The ScrollTrigger registration and `lenis.on('scroll', ScrollTrigger.update)`
  bridge in `SmoothScrollProvider`. No component uses ScrollTrigger any more, so
  the plugin was being loaded and wired for nothing.

### CSS

`.hero-runway` / `.hero-stage` / `.hero-lower` added to `globals.css`, including
the reference's warning that `overflow: hidden` on the runway would turn it into
a scroll container and stop the sticky child sticking. A short-viewport query
shortens the runway, and a `prefers-reduced-motion` query collapses it to a
single screen with the stage rendering as an ordinary section.

### Design-system note

The rack focus uses `filter: blur()`. That is a transient property of an
animation, not a material: ADR 005 forbids `backdrop-filter`, translucent
surfaces and anything that shows through, and a filter that runs for 1.4s and
resolves to `blur(0px)` leaves no glass behind it. No scrubbed tween uses blur,
per the reference's own rule. Recorded as ADR 008.

### Files

**Added** — `src/lib/motion.ts`, `src/lib/scramble.ts`,
`src/components/common/ScrambleText.tsx`, `src/components/landing/ScrollCue.tsx`.

**Rewritten** — `src/components/common/ScrollReveal.tsx`,
`src/components/landing/Hero.tsx`, `HeroContent.tsx`, `StatsSection.tsx`.

**Edited** — `src/app/globals.css`, `SmoothScrollProvider.tsx`,
`FeatureGrid.tsx`, `HowItWorks.tsx`, `CTASection.tsx`.

**Deleted** — `src/hooks/useGsapScrollTrigger.ts`.

**Dependencies** — none added or removed. The reference uses `split-type`,
`react-countup` and `@gsap/react`; none were needed, since GSAP alone covers the
word splitting, the count-up and the context scoping (Rule 25).

---

## TESTS PERFORMED

- `tsc --noEmit` — clean.
- `next lint` — no warnings or errors.
- `vitest run` — 68 passing across 18 files, unchanged.
- `next build` — succeeds; all 15 routes compile.

### Verified in the browser (structural)

- The runway renders with a `position: sticky` stage, the lower stats panel, and
  the scroll cue.
- The headline's three lines carry the rack-focus **start** state as inline
  style — `filter: blur(22px); transform: scale(1.18, 1.18); transform-origin:
  0% 100%; opacity: 0` — which is only written once the timeline has been built
  and rendered at time 0. The four supporting items carry their
  `translate(0px, 24px); opacity: 0` pre-set.
- `textContent` confirms the copy is in the DOM while hidden, and the `<h1>`
  `aria-label` reads "One wallet for every currency, every trip, everywhere."
- `ScrollReveal` applies `translate(0px, 28px); opacity: 0` to the feature-grid
  heading wrapper and to each card, so the observer is wired.
- The stat values expose `data-value` / `data-suffix` and render their real
  figures (`100%`, `180+`) in the markup.
- The 6-second reveal fallback fired and built the timeline even though the
  loading screen never completed in this environment.

### Not verified

**Animation playback, again.** The preview pane reports `innerHeight` of 0 — so
every viewport unit computes to `0px` — and delivers no animation frames at all
(`requestAnimationFrame` measured as never firing). Neither GSAP nor Motion can
advance a tween there, and screenshots come back blank after a scroll. No Chrome
browser is connected to this session either, so there was no second surface to
try. What was verified is that every tween is built, armed and holding its
correct start state; the motion itself needs a real browser to confirm.

Also unverified: behaviour on a real touch device, and the `prefers-reduced-motion`
collapse of the runway.

---

## FOLLOW-UP REQUEST, SAME SESSION (verbatim)

```
Dont empty the hero section scroll that [jct has image that why we doing that but does not have so leave it as it is


an car scroll come frm diffrent direction and also i dont like background image i want more dark Theme like charcoleor graphite color
```

### What changed in response

**1. The hero is no longer pinned.** The reference build pins its hero and
scrubs the copy away because there is a full-bleed photograph behind it to
reveal; this product has no such image, so the same move held an empty stage
while the visitor scrolled. `Hero` is now an ordinary section again: the
`240svh` runway, the sticky stage, the depart/compose timeline, the scroll
driver and the scroll cue are all gone, along with their CSS. The entrance
animation is kept in full — rack-focus headline, scramble eyebrow, letter
dropout, staggered supporting items — because that was never the part that
needed the empty stage.

`StatsSection` returns to normal flow beneath the hero copy and now owns its own
reveal: items rise on a 0.09 `expo.out` stagger and the figures count up, both
triggered by `observeOnce` rather than by the hero's timeline.

**2. Sections arrive from different directions.** `ScrollReveal` gained `from`
(`bottom` | `top` | `left` | `right`) and `fromCycle`, which gives each
staggered child its own direction in turn:

| Section | Direction |
|---|---|
| Feature cards | cycles left → bottom → right, 40px |
| How-it-works steps | left, 48px, 0.12 stagger |
| Both section headings | top |
| CTA card | bottom, 44px |

**3. The night canvas is charcoal/graphite.** The background had a blue-violet
cast (`#0c0d11` → `#12141a`) and the text ramp was tinted violet
(`#f1edfb` / `#b9afd1` / `#8377a0`). Both are now neutral graphite:

| Token | Was | Now |
|---|---|---|
| `--background` | `#0c0d11` | `#0e0f10` |
| `--background-secondary` | `#12141a` | `#141517` |
| `--background-gradient` | blue-tinted | `#0e0f10` → `#141517` → `#0b0c0d` |
| `--surface-strong` | `#141721` | `#191b1d` |
| `--surface-subtle` | `#090a0d` | `#090a0b` |
| `--surface-solid` | `#0f1117` | `#131416` |
| `--text-primary` | `#f1edfb` | `#f2f3f4` |
| `--text-secondary` | `#b9afd1` | `#b4b7bb` |
| `--text-muted` | `#8377a0` | `#83878c` |
| `--text-disabled` | `#5b5270` | `#585c61` |
| `--shadow-shadow` | `rgba(0,0,0,.65)` | `rgba(0,0,0,.72)` |

The violet accent family is untouched — it is the brand, and only the canvas was
objected to. Against a neutral graphite ground it now reads as the single source
of colour on the page.

The two radial accent washes behind the hero are removed, as are the
`.hero-scenic-*` CSS rules and `public/hero-scenic-day.jpg` /
`hero-scenic-night.jpg` (638 KB), which no component had referenced since the
image-free hero landed. Day mode is unchanged.

Verified after the change: no `.hero-runway` or `.hero-stage` in the DOM, no
scroll cue, no radial-gradient washes; `--background` resolves to `#0e0f10` and
`--text-primary` to `#f2f3f4`; feature cards hold start offsets of
`translate(-40px, 0)`, `(0, 40px)`, `(40px, 0)` in rotation and the steps all
hold `translate(-48px, 0)`. A screenshot of the hero on the new canvas confirms
the headline, gradient words and buttons render as intended. `tsc`, `next lint`,
68 tests and `next build` all pass.

---

## SECOND FOLLOW-UP, SAME SESSION (verbatim)

```
appluy broder animation to it also just like card And give animation to it
and why you remove this from the liquid glass card of otherclaymorphism
```

Sent with two screenshots: the stats row, and the capability-pill row above it.

### Answer to the question

Nothing was removed. The sweeping accent border is the `.animated-gradient-border`
utility — a conic gradient painted into the border box, its angle driven by an
`@property --border-angle` keyframe — and it is still applied to every
`SoftCard`, unchanged. The two rows in the screenshots simply never had it:
the capability pills were plain `border border-border` chips and the stats row
was an unbordered flex row, so neither had ever been a `SoftCard`.

### What changed

**The border animation is now shared, and parameterised.**
`.animated-gradient-border` gained a `--border-spin-duration` variable
(defaulting to the existing 6s) so different elements can sweep at different
speeds. It stays one implementation used by everything (Rule 15), rather than
being copied per component.

**Capability pills** (`FeatureHighlights`) now carry the sweeping border, with
`--card-fill: var(--surface-strong)` and a per-pill duration of 5.5s, 6.4s, 7.3s
and 8.2s. Staggering the speeds keeps the four from pulsing in lockstep, which
would read as a loading state rather than as decoration. They also picked up the
clay convex shadow, so they now match the card language instead of sitting flat.

**Stats row** became a proper panel again: `rounded-sheet`, clay convex shadow,
the same sweeping border at a deliberately slower 11s so the eye reads one calm
surface rather than another row of chips.

**Pill entrances are no longer their own animation.** They previously ran a
Framer Motion fade with a hardcoded 1.6-second delay, timed against a hero
entrance that no longer exists — and it competed with GSAP for the same
properties. Each pill is now a `data-hero-item`, so the hero's own timeline fades
them up at the tail of its 0.075 stagger (8 items in the cascade now, up from 4).
Hover lift and the accent underline stay on Motion.

**The loading screen was still on the old purple** (`#0f0b18` hardcoded) after
the graphite retheme. It now reads `var(--background)`, and its two accent
washes were softened from 16%/18% to 10%/11% so the loader opens onto the same
canvas the page uses instead of a purple one.

Verified: 15 elements carry `animated-gradient-border`, with computed durations
of 5.5s / 6.4s / 7.3s / 8.2s on the pills, 11s on the stats panel and 6s on the
cards, and `--card-fill` resolving to `#191b1d` for the pills and `#0e0f10` for
the panel and cards. `data-hero-item` count is 8. A screenshot confirms the
accent arc sweeping the edge of both rows on the graphite ground. `tsc`,
`next lint`, 68 tests and `next build` all pass.

---

## KNOWN LIMITATIONS / FOLLOW-UPS

1. The hero copy is hidden by `gsap.set` and revealed by a tween, so on a device
   where animation frames never arrive it would stay hidden. The 6-second
   fallback covers a missing *loader signal*, not a missing frame loop. This is
   the reference build's behaviour too, and real browsers resume frames on
   focus.
2. `StaggerContainer` (used by the app screens, not the landing page) still
   animates from `opacity: 0` through Motion and has not been moved onto the new
   contract. Worth doing for consistency.
3. The reference's `PinnedHero` also scrubs an editorial marquee and expands an
   image panel across the stage. Neither was ported, and the pin itself was then
   removed at the user's request — all three depend on having a full-bleed image
   behind the hero, which this product does not.
