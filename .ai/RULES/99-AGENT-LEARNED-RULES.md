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
