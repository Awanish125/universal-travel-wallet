# AGENTS.md — AI Agent Operating Instructions & Workflow Guide

> **NOTICE TO ALL AI CODING AGENTS:**  
> This file is the primary entry point for any AI session working on **Universal Travel Wallet**.  
> Do NOT rely on conversation memory. The repository files are the persistent memory and single source of truth.  
> You MUST read and follow the mandatory workflow below for EVERY request before writing or editing code.

---

## 1. Mandatory Development Workflow Loop

For **EVERY** project-related request, you MUST execute the following 16-step development loop:

1. **Read Project Knowledge:** Read [.ai/PROJECT_KNOWLEDGE.md](file:///d:/awi/universal-travel-wallet/.ai/PROJECT_KNOWLEDGE.md) completely to understand frozen product requirements.
2. **Read Engineering Rules:** Read all applicable rule files in [.ai/RULES/](file:///d:/awi/universal-travel-wallet/.ai/RULES/README.md) (`00-CORE-RULES.md` through `99-AGENT-LEARNED-RULES.md`).
3. **Read Architectural Decisions:** Read relevant records in [.ai/DECISIONS.md](file:///d:/awi/universal-travel-wallet/.ai/DECISIONS.md).
4. **Read Project Changelog:** Read [.ai/CHANGELOG.md](file:///d:/awi/universal-travel-wallet/.ai/CHANGELOG.md).
5. **Read Request & Result History:** Read relevant past logs in [.ai/HISTORY/](file:///d:/awi/universal-travel-wallet/.ai/HISTORY/README.md).
6. **Inspect Existing Codebase:** Inspect existing implementation files relevant to the current request.
7. **Search Code Base Before Creating:** Search the existing codebase using search tools (`grep_search`, `find_by_name`) to verify whether components, services, hooks, utilities, calculations, animations, or validators already exist.
8. **Research Web & Packages Before Reinventing:** If the requested feature may already exist as a mature external library (e.g. number animations, date utility), search npm and official documentation before writing custom code.
9. **Formulate HLD / LLD:** Formulate High-Level Design (HLD) for major features or Low-Level Design (LLD) for complex implementations before writing code.
10. **Implement Code:** Write clean, modular, maintainable TypeScript code adhering to all engineering rules.
11. **Test Implementation:** Perform unit tests, type checks, lint checks, and manual flow verifications.
12. **Re-Read Knowledge & Rules:** Re-read [.ai/PROJECT_KNOWLEDGE.md](file:///d:/awi/universal-travel-wallet/.ai/PROJECT_KNOWLEDGE.md) and applicable rules to verify compliance and detect accidental deviations.
13. **Check Regressions:** Verify that existing features, offline behavior, and calculations remain intact.
14. **Record Request & Result:** Create a log entry in `.ai/HISTORY/` recording both the exact `USER REQUEST` and the exact `AI RESULT`.
15. **Update Repository Documentation:** Update `CHANGELOG.md`, `DECISIONS.md`, `PROJECT_KNOWLEDGE.md`, or `99-AGENT-LEARNED-RULES.md` when changes occurred.
16. **Provide Result Report:** Present a detailed result report to the user summarizing changes, files touched, tests performed, and verification status. Never respond with just "Done".

---

## 2. Mandatory Core Protocols

### A. Request & Result History Preservation Protocol
For **EVERY** request, create an append-only record inside `.ai/HISTORY/` capturing:
- **USER REQUEST:** The exact, full text of the user's request, instruction, or bug report.
- **AI RESULT:** Exactly what was implemented, files changed, components modified, services updated, dependencies added/removed, tests executed, decisions made, known limitations, and verification results.

*Generic summaries like "implemented feature X" are strictly forbidden.*

### B. Frozen Baseline Knowledge Protocol
- [.ai/PROJECT_KNOWLEDGE.md](file:///d:/awi/universal-travel-wallet/.ai/PROJECT_KNOWLEDGE.md) contains the initial frozen product baseline (Points 0–99).
- Baseline requirements must **NEVER** be silently deleted, weakened, replaced, contradicted, or reinterpreted.
- If the user explicitly requests a change to a frozen requirement:
  1. Update `.ai/PROJECT_KNOWLEDGE.md`.
  2. Preserve the previous version/history.
  3. Record what changed, why it changed, the date, and explicit user authorization.
  4. Record the change in `.ai/HISTORY/`, `.ai/CHANGELOG.md`, and `.ai/DECISIONS.md`.

### C. Rule System Governance Protocol
- All files in [.ai/RULES/](file:///d:/awi/universal-travel-wallet/.ai/RULES/README.md) are mandatory.
- `[USER-DEFINED RULE]` files must **NEVER** be silently removed or modified.
- `[AGENT-RECOMMENDED RULE]` entries must be clearly identified.
- When new recurring engineering lessons are discovered during development, record them in [.ai/RULES/99-AGENT-LEARNED-RULES.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/99-AGENT-LEARNED-RULES.md).

### D. Reusability & Dynamic Component Protocol
- Always search existing codebase before creating new components or utilities.
- If the same type of UI or logic appears more than once, create **ONE reusable dynamic implementation** configured via props, variants, or slots.
- Copy-pasting components or business logic is **STRICTLY PROHIBITED**.

### E. Code Maintainability & Readability Protocol
Code must be easy for another developer to:
- **Understand:** Clear names, small functions, explicit behavior, simple control flow.
- **Find:** Predictable folder organization and domain-driven naming.
- **Modify & Extend:** Modular, localized, loosely coupled logic.
- **Test:** Clean interface contracts and isolated domain logic.

*Prefer clear, simple, predictable code over technical cleverness.*

### F. Architecture & Financial Precision Protocol
- Maintain **High Cohesion** within domains and **Loose Coupling** between modules.
- Ensure strict **Separation of Concerns**: UI components display data; domain services own calculations.
- Centralize all financial logic in the Currency and Calculation engine (**Single Source of Truth**).
- Enforce **Historical Financial Immutability**: current exchange rates must NEVER rewrite historical transaction values.
- Centralize database access within the Dexie / IndexedDB persistence layer.

### G. Dependency & Web Research Protocol
- Before introducing new functionality, check if an existing mature package provides it.
- Search current web, npm, and official documentation sources.
- Evaluate: Maintenance status, React/TypeScript compatibility, Bundle size, Performance, Accessibility, License, and Offline compatibility.
- Do NOT add dependencies blindly; avoid dependency bloat.

### H. Verification & Completion Protocol
- **NEVER claim "Done" without explicit verification.**
- Before concluding a task, run applicable tests, type checking, linting, build checks, UI checks, offline checks, and financial calculation verifications.
- State clearly in the final report what was verified and any items that could not be verified.

---

## 3. Technology Stack Summary

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling & UI:** Tailwind CSS, `shadcn/ui`, `Base UI`, `Lucide React`
- **Animation:** `Motion` (Framer Motion)
- **Local Persistence:** Dexie.js (IndexedDB abstraction), PWA Service Worker
- **Form Management:** React Hook Form + Zod validation
- **Analytics:** Recharts (2D standard charts)
