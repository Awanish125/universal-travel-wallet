# Changelog

All notable changes to the Universal Travel Wallet project knowledge, rules, baseline, and codebase will be documented in this file.

## [0.1.0] - 2026-09-04
### Added
- **Phase 1 Baseline Commit:** Initialized Git repository on `main` branch with clean baseline commit `Phase 1: Technical foundation complete` (`36ed174c93246968ac4d5ca7cd07d09cb6a0e6f9`).
- **Tailored `.gitignore`:** Configured exclusions for `node_modules/`, `.next/`, `*.tsbuildinfo`, `.env*`, build artifacts, and system files while preserving persistent project documentation (`.ai/`, `design-system/`, `AGENTS.md`).
- **Phase 1 Technical Foundation & Architecture:** Next.js App Router, React 18, TypeScript, Tailwind CSS project setup optimized for Vercel deployment.
- **Single Source of Financial Truth (`src/domain/financial/`):**
  - Encapsulated `Money` Value Object wrapping `bignumber.js` arithmetic.
  - Precision math helpers (`precision.ts`), currency rounding rules (`rounding.ts`), rate conversion (`conversion.ts`).
  - Expense splitting engine (`splits.ts`) with penny/rupiah remainder distribution.
  - Group balance calculator (`group-balance.ts`), settlement comparison calculator (`settlement.ts`).
  - Exchange performance tracker (`exchange-performance.ts`), shorthand input parser (`shorthand.ts`).
- **Clean Hexagonal Architecture:** Separated pure domain entities (`Trip`, `Expense`, `Wallet`, `Settlement`, `Exchange`) from persistence models.
- **Dexie Persistence Layer (`src/infrastructure/db/`):** `TravelWalletDexieDB` schema with indexed tables and bidirectional mappers.
- **Rate Provider Architecture (`src/infrastructure/rates/`):** Abstract `ExchangeRateProvider` interface, primary `FrankfurterProvider` (open ECB rate data), and `CompositeRateManager` failover pipeline with IndexedDB caching.
- **PWA & Native Service Worker (`public/sw.js`):** Cache-First static asset caching, Stale-While-Revalidate HTML navigation, cache versioning (`utw-v1.0.0`), lifecycle cleanup, and Web App Manifest (`manifest.ts`).
- **Visual Design System (`src/components/common/`):** `GradientIconTile` (implementing Section 4.1 of `design-system/universal-travel-wallet.md`), `GlassCard`, `GlassButton`, dark canvas `#050506`, and Geist typography setup.
- **Automated Vitest Test Suite (`src/domain/financial/__tests__/`):** 8 test suites (25 tests) verifying financial precision, splits, balances, settlements, shorthand parsing, and historical rate immutability.
- **Browser Asset Fix:** Added `public/favicon.ico` resolving browser 404 console request.

---

## [Unreleased]

### Fixed - 2026-09-05 (controls, cards and ambience)
- **Every create action failed off `localhost`.** `crypto.randomUUID()` is only
  defined in a secure context, so opening the app from a phone on the LAN
  (`http://192.168.x.x:3000`) made all 13 call sites throw before saving. New
  `src/lib/newId()` falls back to `crypto.getRandomValues` and then `Math.random`.
- **Dropdown panels rendered under later content.** They inherited every
  ancestor's stacking context; they are now portalled to `document.body`,
  positioned in viewport coordinates, and flip above the trigger when short of
  room.
- **The date range picker reset after the first click** - its reset effect
  watched `startDate` as well as `isOpen`, so the second click could never land.
- **`ScrollReveal` re-ran on every render**, because `fromCycle` is an inline
  array literal; it now depends on the joined string.
- **The calculator's close button did nothing on first run**; it now leaves the
  page.
- **Birds and clouds never crossed their card.** They were positioned with
  percentage transforms, which resolve against the element's own box - a 24px
  bird moved 24px and appeared to flap on the spot, a 120px cloud never left the
  left edge. Rewritten to measure the card and position in pixels.
- **The app rendered in Times New Roman** whenever `--font-geist-sans` was
  missing: `var()` without an internal fallback invalidates the whole
  `font-family` declaration, so it fell past the system-sans stack to the
  browser default. Both `globals.css` and the Tailwind stack now carry the
  fallback inside `var()`.
- Vitest was collecting a spawned task's git worktree, reporting 120 tests for a
  project that has 68.

### Changed - 2026-09-05
- **One clay system for fields and buttons.** Fields take the colour of the
  surface they sit on (via the inherited `--card-fill`) and are pressed into it;
  buttons are the same colour raised out of it, with light type and the accent
  only as a hairline edge - the bright gradient fills are gone. Pressing a
  button sinks it to exactly a field's depth.
- **A focused field wears the card's sweeping accent border**, and that is now
  the focus indicator - the solid accent ring that had been painted on top of
  it, hiding the sweep, is removed.
- **Cards share one fill and one hover.** `SoftCard` always fills from
  `--surface-strong`, and the pointer-tracked 3D tilt that lived only on the
  call-to-action card is now the house hover for every card.
- **`CardAmbience`** replaces the single-bird `CardBird`: 2-6 birds and clouds
  built from circles on a flat base, each cloud in its own horizontal lane,
  wrapping by fading rather than teleporting, bobbing on a slow sine. One
  `depth` per object drives its size, opacity and speed together, so distance
  reads as distance. All on one visibility-gated tick; skipped on anything
  smaller than 260x116.
- **Flags fall back to code chips** where the platform cannot compose flag
  emoji, which Windows cannot - every country row had been reading "AF", "AX",
  "AL". `Emblem` measures support once on a canvas and shows the currency symbol
  or ISO code instead.
- **A themed scrollbar** replaces the OS one, everywhere.
- **`DateRangeField`** replaces the two native date inputs with a hotel-style
  range calendar: first click sets the start, second the end, the span between
  highlights as a continuous band. Built on the project's own tokens rather than
  MUI, which Point 98 and Rule 68 forbid.
- **`InfinityMark`** draws the unlimited-trips symbol as an SVG lemniscate with
  a light travelling around it, replacing the static glyph.
- `color-scheme` is declared per theme, so the browser paints date-picker and
  spinner glyphs light on the dark canvas instead of near-black.
- The settlement modal was the last dialog hand-rolling its own overlay; it is
  now on the shared `Sheet`.
- Navigation gained depth, a gradient brand mark and a spring-slid active pill.


### Changed — 2026-09-05 (home-page animation language, from the KP reference build)
- **Entrance animations now trigger on IntersectionObserver, never ScrollTrigger.**
  New `src/lib/motion.ts` carries the reference build's contract: `observeOnce`,
  `tickWhileVisible`, `withWillChange`, `prefersReducedMotion`, plus
  `onPageRevealed`, which gates an entrance on the loader's `utw:loaded` signal
  with a 6-second fallback so a missing signal cannot leave the first screen
  blank. `ScrollReveal` is rebuilt on it, which also retires the safety net and
  settle-timer the ScrollTrigger version needed. Recorded as ADR 008.
- **The hero is pinned with `position: sticky`, not a ScrollTrigger pin.** A
  `240svh` runway holds a `100svh` sticky stage; a paused GSAP timeline is
  scrubbed from `window.scrollY` on `gsap.ticker`, gated to on-screen only and
  smoothed with a 0.14 lerp. Two beats: the hero copy departs (lifts, shrinks,
  fades) and the stats panel composes in behind it, counting up from 65% of
  target.
- **Hero headline rack focus.** Each line snaps from `scale(1.18) blur(22px)` to
  sharp over 1.4s on `expo.out`, 0.12s apart, after the supporting items fade up
  on a 0.075 stagger. Once settled, a slow idle loop dips one random letter and
  recovers it. The eyebrow decodes through glyphs via the new
  `scrambleDecode` / `ScrambleText`.
- `StatsSection` moved out of the hero copy into the stage's lower panel and now
  owns no animation of its own — the hero timeline drives it by data attribute.
  The real figures stay in the markup for reduced motion, crawlers and no-JS.
- Feature grid, How-it-works and the CTA reveal through the shared `ScrollReveal`
  on the reference's `expo.out` curve. Motion keeps the hover lifts; GSAP owns
  the entrances.
- Added `ScrollCue`: the stage holds still for more than a screen of scrolling,
  which without a hint reads as a stuck page.

- **Hero is no longer pinned.** The reference build pins its hero to reveal a
  full-bleed photograph behind the departing copy; this product has no such
  image, so the sequence held an empty stage while the visitor scrolled. The
  runway, sticky stage, depart/compose timeline and scroll cue are gone; the
  entrance animation is kept in full. `StatsSection` returns to normal flow with
  its own observer-triggered reveal and count-up. (ADR 008 §2, withdrawn.)
- **Sections arrive from different directions.** `ScrollReveal` gained `from`
  and `fromCycle`: feature cards cycle left → bottom → right, process steps
  arrive from the left, section headings from the top, the CTA from below.
- **Night canvas is now neutral charcoal / graphite** — `#0e0f10` → `#141517` →
  `#0b0c0d`, surfaces `#191b1d` / `#131416` / `#090a0b`, and a neutral text ramp
  (`#f2f3f4` / `#b4b7bb` / `#83878c` / `#585c61`). The violet accent family is
  unchanged and is now the only colour on the page. The hero's radial accent
  washes are gone. Day mode is untouched. Recorded as ADR 009.
- **The sweeping accent border is shared and parameterised.**
  `.animated-gradient-border` gained `--border-spin-duration`, and now runs on
  the capability pills (5.5–8.2s, staggered so they do not pulse in lockstep)
  and the stats panel (11s) as well as every `SoftCard` (6s). The pills gained
  the clay convex shadow and joined the hero's entrance stagger instead of
  running their own Motion fade on a stale hardcoded delay.
- The loading screen reads `var(--background)` instead of a hardcoded `#0f0b18`,
  so it opens onto the same canvas as the page.

### Removed — 2026-09-05
- `src/hooks/useGsapScrollTrigger.ts`, unused once the reveals moved to
  IntersectionObserver.
- The pinned-hero CSS (`.hero-runway` / `.hero-stage` / `.hero-lower`), the
  `.hero-scenic-*` rules, and `public/hero-scenic-day.jpg` /
  `hero-scenic-night.jpg` (638 KB) — no component had referenced the images
  since the image-free hero landed.
- The ScrollTrigger registration and Lenis→ScrollTrigger bridge in
  `SmoothScrollProvider`. No component uses ScrollTrigger any more, so the plugin
  was being loaded and wired for nothing.


### Fixed — 2026-09-05 (full UX/code audit)
- **App screens were rendering largely unstyled.** ~18 Tailwind class names used across every
  screen (`text-foreground`, `text-muted-foreground`, `bg-muted`, `text-destructive`,
  `bg-brand-accent`, `shadow-soft-inner`, `shadow-soft-outer`, `shadow-soft-accent`, …) were
  never defined in `tailwind.config.ts` and produced zero CSS rules. All are now real tokens
  backed by `--success` / `--warning` / `--danger` / `--accent-shadow` variables in both themes.
- **`darkMode` never matched.** Changed from `["class"]` to `["selector", "html:not(.light)"]`,
  since the theme switches on `.light` with night as the default. No `dark:` variant in the
  codebase had ever activated.
- **Currency symbols rendered as the literal `{currencySymbol}`** — `country-codes-list` has no
  such field. Symbols now come from `Intl.NumberFormat` with `currencyDisplay: 'narrowSymbol'`.
- **The "add trip" button was unreachable on phones**, sitting at `z-30` beneath the `z-40`
  bottom navigation bar; it only reappeared in landscape, when the mobile bar swapped for the
  desktop header. Moved clear of the bar, and a visible "New trip" button was added beside the
  heading.
- **Navigation was hidden on the expense, exchange and summary screens.** It now renders on
  every route (Home · Trips · Calculator · Backup).
- **Deleting a trip orphaned all of its data.** `TripRepository.delete` removed only the trip
  row; it now cascades across all nine trip-scoped tables in one transaction.
- **Category icons had no colour** — they were styled with interpolated `bg-${color}-100`
  classes that Tailwind cannot see at build time. Replaced with `GradientIconTile` driven by a
  shared deterministic colour→gradient table.
- **Default categories were seeded only when the categories screen was opened**, so a new user's
  first expense had an empty category list. Seeding now runs on app start.
- **Closed dialogs stayed in the DOM as invisible full-screen click-blockers.**
  `AnimatePresence` was not unmounting its child from inside a portal; the shared `Sheet` now
  controls mounting explicitly and drops `pointer-events` while closing (ADR 007).
- **The dialog scroll-lock leaked**, leaving the page permanently unscrollable: the effect
  depended on an inline `onClose` arrow and each run captured the `hidden` its predecessor had
  just written.
- Removed every `backdrop-blur` in the product (ADR 005 forbids blur and translucency) and
  replaced hardcoded emerald/amber values with the semantic `--success` / `--warning` tokens.
- `SoftButton` size `lg` used `h-13`, which is not a Tailwind spacing step, so the large button
  had no height rule.
- Landing page dead ends: navbar links to non-existent `#travel-smarter` and `#faq` sections
  removed; "Create your first trip" and "Start a trip" now open `/trips/new`.

### Added — 2026-09-05
- **Plain-language currency model (ADR 006).** `Trip` gained `localCurrency` alongside
  `baseCurrency`, with a Dexie **schema v2** migration that backfills existing trips from their
  country. The interface drops "base"/"target" in favour of *"Money you count in"* and
  *"Money you'll spend there"*, always shown with the symbol.
- **Country-driven currency.** New `src/lib/countries.ts` maps 250 countries to flag and ISO
  currency; picking the destination fills the local currency in.
- **Globally remembered currencies.** New `settings-repository.ts` and `useCurrencyPreferences`
  preselect the chosen currencies on every later screen, including the calculator, which no
  longer asks on every visit.
- **`SearchableSelect`** — one keyboard-navigable searchable dropdown, matching code, name and
  symbol, with an inline "create what you typed" action. Replaces MUI Autocomplete.
- **`Sheet`** — the single dialog shell (bottom sheet on phones, centred dialog above `sm`),
  replacing per-modal overlay markup. Satisfies Point 92's `BottomSheet` / `ConfirmDialog`.
- **`CurrencyAmount`** — Point 92's mandatory money renderer: muted symbol, solid tabular digits.
- **`SegmentedControl`, `PeoplePicker`, `CountrySelect`, `ScrollReveal`,
  `useGsapScrollTrigger`.**
- **Delete a trip, safely.** `DeleteTripDialog` offers a full JSON backup and an expenses CSV and
  keeps "Delete forever" disabled until the user downloads a copy or explicitly declines one.
  `BackupService` gained `collectTripData`, `exportTripToJson` and `exportTripExpensesToCsv`.
- **Quick access from the trips list** — a per-card menu for Add expense, Record exchange,
  Analytics, Summary report and Delete.
- **Personal vs shared expenses (Points 12 & 13).** Every expense used to be written as shared
  and split across all participants. There is now a personal/shared choice, a companion picker
  for who the bill is split between with a live per-person preview, and inline creation of a
  person, a category or a wallet without leaving the form (Point 4).
- **Explicit payment method (Point 15)** — Cash, Card, UPI, Bank, Other, instead of the previous
  `walletId ? 'WALLET' : 'CASH'`.
- **All 15 baseline categories (Point 14)** seeded idempotently by stable id, with the two legacy
  extras kept and custom categories untouched. Custom categories can now be deleted.
- **Exchange screen derives its currencies from the trip** (removing a hardcoded `IDR` that
  violated Points 5 and 71), auto-fills the received amount from the live rate as you type, and
  offers inline wallet creation on both sides.
- **Point 40 implemented.** The calculator's "Add as expense" was a hardcoded `alert()`; it now
  carries the negotiated price, currency and Shopping category into the trip's expense form.
- **GSAP home page.** Hero headline animates word by word out of a per-line mask with rotation
  and blur, the lines parallax apart on scroll, two background washes drift at different rates,
  and every section reveals through a shared `ScrollReveal` built on ScrollTrigger. The reveal
  cannot strand content: nothing hides until GSAP loads, an IntersectionObserver runs alongside
  the trigger, and a timer writes the finished state if the tween has not completed.
- Settlement wording moved to the Point 20 vocabulary ("You pay X" / "You take from X").

### Changed — 2026-09-05
- Removed `@mui/material`, `@emotion/react`, `@emotion/styled` (Point 98 / Rule 68 forbid mixing
  in a competing UI system).
- `framer-motion` `12.4.7` → `12.23.12`, with `motion-dom` pinned to the matching `12.23.12`.
  framer-motion declares `^12.23.12`, but `motion-dom@12.43.0` satisfies that range while having
  removed the `activeAnimations` export it imports, which fails the build (ADR 007).
- Test suite grew from **52 tests across 16 files to 68 across 18**, adding cascade-deletion,
  per-trip export, country→currency mapping, symbol resolution and baseline-category coverage.

### Added
- **Responsive Multi-Device & Desktop Transformation (Points 86 & 87):**
  - Upgraded `BottomNav` to render as a fixed bottom navigation bar on mobile (`< md`), and transform into a top navigation bar with brand logo and quick links on desktop (`≥ md`).
  - Converted Trip Dashboard (`/trips/[id]`) into a responsive 3-column desktop grid split (`lg:grid-cols-3 gap-6`).
  - Expanded Trips Page (`/trips`) grid layout for tablet and desktop (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
  - Redesigned Standalone Calculator (`/calculator`) with side-by-side currency input cards on desktop (`md:grid-cols-2`).
- **Per-Trip Dashboard Graphs & Verification (Point 73 & 52):**
  - Built `MiniAnalyticsCard` embedding a dynamic Category Spending Donut Chart preview directly on the main Trip Dashboard for every trip.
  - Added unit test suite `backup-service.test.ts` verifying IndexedDB data persistence, full JSON export, and data restoration. Verified **52 out of 52 unit tests passing**.
- **Advanced Native Mobile UX Enhancements:**
  - Integrated `navigator.vibrate` haptic feedback into `SoftButton` for native touch feel.
  - Installed `recharts` and created `/trips/[id]/analytics` route featuring Category Donut Charts and Daily Spending Area Charts.
  - Built `BillChipsInput` for zero-typing cash additions (+100K, +50K, etc.) on the Expense form.
  - Built `OfflineBadge` for live network connection status alerts.
- **Apple-Grade GSAP & Framer Motion Animation Layer (Points 64, 65, 66):**
  - Integrated GSAP (`gsap`) and created `AnimatedNumber` for smooth numeric financial interpolation on metrics, wallets, and expense receipts.
  - Built `StaggerContainer` and `StaggerItem` with Framer Motion spring physics (`stiffness: 350, damping: 25`) for cascading entrance transitions.
  - Upgraded `SoftCard` with spring hover elevations and responsive tap physics.
- **Backup & Restore (Point 52 - 100% Baseline Completion):**
  - Created `BackupService` with complete IndexedDB JSON export, CSV expense export, and conflict-safe JSON restoration logic.
  - Built `/settings/backup` UI route for offline file downloads and data restoration.
- **Mobile UI/UX Enhancements (Points 0, 87, 89):**
  - Built persistent `BottomNav` with Framer Motion spring-animated indicators for instant switching between Trips and Calculator views.
  - Added spring-assisted tactile feedback to all `SoftButton` elements (`whileTap={{ scale: 0.96 }}`).
  - Built `ThemeToggle` for native Light (Claymorphism) and Dark (Neumorphism) mode switching.
- **Currency Exchange & Wallet Integration (Points 7, 8, 10):**
  - Created `ExchangeRepository` with Dexie transaction integrity for dual wallet adjustments.
  - Built `/trips/[id]/exchange` page with real-time rate checking, market rate comparisons, gain/loss calculation, and location/provider tracking.
- **Budget Management & Alerts (Points 1, 23, 24):**
  - Added `BudgetRepository` and `BudgetProgressCard` UI with dynamic warning thresholds (Green, Amber, Red/Destructive when budget > 80% or exceeded).
- **Cash Counting Mode (Points 41 & 42):**
  - Created `CashCounterModal` for physical bill counting (100K, 50K, 20K, 10K, etc.) with real-time feedback on exact, short, or extra change against target prices.
- **End-of-Trip Summary Report (Point 51):**
  - Created `/trips/[id]/summary` route with trip header info, total spent, daily average spending, category breakdown with percentages, final wallet balances, and budget audit results. Supports window printing / PDF exports.
- **Automated Settlements & Balances (Points 16 & 18):**
  - Created `BalanceEngine` to dynamically analyze all expenses, map debts, and simplify them using a greedy graph algorithm.
  - Designed the `SettlementModal` allowing 1-tap debt resolution with transactional wallet deductions.
  - Embedded `ParticipantBalancesList` into the Trip Dashboard, automatically generating plain-English debt statements ("You owe X", "Y owes you").
- **Core Expense Logging (Points 13 & 14):**
  - Built `ExpenseRepository` featuring Dexie Transactions to atomically deduct balances from Wallets when expenses are logged.
  - Built `/trips/[id]/expense` UI allowing users to select the payer, category, and wallet, whilst fetching live API rates to record both original and base amounts.
- **Dashboard & Analytics (Point 17):**
  - Bound the Trip Dashboard "Total Spent" metric to a live mathematical hook that accurately tracks and sums `baseAmount` conversions of all trip expenses.
  - Rendered `ExpenseList` inside the Trip Dashboard to display recent transactions chronologically.
### Changed
- **Global Settings & UI Rebuild:**
  - Integrated `country-codes-list` package to dynamically generate 150+ currencies with native emoji flags.
  - Replaced all currency dropdowns with `@mui/material/Autocomplete` styled seamlessly with Tailwind.
  - Implemented real-time open-source API (`@fawazahmed0/currency-api`) for global exchange rates.
  - Upgraded `NegotiationCalculator` to feature 2-way input bindings (typing in base or target box syncs the other).
- **Category Management (Point 15):**
  - Added `CategoryRepository` that seeds the required default categories (Food, Transport, etc.).
  - Added `CategoryList` and `AddCategoryModal` UI.
  - Added route `/trips/[id]/categories` for category management.
- **Participant Management (Point 3):**
  - Upgraded `TripRepository` to automatically seed a "You" (`isUser=true`) participant upon trip creation using a DB transaction.
  - Added `ParticipantList` horizontally scrolling UI.
  - Added `AddParticipantModal` to allow adding companions before tracking shared expenses.
- **Wallet Management (Points 9 & 10):**
  - Built `WalletRepository` and `WalletMapper` to persist wallets to Dexie.
  - Added `WalletList` and `CreateWalletModal` to the Trip Dashboard to create and track cash/card balances.
  - Live query updates ensure new wallets render instantly without a refresh.
- **Trip Management (Points 1 & 2):** 
  - Added Hexagonal architecture repository `TripRepository` wrapped around Dexie for offline persistence.
  - Implemented `/trips` list view using `useLiveQuery` for instant UI updates.
  - Implemented `/trips/new` for robust form creation using React Hook Form + Zod.
  - Implemented `/trips/[id]` dashboard shell providing quick actions.
- **Standalone Negotiation Calculator:** Implemented a global `/calculator` route allowing users to negotiate prices without an active trip. Includes a `CurrencySetupModal` to manually select Base and Target currencies.
- **Negotiation Domain Service:** Added `NegotiationCalculatorService` wrapping percentage math and shorthand parsing logic, supported by unit tests.
- **Calculator Hook:** Created `useNegotiationCalculator` mapping domain state to the UI and integrating with `CompositeRateManager` for live rate fetching.
- **Calculator UI Redesign:** Rebuilt `NegotiationCalculator` to use a single, simple native input box (supporting K/M shorthand) instead of a custom numpad. Added manual inline editing for exchange rates.

- Configured and verified UI/UX Pro Max supporting intelligence tool integration.
- Added Rule 74 to `.ai/RULES/04-UI-UX-AND-MOTION.md` governing UI/UX Pro Max usage and prohibiting `--persist` / `MASTER.md` creation.
- Recorded ADR 002 in `.ai/DECISIONS.md` establishing UI/UX Pro Max as supporting design intelligence under `design-system/universal-travel-wallet.md`.
- Created `.ai/HISTORY/2026-09-04_ui_ux_pro_max_integration_governance.md` recording UI/UX Pro Max governance verification.
- **Separated Multi-Layer 3D Hero & Parallax Architecture:** Replaced flattened hero illustration with independently animated components across 8 depth tiers: `Wallet`, `Globe`, `Airplane`, `CurrencyBubbleGroup` ($, €, £, ¥, Rp), `OrbitPath`, `DecorativeTravelText`, and `HeroParticles`. Generated dedicated light and dark mode assets in `public/assets/dark/` and `public/assets/light/`.
- **GSAP & Framer Motion Integration:** Implemented cinematic line-by-line GSAP headline entrance with blur reduction, GSAP-driven viewport-triggered numeric counter animations (`0 → 100%`, `0 → 180+`, and `∞`), animated CTA with forward-traveling airplane icon, and smooth spring lerp mouse hover parallax.
- **Light & Dark Mode Architecture:** Built responsive theme-aware styling where all assets, backgrounds, cards, typography, and glows adapt cleanly without visual flashing.

### Changed
- **Full-Width Image-Free Hero Section:** Converted the hero section from a 2-column layout into a centered, full-width presentation without any images. Centered all elements (badge, headline, paragraph, CTA buttons, feature pills, stats) with expanded typography (`text-4xl sm:text-6xl lg:text-7xl font-extrabold`) and centered pure-CSS ambient radial glow wash. Preserved GSAP line-by-line entrance, numeric counters (`0 → 100%`, `0 → 180+`, `∞`), and CTA micro-interactions.
- Normalized design system canonical path from `design-system/universal-travel-wallet-design-system-v2.md` to [design-system/universal-travel-wallet.md](file:///d:/awi/universal-travel-wallet/design-system/universal-travel-wallet.md) and updated all documentation references.
- **Material system replaced: Liquid Glass → Soft Tactile UI (Claymorphism · Skeuomorphism · Neumorphism).** Rewrote `design-system/universal-travel-wallet.md` in full (Sections 1, 3–7, 10–14, 16, 20, 24–30, 34, 36–43 touched): opaque clay (day mode) / neumorphic (night mode) surfaces with dual-tone soft shadows replace all `backdrop-filter`/translucent glass; accent family moves from blue/cyan to violet/purple; night-mode canvas becomes dark purple (`#15101F`→`#0F0B18`), day-mode canvas becomes white with a soft lavender gradient wash (`#FFFFFF`→`#F1EDFC`); neon/glow effects are now explicitly forbidden everywhere. Motion (Framer Motion) is retained and GSAP + parallax are formally added as first-class animation tools alongside it. Recorded as ADR 005 in `.ai/DECISIONS.md`. Updated `.ai/PROJECT_KNOWLEDGE.md` (Point 99, Section 10) and `.ai/RULES/04-UI-UX-AND-MOTION.md` (Rules 41, 73, 74) so the frozen docs no longer reference Liquid Glass as the mandated material.
- **KP-style loading screen + mobile-first responsive landing page.** Added `src/components/loading/` (door-split GSAP reveal, adapted from a sibling project's loading screen, re-themed to the violet Soft Tactile brand) and `src/components/providers/SmoothScrollProvider.tsx` (Lenis driven by `gsap.ticker`, feeding `ScrollTrigger`). Rebuilt `src/app/page.tsx` on new `src/components/landing/` sections (Hero with GSAP scroll-parallax, FeatureGrid, HowItWorks, CTASection, Footer) using mobile-first Tailwind breakpoints. Replaced `GlassCard`/`GlassButton` with `SoftCard`/`SoftButton` and re-themed `GradientIconTile` to the pastel clay palette, per ADR 005. Rewrote `globals.css`/`tailwind.config.ts` with the ADR-005 color/shadow/radius tokens. Bound `Inter` to `--font-geist-sans` in `layout.tsx` (was previously unbound, a latent Phase-1 gap — headings were silently falling back to the browser's serif font). Added `gsap` and `lenis` dependencies; pinned `motion-dom` to `12.4.5` via a package.json `overrides` entry after `framer-motion@12.4.7` resolved to an incompatible newer `motion-dom` that broke several exports.

### Removed
- **3D Card & Hero Visual Illustration:** Removed `HeroVisual` (3D wallet, globe, floating currency tokens, airplane orbit, and particles) from the hero section per user instruction to produce an image-free full-width hero.
- **Particle Universe & WebGL 3D Animation:** Removed `TravelUniverseLoader` from `src/app/layout.tsx`, removed `JourneyStages` and `#travel-journey` wrapper from `src/app/page.tsx`, and removed `src/components/universe/`. Removed unused dependencies (`three`, `@react-three/fiber`, `@react-three/drei`) from `package.json`. Production build bundle size dropped significantly.
