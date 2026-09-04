# Workflow, Planning & Result Recording Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 2: Every Project Request Must Be Recorded
Every project-related user request must be recorded.

Project-related requests include: Feature requests, Bug reports, Design requests, Architecture requests, Requirements, Corrections, Decisions, Refactoring requests, Performance requests, UX requests, Development instructions.

Record: Date/time, User request, Related feature/module, Files affected, Implementation status, Important decisions, Final result.  
Store history inside: `.ai/HISTORY/`  
The history must preserve what the user requested, not only what was implemented.

---

### [USER-DEFINED RULE] Rule 3: Record the Final Result
At the end of every completed task, record:
- Original user request
- What was implemented
- What changed
- Files changed
- Components changed
- Services/hooks/utilities changed
- Dependencies added/removed
- Tests performed
- Important decisions
- Limitations
- Follow-up items if any

The recorded result must match the final response given to the user.

---

### [USER-DEFINED RULE] Rule 9: HLD Before Major Features
For major features or architectural changes, first understand the High-Level Design.  
Consider: Feature boundaries, Domain boundaries, Data flow, Dependencies, Services, Storage, UI boundaries, Integration points, Offline behavior, Impact on existing modules.

Do not immediately start writing code for a major feature without understanding where it belongs in the overall architecture.  
Use the simplest design that clearly explains the feature.

---

### [USER-DEFINED RULE] Rule 10: LLD Before Complex Implementation
For complex features, define the Low-Level Design before implementation.  
Consider: Components, Interfaces, Props, Types, Services, Hooks, Utilities, Data structures, Database interactions, Validation, Error handling, State flow, Calculation flow, Tests.

LLD should make the implementation straightforward.  
Do not create unnecessary documentation for trivial changes.

---

### [USER-DEFINED RULE] Rule 11: HLD and LLD Must Agree
The implementation must remain consistent with the intended architecture.  
Do not create low-level code that bypasses the established high-level design.

If implementation reveals that the HLD is incorrect:
1. Identify the issue.
2. Re-evaluate the architecture.
3. Update the relevant architectural decision.
4. Preserve the previous decision in history.
5. Then implement.

---

### [USER-DEFINED RULE] Rule 38: Testing Is Part of Implementation
A feature is not complete simply because the UI works.  
Test appropriate: Unit behavior, Domain logic, Integration behavior, UI behavior where needed, Edge cases, Offline behavior.

Financial calculations require particularly strong automated tests.

---

### [USER-DEFINED RULE] Rule 39: Test Before Saying "Done"
Before reporting completion:
- Run relevant tests
- Run type checking
- Run linting when configured
- Verify affected functionality
- Check important edge cases

Never claim something was tested when it was not.

---

### [USER-DEFINED RULE] Rule 40: UI Verification
For UI changes verify: Mobile, Desktop where applicable, Light theme, Dark theme, Responsive behavior, Touch interactions, Keyboard interactions where applicable, Accessibility.

---

### [USER-DEFINED RULE] Rule 46: Architectural Decisions Must Be Recorded
Important architectural decisions must be recorded in `.ai/DECISIONS.md`.  
Record: Decision, Date, Reason, Alternatives considered, Consequences, Related feature.

---

### [USER-DEFINED RULE] Rule 50: Every Completed Task Updates Appropriate Records
After completing a task, update relevant:
- `.ai/HISTORY/`
- `.ai/CHANGELOG.md`
- `.ai/DECISIONS.md`
- `.ai/RULES/99-AGENT-LEARNED-RULES.md`
- `.ai/PROJECT_KNOWLEDGE.md`

Only update files that actually require changes. Do not generate meaningless documentation.

---

### [USER-DEFINED RULE] Rule 51: Final Response Must Be a Result Report
At the end of every project task, report:
- What the user requested
- What was implemented
- Important implementation details
- Files changed
- Components/services changed
- Dependencies changed
- Tests performed
- Known limitations
- Remaining work

Do not simply respond with "Done."

---

### [USER-DEFINED RULE] Rule 52: Never Claim Unverified Results
Never claim: Tested, Working, Fixed, Offline compatible, Responsive, Accessible, Mathematically correct unless it was actually verified.  
Clearly state anything that could not be verified.
