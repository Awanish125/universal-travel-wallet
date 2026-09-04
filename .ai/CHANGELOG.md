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
