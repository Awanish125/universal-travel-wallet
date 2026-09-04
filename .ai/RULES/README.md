# Universal Travel Wallet — Engineering & AI-Agent Rules Index

This directory contains the mandatory engineering standards, architectural guidelines, and operational procedures for developing the Universal Travel Wallet project.

## Rule Organization

The rules are categorized into the following domain-specific files:

- **[00-CORE-RULES.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/00-CORE-RULES.md)**  
  Rules 1, 4, 5, 6, 7, 48, 49, 53, 54, 70, 71, 72.  
  *Core AI operating principles, project knowledge loading, frozen knowledge immutability, append-only history, rule priority, and the final development loop.*

- **[01-WORKFLOW-AND-RECORDING.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/01-WORKFLOW-AND-RECORDING.md)**  
  Rules 2, 3, 9, 10, 11, 38, 39, 40, 46, 50, 51, 52.  
  *Task execution lifecycle, request/result recording, HLD/LLD requirements, verification standards, ADR recording, and result reporting.*

- **[02-ARCHITECTURE-AND-DESIGN.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/02-ARCHITECTURE-AND-DESIGN.md)**  
  Rules 8, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 28, 29, 30, 55, 56, 57, 58, 59, 65, 66.  
  *High-level architectural standards, code readability, discoverability, maintainability, component modularity, dynamic reusability, loose coupling, separation of concerns, single source of truth, and composition.*

- **[03-FINANCIAL-AND-OFFLINE.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/03-FINANCIAL-AND-OFFLINE.md)**  
  Rules 21, 32, 33, 34, 35, 36, 37.  
  *Financial logic ownership, financial precision, historical financial immutability, offline-first architecture, database encapsulation (Dexie/IndexedDB), and migration safety.*

- **[04-UI-UX-AND-MOTION.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/04-UI-UX-AND-MOTION.md)**  
  Rules 41, 42, 62, 64, 69.  
  *Apple Liquid Glass visual rules, Motion animation principles, accessibility standards, state handling (loading/empty/error/offline), and design system consistency.*

- **[05-DEPENDENCIES-AND-RESEARCH.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/05-DEPENDENCIES-AND-RESEARCH.md)**  
  Rules 24, 25, 26, 27, 67, 68.  
  *Package research, official documentation prioritization, dependency discipline, technology stack enforcement, and UI framework discipline.*

- **[06-REFACTORING-AND-QUALITY.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/06-REFACTORING-AND-QUALITY.md)**  
  Rules 31, 43, 44, 45, 60, 61, 63.  
  *Reusable animation extractions, preserving existing functionality, incremental modifications, refactoring criteria, performance rules, and error handling.*

- **[99-AGENT-LEARNED-RULES.md](file:///d:/awi/universal-travel-wallet/.ai/RULES/99-AGENT-LEARNED-RULES.md)**  
  Rules 47 + Additional Agent-Recommended Engineering Rules.  
  *Continuous engineering rules learned by the AI, clearly demarcated from user-defined rules.*

---

## Rule Classification Legend
- `[USER-DEFINED RULE]`: Mandatory rule provided explicitly by the product owner/user.
- `[AGENT-RECOMMENDED RULE]`: Best-practice engineering rule added by the AI assistant to reinforce quality, testability, and scalability.
