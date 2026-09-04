# Request History: Engineering & AI-Agent Rules Setup

- **Date:** 2026-09-04
- **User Request:** Organize user-provided Core AI Engineering Rules (Rules 1–72) into appropriate rule files inside `.ai/RULES/`, add best-practice agent-recommended rules without contradicting `.ai/PROJECT_KNOWLEDGE.md`, distinguish user rules from agent rules, and preserve history.
- **Result:** Created full `.ai/RULES/` structure containing:
  - `README.md`: Index and legend mapping all rules.
  - `00-CORE-RULES.md`: Core operating rules (Rules 1, 4, 5, 6, 7, 48, 49, 53, 54, 70, 71, 72).
  - `01-WORKFLOW-AND-RECORDING.md`: Workflow, HLD/LLD, verification, and ADR recording (Rules 2, 3, 9, 10, 11, 38, 39, 40, 46, 50, 51, 52).
  - `02-ARCHITECTURE-AND-DESIGN.md`: Best practices, readability, maintainability, modularity, dynamic reusability, coupling, cohesion, single source of truth, composition (Rules 8, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 28, 29, 30, 55, 56, 57, 58, 59, 65, 66).
  - `03-FINANCIAL-AND-OFFLINE.md`: Financial logic ownership, precision, immutability, offline-first, database abstraction (Rules 21, 32, 33, 34, 35, 36, 37).
  - `04-UI-UX-AND-MOTION.md`: Visual usability, motion rules, accessibility, state handling, consistency (Rules 41, 42, 62, 64, 69).
  - `05-DEPENDENCIES-AND-RESEARCH.md`: Dependency research, documentation preference, discipline, stack adherence (Rules 24, 25, 26, 27, 67, 68).
  - `06-REFACTORING-AND-QUALITY.md`: Reusable animations, functionality preservation, incremental refactoring, performance, error handling (Rules 31, 43, 44, 45, 60, 61, 63).
  - `99-AGENT-LEARNED-RULES.md`: User Rule 47 + Agent-recommended rules for TypeScript strictness, financial precision, Dexie schema versioning, state management, PWA lifecycle, and form accessibility.
