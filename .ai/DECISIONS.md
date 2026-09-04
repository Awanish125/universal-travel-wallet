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
