# Core AI Operating Rules & Project Knowledge Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 1: Always Load Project Knowledge
Before processing ANY project-related request:
1. Read `.ai/PROJECT_KNOWLEDGE.md`.
2. Read all applicable files inside `.ai/RULES/`.
3. Read relevant `.ai/DECISIONS.md`.
4. Read relevant `.ai/CHANGELOG.md`.
5. Read relevant `.ai/HISTORY/`.
6. Inspect the existing implementation related to the request.

Never assume that previous conversation memory is available.  
The repository is the persistent source of truth.

---

### [USER-DEFINED RULE] Rule 4: Re-read Project Knowledge After Changes
After implementing a change:
1. Re-read `.ai/PROJECT_KNOWLEDGE.md`.
2. Re-read applicable rules.
3. Compare the implementation against the requirements.
4. Check for accidental violations.
5. Check for regressions.
6. Verify that the feature integrates with the existing architecture.

Do not assume that a feature is correct simply because it works independently.

---

### [USER-DEFINED RULE] Rule 5: Frozen Project Knowledge
`.ai/PROJECT_KNOWLEDGE.md` contains the project's frozen baseline.  
Frozen requirements must never be silently:
- Deleted
- Weakened
- Replaced
- Contradicted
- Ignored
- Reinterpreted

If a requirement needs to change, explicitly identify the change.

---

### [USER-DEFINED RULE] Rule 6: Changes to Frozen Knowledge Must Be Tracked
If the user explicitly requests a change to frozen project knowledge:
1. Update `.ai/PROJECT_KNOWLEDGE.md`.
2. Preserve the previous version.
3. Record what changed.
4. Record why it changed.
5. Record the date.
6. Record the user request authorizing the change.
7. Add the change to project history.
8. Update the changelog when appropriate.

Never modify frozen requirements without preserving history.

---

### [USER-DEFINED RULE] Rule 7: Never Destroy History
Project history is append-only.  
Never delete historical decisions, requirements, or implementation records just because they are no longer current.

If something changes:
- Mark the old decision as superseded.
- Record the replacement.
- Keep the original history.

The project must remain historically recoverable.

---

### [USER-DEFINED RULE] Rule 48: User-Defined Rules Have Priority
When the user explicitly creates a new project rule:
1. Record it.
2. Add it to the appropriate rule file.
3. Preserve history.
4. Apply it to future work.

Never rely only on conversation memory.

---

### [USER-DEFINED RULE] Rule 49: Agent-Learned Rules
The AI may create new rules when it discovers recurring problems or important engineering lessons.

However:
- The AI must NEVER silently modify or delete a user-defined rule.
- Agent-created rules must be clearly identifiable as agent-created.

---

### [USER-DEFINED RULE] Rule 53: New Conversation Must Be Recoverable
The project must not depend on previous chat history.  
A completely new AI session must be able to understand the project by reading:
- `.ai/PROJECT_KNOWLEDGE.md`
- `.ai/RULES/`
- `.ai/DECISIONS.md`
- `.ai/CHANGELOG.md`
- `.ai/HISTORY/`

---

### [USER-DEFINED RULE] Rule 54: No Hidden Knowledge
Important project requirements must not exist only inside the AI's memory.  
If something is important enough to affect future development, it must be recorded in the repository.

---

### [USER-DEFINED RULE] Rule 70: Final Development Loop
Every project task follows:

`READ`  
→ `UNDERSTAND`  
→ `SEARCH EXISTING CODE`  
→ `SEARCH LIBRARIES WHEN NEEDED`  
→ `HLD WHEN NECESSARY`  
→ `LLD WHEN NECESSARY`  
→ `IMPLEMENT`  
→ `TEST`  
→ `RE-READ KNOWLEDGE`  
→ `CHECK RULES`  
→ `CHECK REGRESSIONS`  
→ `RECORD REQUEST`  
→ `RECORD RESULT`  
→ `UPDATE DOCUMENTATION`  
→ `FINAL RESPONSE`

This process is mandatory.

---

### [USER-DEFINED RULE] Rule 71: Golden Engineering Principle
When choosing between two implementations, prefer the one that is:
1. Easier to understand
2. Easier to find
3. Easier to maintain
4. More reusable
5. More loosely coupled
6. Easier to test
7. More consistent with the existing architecture
8. Simpler

Do not choose complexity merely because it looks more advanced.

---

### [USER-DEFINED RULE] Rule 72: Final Priority
The project should always optimize for:

`USER EXPERIENCE`  
`+ CORRECTNESS`  
`+ SIMPLICITY`  
`+ REUSABILITY`  
`+ MAINTAINABILITY`  
`+ LOOSE COUPLING`  
`+ READABILITY`  
`+ TESTABILITY`  
`+ PERFORMANCE`

Visual sophistication must never come at the cost of these principles.
