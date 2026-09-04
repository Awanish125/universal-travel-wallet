# Architecture, Design & Code Quality Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 8: Best Practices Are Mandatory
Always follow established software engineering best practices.  
Do not choose an implementation simply because it is the quickest way to make the feature work.  
Consider: Maintainability, Readability, Reusability, Testability, Performance, Security, Accessibility, Scalability, Loose coupling, Separation of concerns, Simplicity, Long-term maintenance.  
Prefer proven patterns over clever solutions.

---

### [USER-DEFINED RULE] Rule 12: Most Important Rule — Code Must Be Easy to Understand
Write code that another developer can understand quickly.

**Prefer:** Clear names, Small functions, Small components, Simple control flow, Explicit behavior, Logical file organization, Predictable patterns.  
**Avoid:** Clever one-liners, Extremely nested logic, Unnecessary abstractions, Cryptic variable names, Giant functions, Giant components, Hidden side effects, Overly generic abstractions, Magic values, Complex patterns without clear benefit.

Readable code is more important than showing technical cleverness.

---

### [USER-DEFINED RULE] Rule 13: Code Must Be Easy to Find
A developer should be able to reasonably predict where functionality belongs.  
Use logical and consistent naming and folder structure (e.g., Currency under currency domain, Wallet under wallet domain, Settlement under settlement domain).  
Do not scatter related functionality across unrelated folders. Avoid unnecessarily deep folder structures.

---

### [USER-DEFINED RULE] Rule 14: Maintainability First
Code must be written for future modification. Ask: *"If another developer needs to change this six months from now, will they understand where to make the change?"*  
Prefer code that is Localized, Predictable, Modular, Well named, Tested, Reusable, Loosely coupled.

---

### [USER-DEFINED RULE] Rule 15: Reusability Is Mandatory
Whenever the same functionality is required more than once, make it reusable across Components, Hooks, Services, Utilities, Calculations, Animations, Validators, Formatters, and Data-access logic. Never copy-paste functionality.

---

### [USER-DEFINED RULE] Rule 16: Reusable Dynamic Components
If the same type of UI appears more than once, CREATE ONE REUSABLE DYNAMIC COMPONENT.  
- **Bad:** `WalletCardINR`, `WalletCardUSD`, `WalletCardIDR`.
- **Good:** `WalletCard` with dynamic properties/configuration (props, variants, configuration, composition, slots).

---

### [USER-DEFINED RULE] Rule 17: Small Focused Components
Avoid giant components. Break large components into smaller components when they have independent responsibilities:
```text
TripDashboard
├── TripHeader
├── SpendingOverview
│   ├── StatCard
│   └── CurrencyAmount
├── QuickActions
│   └── QuickAction
├── WalletOverview
│   └── WalletCard
└── TransactionList
    └── TransactionItem
```

---

### [USER-DEFINED RULE] Rule 18: Loose Coupling
Prefer loosely coupled modules depending on clearly defined interfaces rather than internal implementation details.  
Avoid: Direct manipulation of another feature's state, Circular dependencies, Components knowing DB implementation, UI knowing financial calculation internals, Domain logic depending on visual components.

---

### [USER-DEFINED RULE] Rule 19: High Cohesion
Related functionality should stay together. Keep related Types, Components, Services, Hooks, Tests, Utilities close to their domain.  
Goal: **HIGH COHESION + LOW COUPLING.**

---

### [USER-DEFINED RULE] Rule 20: Separation of Concerns
Do not mix unrelated responsibilities. React components should NOT become responsible for IndexedDB implementation, Exchange-rate provider implementation, Complex financial calculations, Backup serialization, or Database migrations.

---

### [USER-DEFINED RULE] Rule 22: Single Source of Truth
Never create two competing sources of truth. Financial data must flow through the centralized domain/calculation architecture. UI components display calculated data; they should not independently recalculate financial values using different formulas.

---

### [USER-DEFINED RULE] Rule 23: Search Before Creating Anything
Before creating a component, hook, service, utility, function, animation, validator, formatter, repository, or calculation, search the existing codebase.  
Ask: Does this already exist? Is there something similar? Can it be reused? Can it be extended? Should it become a shared abstraction?

---

### [USER-DEFINED RULE] Rule 28: Avoid Over-Engineering
Do not build unnecessary abstraction for a simple requirement. Avoid unnecessary design patterns, services, wrappers, state management, dependencies, or excessive configuration.

---

### [USER-DEFINED RULE] Rule 29: Avoid Under-Engineering
Do not create temporary copy-paste code when the requirement is clearly shared or likely to be reused. Build proper reusable foundations where justified.

---

### [USER-DEFINED RULE] Rule 30: No Copy-Paste Architecture
Never solve repeated requirements by copying existing code and changing a few values. Extract the common behavior via props, configuration, variants, composition, or strategy/interfaces.

---

### [USER-DEFINED RULE] Rule 55: Easy-to-Find Architecture
A developer should be able to answer *"Where is the code for this feature?"* without searching the entire application using predictable names, domain-based organization, consistent patterns, clear boundaries, and logical file placement.

---

### [USER-DEFINED RULE] Rule 56: Easy-to-Change Architecture
A change to one feature should require changes primarily within that feature and its clearly defined shared dependencies. Avoid tightly coupled architecture where changing one feature requires editing unrelated features.

---

### [USER-DEFINED RULE] Rule 57: Avoid Circular Dependencies
Do not create circular dependencies between domains, services, or components. If two modules need each other, reconsider the architecture and extract a shared abstraction.

---

### [USER-DEFINED RULE] Rule 58: Prefer Dependency Inversion Where Useful
High-level business logic should not unnecessarily depend on concrete implementations (e.g. calculation logic should not depend directly on one specific exchange-rate API provider). Use abstractions/interfaces where they provide real value.

---

### [USER-DEFINED RULE] Rule 59: Prefer Composition Over Duplication
Build complex UI and behavior by composing small reusable pieces (`Small components` + `Shared components` + `Domain services` + `Hooks` + `Configuration`).

---

### [USER-DEFINED RULE] Rule 65: Don't Hide Complexity From the User by Creating Code Complexity
The application should be simple for the user, but that does not mean code should become unnecessarily complicated. Prefer simple domain APIs and clear abstractions.

---

### [USER-DEFINED RULE] Rule 66: User Experience Over Developer Convenience
Do not make the user perform manual work simply because it is easier to implement. If the application can calculate or derive something reliably, the user should not have to enter it manually.
