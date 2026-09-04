# Refactoring, Quality & Error Handling Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 31: Reusable Animation Rule
If an animation is used more than once, extract the animation behavior into reusable Motion variants/components (e.g. `PageTransition`, `AnimatedCard`, `AnimatedList`, `AnimatedListItem`, `AnimatedNumber`, `AnimatedValueChange`, `AnimatedSheet`, `AnimatedDialog`, `AnimatedTab`).  
Do not copy-paste identical Motion configuration across the application.

---

### [USER-DEFINED RULE] Rule 43: Preserve Existing Functionality
Before modifying existing code, understand what it currently does. After modifying it, verify existing functionality still works. Never fix one feature by silently breaking another.

---

### [USER-DEFINED RULE] Rule 44: Prefer Incremental Changes
Make the smallest clean change that satisfies the requirement. Do not rewrite unrelated areas of the application. Do not perform large refactors without a reason.

---

### [USER-DEFINED RULE] Rule 45: Refactor When It Improves the Architecture
Refactoring is encouraged when it meaningfully improves Reusability, Maintainability, Readability, Coupling, Performance, Testability. But avoid unrelated refactoring during feature work.

---

### [USER-DEFINED RULE] Rule 60: No Premature Optimization
Optimize when there is a real performance reason. Do not make code unnecessarily complex for hypothetical performance problems. However, obvious performance problems should not be ignored.

---

### [USER-DEFINED RULE] Rule 61: Performance Must Preserve Readability
Do not introduce complicated optimization techniques unless they are necessary. Readable code is preferred unless performance requirements justify additional complexity.

---

### [USER-DEFINED RULE] Rule 63: Error Handling Must Be Intentional
Do not silently swallow errors. Errors should: Be handled at the appropriate layer, Preserve useful context, Provide understandable user feedback, Avoid exposing unnecessary internal details.
