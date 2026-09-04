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
- Configured and verified UI/UX Pro Max supporting intelligence tool integration.
- Added Rule 74 to `.ai/RULES/04-UI-UX-AND-MOTION.md` governing UI/UX Pro Max usage and prohibiting `--persist` / `MASTER.md` creation.
- Recorded ADR 002 in `.ai/DECISIONS.md` establishing UI/UX Pro Max as supporting design intelligence under `design-system/universal-travel-wallet.md`.
- Created `.ai/HISTORY/2026-09-04_ui_ux_pro_max_integration_governance.md` recording UI/UX Pro Max governance verification.

### Changed
- Normalized design system canonical path from `design-system/universal-travel-wallet-design-system-v2.md` to [design-system/universal-travel-wallet.md](file:///d:/awi/universal-travel-wallet/design-system/universal-travel-wallet.md) and updated all documentation references.
