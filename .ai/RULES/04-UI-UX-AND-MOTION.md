# UI/UX, Design System & Motion Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 41: Soft Tactile UI Does Not Override Usability
The application's visual style should be premium and tactile — Claymorphism (day mode) / Neumorphism (night mode) with Skeuomorphic press feedback, per `design-system/universal-travel-wallet.md` Section 5 and ADR 005. However:

`READABILITY` > `ACCESSIBILITY` > `USABILITY` > `PERFORMANCE` > `VISUAL EFFECTS`

Do not sacrifice functionality for soft-shadow/clay effects. This rule previously named "Liquid Glass"; that material system was superseded in full by ADR 005 — no blur, no translucency, no neon anywhere in the product.

---

### [USER-DEFINED RULE] Rule 42: Motion Must Be Purposeful
Animations should communicate State, Hierarchy, Feedback, Continuity, Transition.  
Avoid animation that exists only for decoration. Animations must not slow down important workflows. Respect reduced-motion preferences.

---

### [USER-DEFINED RULE] Rule 62: Accessibility Is Part of Quality
Accessibility is not a final optional step. Consider accessibility during implementation:
- Semantic HTML
- Keyboard navigation
- Focus management
- Screen-reader labels
- Contrast
- Touch target size
- Reduced motion
- Accessible dialogs/sheets

---

### [USER-DEFINED RULE] Rule 64: Empty and Loading States Are Part of the Feature
When building a UI feature, consider: Loading, Empty, Error, Success, Offline, Partial data.  
Do not design only the successful populated state.

---

### [USER-DEFINED RULE] Rule 69: Consistency Is Mandatory
New functionality must look and behave like part of the same application.  
Reuse: Design tokens, Components, Typography, Spacing, Colors, Radius, Shadows, Motion, Icons, Interaction patterns.  
Do not create feature-specific visual systems.

---

### [USER-DEFINED RULE] Rule 73: Authoritative Design System & Custom Gradient Accent Pattern
The authoritative visual design foundation is specified in [design-system/universal-travel-wallet.md](file:///d:/awi/universal-travel-wallet/design-system/universal-travel-wallet.md).

1. **Design Hierarchy:**  
   `Project Knowledge` → `Project Rules` → `Design System (design-system/universal-travel-wallet.md)` → `Custom Patterns (GradientIconTile)` → `UI/UX Pro Max` → `Implementation`.  
   UI/UX Pro Max serves only as supporting design intelligence and must NEVER replace or override the authoritative design system.
2. **Custom Gradient Accent Pattern:**  
   - Use reusable `GradientIcon` / `GradientIconTile` concepts for card icons, wallet icons, expense icons, transaction icons, category icons, quick actions, status/feature indicators, empty/success states.
   - Pattern composition: `[clay gradient icon]` + `calm readable content surface`.
   - Gradients belong exclusively to the content/accent identity layer. The Soft Tactile (Claymorphism/Neumorphism) material from ADR 005 remains the primary material/surface language — Liquid Glass was fully superseded, not this pattern.
   - Do NOT turn cards, buttons, inputs, text, or background canvases into random gradient surfaces. Large gradient surfaces require deliberate semantic justification (e.g. physical credit card visuals).
3. **Deterministic Gradient Tokens:**  
   - All gradients must originate from centralized design tokens (`gradient.primary`, `gradient.blue`, `gradient.cyan`, `gradient.magenta`, `gradient.green`, etc.).
   - Gradient assignment must be deterministic and tied to category/entity semantics. True random gradients on every render are strictly forbidden.
4. **Financial Readability & Accessibility:**  
   - Financial numbers must remain solid, high-contrast, tabular text (`tabular-nums`).
   - Icons must sit inside contrast-safe containers and must never rely solely on color for semantic meaning.

---

### [USER-DEFINED RULE] Rule 74: UI/UX Pro Max Governance & Scope
UI/UX Pro Max is integrated as a supporting design intelligence tool.

1. **Permitted Scope:**  
   - Querying `--domain ux` for accessibility, form validation, error messaging, touch targets, and mobile UX.
   - Querying `--domain react` / `--stack nextjs` for React performance, virtualization, and component rendering guidance.
   - Querying `--domain chart` for responsive 2D data visualization guidelines.
   - Querying `--domain icons` for Lucide React accessibility patterns.
2. **Prohibited Scope:**  
   - NEVER run commands with `--persist` or generate a competing `MASTER.md` file.
   - NEVER override the color tokens, typography, spacing, radius, Soft Tactile (Claymorphism/Neumorphism) materials, or gradient icon tiles defined in `design-system/universal-travel-wallet.md`.
   - NEVER alter frozen specification points 0–99.
