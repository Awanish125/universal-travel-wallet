# Agent-Learned & Recommended Engineering Rules

> **CLASSIFICATION:** User-Defined Rule 47 + AI Agent Recommended Rules  
> **RULE GUARANTEE:** These agent-recommended rules reinforce code quality, maintainability, and scalability. They do NOT override, modify, or contradict any user-defined rule or frozen specification point in `.ai/PROJECT_KNOWLEDGE.md`.

---

### [USER-DEFINED RULE] Rule 47: New Rules Must Be Recorded
If a recurring engineering lesson is discovered, add it to `.ai/RULES/99-AGENT-LEARNED-RULES.md`.  
Only add broadly reusable rules. Do not create a permanent rule for a one-time implementation detail.

---

## Agent-Recommended Rules (Added by AI Assistant)

### [AGENT-RECOMMENDED RULE] Rule A-1: TypeScript Strictness & Explicit Domain Types
- Always enable strict mode in TypeScript (`strict: true`).
- Define explicit interfaces and types for all domain models (e.g. `Trip`, `Expense`, `Participant`, `Wallet`, `ExchangeRecord`, `Settlement`).
- Never use `any` type in business logic or financial calculations. Use `unknown` with type guards if handling dynamic inputs.
- Export shared domain types from central domain type files (e.g. `@/domains/trip/types.ts`).

---

### [AGENT-RECOMMENDED RULE] Rule A-2: Precise Money Representation (Minor Units or BigInt)
- To prevent floating-point calculation errors in financial logic, store monetary amounts either in integer minor units (e.g., cents, paise, rupiahs) or use a high-precision decimal utility class (e.g. `Decimal.js` or `bignumber.js`) for arithmetic before converting to user-facing strings.
- Centralize all formatting (`formatCurrency(amount, currency, formatType)`) inside the reusable Currency Service.

---

### [AGENT-RECOMMENDED RULE] Rule A-3: Component State vs. Global Domain Store Boundaries
- Keep transient UI state (e.g. modal open/close state, uncommitted form inputs, active tab selection) inside local component state (`useState`).
- Keep persistent application domain state synchronized with IndexedDB via Dexie live queries (`useLiveQuery`).
- Do not duplicate Dexie entities into global Zustand/Redux stores unless explicitly required for performance, to prevent out-of-sync state bugs.

---

### [AGENT-RECOMMENDED RULE] Rule A-4: Safe Dexie Database Schema Versioning
- Define IndexedDB schemas with Dexie versioning syntax (`db.version(1).stores({...})`).
- When modifying database tables or indexes, increment the version number and write an explicit migration function to transform existing user data safely.
- Never delete or drop columns without fallback migration code to preserve data integrity across app updates.

---

### [AGENT-RECOMMENDED RULE] Rule A-5: PWA Service Worker Update Strategy
- Configure the PWA service worker with an update-ready notification strategy rather than force-reloading active sessions while users are entering financial transactions.
- Static application assets must be precached for offline availability, while network requests for current exchange rates must use a Network-First or Stale-While-Revalidate strategy with IndexedDB fallback.

---

### [AGENT-RECOMMENDED RULE] Rule A-6: Form Validation & Accessible Error Placement
- Pair React Hook Form with Zod schemas for all form controls.
- Display validation errors immediately below the relevant form field using accessible ARIA attributes (`aria-invalid="true"`, `aria-describedby="field-error-id"`).
- Provide touch-friendly clear buttons and large touch targets (minimum 44x44px) for mobile usability.

---

### [AGENT-RECOMMENDED RULE] Rule A-7: Every Utility Class Must Exist in the Theme
Tailwind only emits a class that appears literally in the source *and* resolves to a real theme
key. Two failures follow from ignoring that, and both are silent — the page renders, it just
renders wrong:

1. **Invented class names.** `text-foreground`, `bg-brand-accent`, `shadow-soft-inner` and a
   dozen others were used across every app screen while `tailwind.config.ts` defined none of
   them. Nothing warned; the screens simply had no colour or shadow.
2. **Interpolated class names.** `` bg-${color}-100 `` cannot be seen by Tailwind's scanner, so
   the class is never generated. Map dynamic values to a **fixed table** of complete class names
   or design-system roles instead.

When adding a screen, grep the built stylesheet for any token you are unsure of:
`grep -c '\.text-foreground' .next/static/css/*.css`. Zero means it does not exist.

Check the `darkMode` strategy matches the class the app actually toggles. This project switches
on `.light` with night as the default, so `darkMode: ["class"]` matched nothing and every
`dark:` variant was dead.

---

### [AGENT-RECOMMENDED RULE] Rule A-8: A Fixed Overlay Must Never Be Able to Trap the User
An overlay that fails to unmount is worse than one that never animates: it covers the viewport,
keeps `pointer-events`, and swallows every click with no visible cause.

- Do not rely on a third-party presence/exit abstraction to remove a portalled overlay. Control
  mounting explicitly and, while closing, set `pointer-events: none` so a delayed teardown cannot
  block anything.
- A body scroll lock must capture the value it will restore **only when it opens**. An effect
  that depends on an inline callback re-runs every render, and each run captures the `hidden` its
  predecessor just wrote — the final cleanup then restores `hidden` permanently.
- The same principle covers scroll-driven reveals: never let content's visibility depend solely
  on an animation firing. Hide nothing until the animation library has loaded, and provide a
  fallback that reveals the content if the trigger has not.

---

### [AGENT-RECOMMENDED RULE] Rule A-9: Verify a Data Package Actually Has the Field
`src/lib/currencies.ts` asked `country-codes-list` for `{currencySymbol}`. The package has no
such field, so it returned the placeholder token verbatim and every currency in the product
displayed the literal text `{currencySymbol}`. Template-string data APIs fail silently.

Before shipping a mapping over a data package, print one real record and confirm the field
exists. Prefer a platform capability when one covers it — currency symbols come from
`Intl.NumberFormat(..., { currencyDisplay: 'narrowSymbol' })` with no dependency at all.

---

### [AGENT-RECOMMENDED RULE] Rule A-10: Pin Transitive Versions of a Split Animation Runtime
`framer-motion` declares `motion-dom` with a caret range, but published `motion-dom` versions
inside that range have removed exports `framer-motion` imports (`activeAnimations`). The result
is a hard build failure that looks like a project error.

Pin `motion-dom` to the exact version the installed `framer-motion` was published against, and
change both together. After any change to either, delete `.next` and rebuild — a stale dev-server
cache reports the old module graph and sends you chasing the wrong bug.

---

### [AGENT-RECOMMENDED RULE] Rule A-11: Deleting a Parent Record Must Delete Its Children
IndexedDB enforces no foreign keys. `TripRepository.delete` removed only the trip row, leaving
expenses, wallets, movements, exchanges, settlements, budgets and negotiations permanently
orphaned — invisible to the user, but still counted by any global query.

Delete every child table in the **same transaction** as the parent, so a partial failure leaves
the record intact. And where the data is irreplaceable and local-only, offer an export before the
deletion rather than after it: there is no server copy to fall back on.

---

### [AGENT-RECOMMENDED RULE] Rule A-12: Trigger Entrances With IntersectionObserver, Not ScrollTrigger
Adopted from the KP reference build (`D:/awi/KP`), whose motion layer this
project now mirrors. See ADR 008.

- A **one-shot reveal** wants an observer. ScrollTrigger recomputes start and end
  points against the smooth-scroll runtime on every scrolled frame; an observer
  costs nothing until it fires. Reserve ScrollTrigger for genuinely *scrubbed*
  motion, and prefer a `position: sticky` stage over a ScrollTrigger pin — a pin
  repositions a viewport-sized layer every scrolled frame.
- **Per-frame work runs on `gsap.ticker`, gated to on-screen only.** The ticker
  is shared with Lenis, so a throwing callback must eject itself rather than take
  page scrolling down with it.
- **Set `will-change` immediately before a tween and clear it on completion.**
  An idle section must not hold a compositor layer.
- **Cache scroll measurements; re-read only on resize.** Never measure layout
  inside a tick.
- **No `filter: blur()` in a scrubbed tween** — blur re-rasterises the layer on
  every frame. A one-shot entrance that resolves to `blur(0px)` is fine, and is
  animation rather than material, so it does not conflict with ADR 005's ban on
  translucent surfaces.
- **Hide elements with `gsap.set` after mount, never in JSX.** Reduced motion, a
  crawler and a failed script then all render the finished content. When an
  entrance hides copy that a visitor must see, gate it on the loader signal *and*
  give that gate a timeout.

