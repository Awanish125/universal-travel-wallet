# Architectural & Technical Decisions Record (ADR)

This file tracks key architectural, design, and technical decisions made during the lifecycle of Universal Travel Wallet.

## Decision Log

### ADR 001: Authoritative Design System & Custom Gradient Accent Pattern Foundation

- **Date:** 2026-09-04
- **Status:** Accepted
- **Context:** Finalizing the visual design foundation for Universal Travel Wallet prior to application setup and screen implementation.
- **Decision:**
  1. Adopt [design-system/universal-travel-wallet.md](file:///d:/awi/universal-travel-wallet/design-system/universal-travel-wallet.md) as the authoritative visual design system.
  2. Implement dark-first Liquid Glass (`GlassCard`, `GlassButton`, translucent surfaces, thin luminous borders, ambient backdrop blurs) as the primary UI/material layer.
  3. Integrate the screenshot-derived **Custom Gradient Accent Pattern** via reusable `GradientIconTile` components for compact visual anchors (card icons, wallet icons, expense icons, category icons, quick actions, status/empty/success states).
  4. Enforce strict Design Hierarchy:  
     `Project Knowledge` → `Project Rules` → `Design System (design-system/universal-travel-wallet.md)` → `Custom Patterns (GradientIconTile)` → `UI/UX Pro Max` → `Implementation`.
  5. UI/UX Pro Max serves strictly as supporting design intelligence and must NEVER override or replace the authoritative design system.
- **Consequences:**
  - Financial numbers remain solid, high-contrast, tabular text (`tabular-nums`) and are never rendered as low-contrast gradient text or covered by heavy blur.
  - Gradients are centralized in design tokens (`gradient.*`) and mapped deterministically to semantic entities (no per-render random gradients).
  - Liquid Glass materials remain transparent/translucent while preserving contrast, accessibility, and 60fps performance.

---

### ADR 002: UI/UX Pro Max Supporting Intelligence Integration & Governance

- **Date:** 2026-09-04
- **Status:** Accepted
- **Context:** Verifying and configuring UI/UX Pro Max usage for UX research, accessibility validation, and stack guidance.
- **Decision:**
  1. UI/UX Pro Max operates strictly as a supporting design intelligence tool.
  2. The command `search.py ... --design-system --persist` is strictly prohibited to prevent the creation of any competing `MASTER.md` design file.
  3. UI/UX Pro Max output will be queried exclusively for targeted UX concerns (`--domain ux`), React performance (`--domain react`), Lucide accessibility (`--domain icons`), responsive 2D chart UX (`--domain chart`), and stack implementation patterns (`--stack nextjs`).
- **Consequences:**
  - `design-system/universal-travel-wallet.md` remains the sole visual design source of truth.
  - Zero visual identity drift occurs while leveraging established WCAG accessibility guidelines and Next.js/React performance best practices.

---

### ADR 003: Clean Architecture, Encapsulated Money Value Object, Dexie Persistence, Rate Abstraction & Native Service Worker PWA

- **Date:** 2026-09-04
- **Status:** Accepted
- **Context:** Establishing the technical foundation, local persistence, financial precision engine, rate provider pipeline, and PWA setup for Phase 1.
- **Decision:**
  1. Enforce strict 5-tier Clean Architecture (`UI` → `Application` → `Domain` → `Repository Interfaces` → `Infrastructure`). The domain layer is pure TypeScript with zero dependencies on React, Next.js, Dexie, DOM APIs, or concrete rate providers.
  2. Encapsulate high-precision financial arithmetic (`bignumber.js`) inside a domain `Money` Value Object (`src/domain/financial/money.ts`). External code consumes clean domain methods (`add`, `subtract`, `multiply`, `divide`, `format`) without leaking third-party `BigNumber` methods.
  3. Centralize database access within `TravelWalletDexieDB` (`src/infrastructure/db/dexie-db.ts`). Use bidirectional mappers (`src/infrastructure/db/mappers/`) to convert between plain Dexie records (`ExpenseRecord`) and pure domain entities (`Expense`).
  4. Abstract exchange rates behind `ExchangeRateProvider` interface (`src/domain/services/rate-provider.ts`). Implement `FrankfurterProvider` (unlimited open ECB data, CORS enabled, no API key needed) as primary online provider and `CompositeRateManager` for failover and IndexedDB `rateCache` storage. Secondary providers requiring API keys are deferred to prevent exposing secrets in client code.
  5. Adopt a Native Minimal Service Worker (`public/sw.js`) with version key `utw-v1.0.0`, Cache-First static asset caching, Stale-While-Revalidate HTML navigation, and automatic old-cache cleanup on `activate` (`clients.claim()`).
- **Consequences:**
  - Historical financial values (expenses, exchanges, settlements) remain 100% immutable regardless of live exchange rate updates.
  - Core application opens instantly from local CacheStorage and IndexedDB without waiting for network calls.
  - Standard Next.js Vercel deployment operates seamlessly without server dependencies or API route requirements.

---

### ADR 004: Permanent Git Branch Strategy & Production Deployment Branch

- **Date:** 2026-09-04
- **Status:** Accepted
- **Context:** Defining branch workflow rules for production releases, reference baselines, and active feature development.
- **Decision:**
  1. `main` is preserved as the original Phase 1 reference baseline branch.
  2. `production` is established as the live Vercel production deployment branch.
  3. `development/*` (e.g. `development/phase-2-app-shell`) will be used for active feature development.
  4. Features must be tested, reviewed, and verified before merging into `production`. Direct development on `production` or `main` is strictly prohibited.
  5. Vercel deployment connects exclusively to `production`.
- **Consequences:**
  - `main` remains clean and immutable as the reference foundation.
  - Live production code is cleanly isolated on `production` and updated only when feature branches pass full test/typecheck verification.

---

### ADR 005: Soft Tactile UI (Claymorphism · Skeuomorphism · Neumorphism) Supersedes Liquid Glass

- **Date:** 2026-09-04
- **Status:** Accepted
- **Context:** ADR 001 established dark-first **Liquid Glass** (translucent surfaces, backdrop blur, luminous borders, blue/cyan accent) as the authoritative material system. The user explicitly rejected this direction — no glass, no blur, no neon lighting — and requested a full material and color system replacement based on three supplied references: a Claymorphism finance app (light mode target), a Neumorphic monochrome widget screen, and a Neumorphic dark music player (dark mode target). The new direction keeps Motion (Framer Motion), adds GSAP and parallax as explicit first-class animation tools, and moves the accent family from blue/cyan to violet/purple, with a dark-purple night canvas and a white day canvas.
- **Decision:**
  1. Replace the Liquid Glass Material System in `design-system/universal-travel-wallet.md` (former Sections 5–6) with a **Soft Tactile Material System** blending Claymorphism (day mode default: solid, matte, puffy shapes with a light highlight + hue-tinted soft shadow), Neumorphism (night mode default: surfaces close in color to the canvas, distinguished only by a soft dual-tone shadow), and Skeuomorphism (the umbrella principle — controls look and behave like physical, pressable objects; convex at rest, concave/inset when pressed).
  2. Every surface becomes fully **opaque** — no `backdrop-filter`, no blur, no translucency, and nothing shows through a surface. Depth comes entirely from dual-tone box-shadows (a light highlight edge + a darker, theme-tinted shadow edge), never from opacity.
  3. Replace the blue/cyan accent family (`#4DA3FF`) with a violet/purple accent family (`#7C6FEF` day / `#9B8CFF` night). Background canvases become `#15101F`→`#0F0B18` (dark purple, night) and `#FFFFFF`→`#F1EDFC` (white with a soft lavender wash, day) — both rendered as a **soft linear gradient**, never a radial glow field.
  4. Explicitly forbid neon, glowing, or fluorescent color anywhere in the product (previously only "avoid bright neon glows as decoration" under the glass Don'ts — now a hard rule with zero exceptions).
  5. Retain the Custom Gradient Accent Pattern (`GradientIconTile`) from ADR 001, but re-render it as a puffy clay tile with a dual-tone shadow instead of a flat gradient on a glass surface, and restrict its palette to pastel/matte stops (no neon-saturated gradients).
  6. Retain Motion (Framer Motion) as the primary component-animation library; formally add **GSAP** (`gsap.context()`-scoped, for scroll-orchestrated sequences) and **parallax** (used sparingly for depth cues) as first-class, complementary animation tools alongside it — none of these three are being removed or replaced by this ADR.
  7. Corner radii increase slightly across the board (e.g. `radius-lg` 20px → 24px, `radius-sheet` 28px → 32px) to suit the puffier clay/neumorphic geometry.
  8. Cross-reference updates: `.ai/PROJECT_KNOWLEDGE.md` Point 99 and Section 10, and `.ai/RULES/04-UI-UX-AND-MOTION.md` Rules 41/73/74, are updated to remove "Liquid Glass" as the mandated material and point to this ADR instead, so the frozen documentation set no longer contradicts itself.
- **Consequences:**
  - No component built going forward may use `backdrop-filter`, translucent `rgba` surfaces, or glow/neon effects; any such code from before this ADR (there is none currently implemented — the codebase was reset to the Phase 1 baseline before this change) must not be reintroduced.
  - `GlassCard`/`GlassButton`-style naming is retired in favor of theme-aware `SoftCard`/`SoftButton` components that render their clay or neumorphic variant from the active theme, not as separate components.
  - Financial readability is, if anything, easier to guarantee under this ADR than under ADR 001, since opaque surfaces remove the contrast risk that translucency/blur always carried.
  - This ADR does not touch anything outside the visual material/color system — architecture (ADR 003), git strategy (ADR 004), and UI/UX Pro Max governance (ADR 002) are unaffected.

---

### ADR 006: Plain-Language Currency Model (Home / Local) & Globally Remembered Currency Preferences

- **Date:** 2026-09-05
- **Status:** Accepted
- **Context:** The frozen baseline speaks of a trip's "base currency" (Point 1) and the calculator's "Base and Target currencies" (Point 29), and the implementation surfaced those exact words in the interface. The user reported that the terms mean nothing to a traveller, that the trip carried no notion of the money actually spent at the destination — which forced the exchange screen to hardcode `IDR` and the calculator to ask for both currencies on every visit — and that a currency chosen once should be remembered everywhere.
- **Decision:**
  1. `Trip` gains a second currency, `localCurrency`: the money spent at the destination, alongside `baseCurrency`, the money the traveller counts in. Dexie schema v2 backfills it for existing trips from their country, falling back to the home currency, so no trip is left without one.
  2. The **domain and persistence layers keep the names `baseCurrency` / `localCurrency`**; only the interface changes. Frozen Points 1, 7, 16, 26, 29 and 31 continue to describe the same data — this is a presentation change plus one added field, not a redefinition of the financial model.
  3. User-facing wording becomes everyday language, and never "base"/"target": *"Money you count in"* (— your home money), *"Money you'll spend there"*, *"Where are you going?"*, *"You hand over"* / *"You get back"*, and on the trip header *"You count in ₹ INR · You spend in Rp IDR"*.
  4. Choosing a **country** determines the local currency. A 250-entry country list (`src/lib/countries.ts`, derived from the existing `country-codes-list` dependency) maps each country to its ISO 4217 code; picking Indonesia fills in IDR, picking India fills in INR. The user can still override it.
  5. Currency **symbols are always shown** beside the code (`₹ INR`, `Rp IDR`). Symbols are resolved through the platform's `Intl.NumberFormat` with `currencyDisplay: 'narrowSymbol'`, not from a package field — `country-codes-list` has no currency-symbol field, and asking it for one returned the literal string `{currencySymbol}`.
  6. Currency choices are **remembered globally** in the existing `settings` table (`preferred.homeCurrency`, `preferred.localCurrency`) and preselected on every later screen. This satisfies Point 0's "users should not have to manually enter information the application can calculate" and Rule 66.
  7. The domain `Money` value object stays free of symbol and flag knowledge. Presentation formatting lives in `src/lib/currency-format.ts` and the `CurrencyAmount` component, preserving the ADR 003 layer boundary.
- **Consequences:**
  - The exchange screen derives its two currencies from the trip itself, removing the hardcoded `IDR` that violated Point 5 and Point 71 ("no country-specific currency logic").
  - The bargaining calculator no longer asks for currencies on every visit; the setup sheet appears only on first use or when explicitly reopened.
  - `.ai/PROJECT_KNOWLEDGE.md` Points 1, 5 and 29 are annotated to record the added field and the interface vocabulary, with the original wording preserved.
  - Historical immutability is untouched: `localCurrency` is trip metadata and never rewrites a stored expense, exchange or settlement (Points 16, 33, 56).

---

### ADR 007: Single Dialog Shell Without AnimatePresence, and an Exact motion-dom Pin

- **Date:** 2026-09-05
- **Status:** Accepted
- **Context:** Every modal in the app repeated its own overlay markup (Rule 30), and Point 92 lists `BottomSheet` and `ConfirmDialog` as mandatory reusable abstractions that did not exist. While building the shared shell, browser testing showed `AnimatePresence` failing to unmount its child from inside a React portal: the closed sheet stayed in the DOM at `opacity: 0` as a full-screen `pointer-events: auto` layer that silently swallowed every click on the page behind it.
- **Decision:**
  1. Introduce one `Sheet` component — bottom sheet on phones, centred dialog from `sm` up — used by every modal in the product.
  2. **Do not use `AnimatePresence` for it.** Mounting is controlled explicitly: the sheet stays rendered for a fixed exit window after `isOpen` goes false, then unmounts. The overlay also sets `pointer-events: none` while closing, so it cannot block interaction even if teardown is delayed.
  3. The scroll-lock effect captures the value to restore **only when the sheet opens**. Depending on the inline `onClose` arrow made it re-run every render, each run capturing the `hidden` its predecessor had just written, which left the page permanently unscrollable.
  4. Pin `motion-dom` to the exact version `framer-motion` was published against (`12.23.12` for `framer-motion@12.23.12`). framer-motion declares `^12.23.12`, but `motion-dom@12.43.0` satisfies that range while having removed the `activeAnimations` export framer-motion imports — an upstream semver break that fails the build outright.
  5. Scroll-driven reveals must never be the only thing standing between the user and the content. `ScrollReveal` hides nothing until GSAP has actually loaded, pairs its ScrollTrigger with an IntersectionObserver, and writes the finished state directly on a timer if the tween has not completed when it should have.
- **Consequences:**
  - A modal can no longer leave an invisible click-blocker over the application, and a failed or throttled animation can no longer leave a section of the page permanently blank.
  - Sheets lose nothing visually: entrance and exit are still spring-animated by Motion.
  - The `motion-dom` pin must be revisited together with any future `framer-motion` upgrade; the two versions are expected to match exactly.

---

### ADR 008: Home-Page Animation Language Adopted From the KP Reference Build — IntersectionObserver Triggers, Sticky Pin, Rack-Focus Hero

- **Date:** 2026-09-05
- **Status:** Accepted
- **Context:** The user pointed at the sibling project in `D:/awi/KP` and asked for the home page to be animated the same way. That build has a mature, deliberately-constrained motion architecture, and its constraints turn out to answer problems this project had already hit: ScrollTrigger reveals that could leave a section blank if the trigger never fired, and a hero entrance with no relationship to the loading screen. ADR 005 already names GSAP and parallax as first-class animation tools alongside Motion, so this is an elaboration of that decision rather than a departure from it.
- **Decision:**
  1. **Entrance animations trigger on IntersectionObserver, never on ScrollTrigger.** A scroll-position plugin recomputes start/end points against the Lenis smooth-scroll runtime on every scrolled frame; an observer costs nothing until it fires and keeps working when animation frames are throttled. `ScrollReveal` is rebuilt on `observeOnce`, and `useGsapScrollTrigger` is deleted. ScrollTrigger remains the right tool for genuinely scrubbed motion — this project simply no longer has any.
  2. ~~**The hero is pinned with `position: sticky`, not a ScrollTrigger pin.**~~ **WITHDRAWN the same day, on user instruction.** The pin was ported, then removed: the reference build pins its hero to reveal a full-bleed photograph behind the departing copy, and this product has no such image, so the sequence held an empty stage while the visitor scrolled. The hero is an ordinary section; only its entrance animation is kept. The sticky-stage technique itself remains the right one *if* a future hero ever gains a background worth revealing — it is the empty stage that was wrong here, not the mechanism.
  3. **Per-frame work runs on `gsap.ticker` only, and only while the element is on screen** (`tickWhileVisible`). A throwing tick callback ejects itself rather than taking the shared ticker — and page scrolling — down with it.
  4. **`will-change` is set immediately before a tween and cleared when it completes** (`withWillChange`), so idle sections never hold a compositor layer.
  5. **Elements are hidden by `gsap.set` after mount, never in JSX.** Reduced motion, a crawler and a failed script all then render the finished content. Copy that an entrance hides waits for the loading screen's `utw:loaded` signal, with a 6-second fallback so a missing signal can never leave the first screen blank.
  6. **The hero headline uses a rack-focus entrance**: each line snaps from `scale(1.18) blur(22px)` to sharp on `expo.out`, 0.12s apart, followed by a slow idle loop that dips one random letter and recovers it. A short eyebrow line decodes through glyphs (`scrambleDecode`).
  7. **No `filter: blur()` in scrubbed tweens.** Blur re-rasterises the layer on every scrub frame. The hero's rack focus is exempt: it runs once, off the scroll path, and ends at `blur(0px)`.
- **Consequences:**
  - The blur in the rack focus is a transient property of an *animation*, not a material. ADR 005 forbids `backdrop-filter`, translucent surfaces and anything that shows through — a filter that runs for 1.4s and resolves to zero leaves no glass behind it, and the Soft Tactile surface rules are untouched.
  - `SmoothScrollProvider` no longer registers ScrollTrigger or bridges it to Lenis; it only drives Lenis from the ticker.
  - Reveal direction is a parameter, not a constant: `ScrollReveal` takes `from` and `fromCycle`, so the feature grid assembles from left/bottom/right in rotation while the process steps all arrive from the left. Every section entering on the same axis is what makes a long page of reveals feel mechanical.
  - `StatsSection` moved out of the hero copy into the stage's lower panel, and now owns no animation of its own — the hero's timeline drives it by data attribute, keeping the pinned sequence's timing in one place.
  - Motion (Framer Motion) is unchanged and still owns component-level interaction: hover lifts, taps, layout transitions, the sheet. GSAP owns entrances and anything scroll-driven. The split is deliberate, not accidental.
  - This project's motion utilities now mirror the reference build's contract closely enough that a lesson learned in either is portable to the other.

---

### ADR 009: Night Canvas Moves From Dark Purple to Neutral Charcoal / Graphite

- **Date:** 2026-09-05
- **Status:** Accepted — supersedes the night-canvas colour in ADR 005 §3 only
- **Context:** ADR 005 set the night canvas to a dark purple gradient (`#15101F` → `#0F0B18`; the build shipped `#0c0d11` → `#12141a`, a blue-leaning near-black) with a violet-tinted text ramp, and the landing hero carried two violet radial washes. The user asked for "more dark theme like charcoal or graphite colour" and said they did not want the background imagery.
- **Decision:**
  1. The night canvas becomes a **neutral graphite ramp** with no blue or violet cast: `--background` `#0e0f10`, `--background-secondary` `#141517`, gradient `#0e0f10 → #141517 → #0b0c0d`, `--surface-strong` `#191b1d`, `--surface-subtle` `#090a0b`, `--surface-solid` `#131416`.
  2. The night text ramp becomes neutral too — `#f2f3f4` / `#b4b7bb` / `#83878c` / `#585c61` — since a violet-tinted ramp on a graphite ground reads as a colour cast rather than as brand.
  3. `--shadow-shadow` deepens to `rgba(0, 0, 0, 0.72)`, keeping the neumorphic dual-tone shadow legible against the flatter, more neutral ground.
  4. **The violet accent family is unchanged.** ADR 005's move from blue/cyan to violet/purple stands; only the canvas it sits on changes. Against neutral graphite the accent is now the single source of colour on the page, which is the intended effect.
  5. The hero's two radial accent washes are removed, along with the `.hero-scenic-*` rules and the two `public/hero-scenic-*.jpg` files (638 KB) that no component had referenced since the image-free hero landed.
  6. **Day mode is unchanged.** Only the night palette was objected to.
- **Consequences:**
  - Everything else in ADR 005 holds: opaque surfaces, no `backdrop-filter`, no blur or translucency as material, no neon, the Soft Tactile dual-tone shadow language, the Custom Gradient Accent Pattern and the increased corner radii.
  - Financial readability improves slightly — a neutral ground removes the last hue interaction with the tabular figures.
  - `.ai/PROJECT_KNOWLEDGE.md` Point 99 and Section 10 refer to the material system rather than to specific canvas hex values, so they need no amendment; ADR 005's own §3 is the record being narrowed, and it is preserved above rather than rewritten.

