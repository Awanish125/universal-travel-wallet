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
