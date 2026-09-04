# Universal Travel Wallet — Design System
## Vercel/Geist Foundation + Soft Tactile UI (Claymorphism · Skeuomorphism · Neumorphism)

> This document adapts the supplied Vercel/Geist design reference into the visual and interaction language for Universal Travel Wallet.
>
> The Vercel reference is the chosen foundation because its typography, spacing, precise grids, app controls, forms, cards, and responsive behavior are more suitable for a functional product than a marketing-first system.
>
> **Revision note (supersedes the prior Liquid Glass direction — see ADR 005 in `.ai/DECISIONS.md`):** the visual material system changed from translucent glassmorphism to an opaque, tactile **Soft UI** system blending **Claymorphism**, **Neumorphism**, and **Skeuomorphism**. No blur, no translucency, no neon glow anywhere in the product.

---

## 1. Design Direction

Universal Travel Wallet should feel like a **premium travel utility that belongs on a modern phone** — tactile, warm, and physical rather than glassy or neon.

The product combines:

- Vercel/Geist-style precision and restraint
- Soft, tactile surfaces that look gently sculpted out of (or pressed into) the page
- Dark-purple night mode / white day mode — no neon lighting anywhere
- Large, comfortable mobile controls
- Clear financial hierarchy
- Smooth Motion, GSAP, and parallax interactions
- Minimal typing and cognitive load

The interface must feel **premium without becoming decorative**.

The soft-UI material is a tactile system, not a decoration.

### Core visual hierarchy

```text
CONTENT
  ↓
Brand / travel imagery / contextual color
  ↓
Soft tactile UI surfaces (Clay / Neumorphic)
  ↓
Controls and navigation
  ↓
Motion, GSAP & parallax interaction feedback
```

Content should remain visually important. Soft UI surfaces should sit above the content rather than replacing it.

---

# 2. Product Design Principles

### 2.1 Clarity first

Users should immediately understand:

- how much they spent
- how much money they have
- what currency they are viewing
- who owes whom
- how much they need to pay
- how much they saved
- what action is available next

Never sacrifice financial readability for visual effects.

### 2.2 Minimal input

Prefer:

- search
- selection
- presets
- automatic calculations
- recently used values
- remembered preferences
- contextual defaults

Avoid unnecessary typing.

### 2.3 One primary action

Each screen should have one obvious primary action.

Secondary actions should visually recede.

### 2.4 Content over chrome

Soft UI surfaces should frame and elevate content, not compete with it.

Do not cover important financial values with heavy shadow, texture, or decoration.

### 2.5 Native-feeling interaction

Interactions should feel responsive and physical:

- tap
- press (surface visibly depresses — convex becomes concave)
- swipe
- drag
- sheet presentation
- shared transitions
- list insertion/removal
- value changes
- scroll-linked parallax

Animations must communicate state rather than exist only for visual spectacle.

---

# 3. Theme System — Dark Purple Night Mode / White Day Mode

Both modes are first-class. Night mode uses a deep dark-purple canvas; day mode uses a white canvas with a soft lavender-tinted gradient. Neither mode uses neon color, glow, blur, or translucency.

## Night mode (dark) — Neumorphic canvas

| Token | Value | Purpose |
|---|---:|---|
| `--background` | `#0C0D11` | Main application canvas (deep dark obsidian, matching reference UI) |
| `--background-secondary` | `#12141A` | Secondary content regions |
| `--background-gradient` | `linear-gradient(175deg, #0C0D11 0%, #12141A 50%, #0C0D11 100%)` | Soft linear background wash |
| `--surface` | `#0C0D11` | Soft tactile base surface (depth comes from soft dual-tone shadow and subtle borders) |
| `--surface-strong` | `#141721` | Elevated tactile surface |
| `--surface-subtle` | `#090A0D` | Inset/subtle surface (e.g. input wells) |
| `--surface-solid` | `#0F1117` | Fallback for complex content |
| `--border` | `rgba(255,255,255,0.07)` | Hairline border for elevated components |
| `--border-strong` | `rgba(255,255,255,0.12)` | Focused/elevated edge |
| `--shadow-neu-highlight` | `rgba(255,255,255,0.05)` | Neumorphic light-source edge (top-left) |
| `--shadow-neu-shadow` | `rgba(0,0,0,0.65)` | Neumorphic shadow edge (bottom-right) |
| `--text-primary` | `#F1EDFB` | Primary text |
| `--text-secondary` | `#B9AFD1` | Secondary text |
| `--text-muted` | `#8377A0` | Metadata |
| `--text-disabled` | `#5B5270` | Disabled content |

## Day mode (light) — Clay canvas

| Token | Value | Purpose |
|---|---:|---|
| `--background` | `#FFFFFF` | Main application canvas |
| `--background-secondary` | `#F5F3FC` | Secondary content regions |
| `--background-gradient` | `linear-gradient(160deg, #FFFFFF 0%, #F1EDFC 100%)` | Soft linear background wash (white → soft lavender) |
| `--surface` | `#FFFFFF` | Clay base surface |
| `--surface-strong` | `#F8F6FF` | Elevated clay surface |
| `--surface-subtle` | `#F2EFFC` | Inset/subtle surface |
| `--surface-solid` | `#FFFFFF` | Fallback for complex content |
| `--border` | `rgba(36,20,60,0.06)` | Hairline only where shadow alone isn't enough |
| `--border-strong` | `rgba(36,20,60,0.10)` | Focused/elevated edge |
| `--shadow-clay-highlight` | `rgba(255,255,255,0.9)` | Clay light-source edge (top-left) |
| `--shadow-clay-shadow` | `rgba(124,90,220,0.16)` | Clay shadow edge (bottom-right) — hue-tinted violet, never plain black |
| `--text-primary` | `#241C35` | Primary text |
| `--text-secondary` | `#5C5470` | Secondary text |
| `--text-muted` | `#8983A0` | Metadata |
| `--text-disabled` | `#B7B2C6` | Disabled content |

Do not use pure black anywhere. Do not use flat solid gray backgrounds — always the soft linear gradient wash. The small tonal differences between surfaces create depth; shadows (not opacity or blur) do the rest.

---

# 4. Accent System

Universal Travel Wallet does not use a single fixed brand color for everything, but the signature color family across both themes is **violet / purple**, not blue.

### Primary accent

```text
Primary:        #7C6FEF   (day mode default)
Primary (night): #9B8CFF  (lifted for contrast on the dark-purple canvas)
Primary Strong: #6152E0 (day) / #B4A7FF (night)
Primary Soft:   rgba(124,111,239,0.14) (day) / rgba(155,140,255,0.16) (night)
```

The accent should communicate:

- primary actions
- active navigation
- selected states
- important interactive elements
- focus

### Financial semantic colors

Kept soft and matte — never neon or fluorescent:

```text
Success: #6FCF97
Warning: #F5B971
Danger:  #F2777A
Info:    #8FA6FF
```

Use semantic colors sparingly.

### 4.1 Clay Gradient Icon Tile Pattern

**Small icon containers should use curated pastel linear gradients, rendered as puffy clay tiles, instead of flat fills or glass tiles.**

This is a signature accent pattern and should be reused consistently across the application wherever an icon represents a card, transaction, category, wallet, status, quick action, or other compact visual identity.

The goal is not to make every surface colorful. The goal is to make small visual anchors feel rich and tactile while keeping the surrounding interface calm and readable.

#### Clay icon tile rules

Use a reusable `GradientIconTile` pattern rather than creating one-off gradient containers.

Each icon tile should generally contain:

- a Lucide React icon
- a compact rounded-square or circular container
- a curated two-color or three-stop pastel linear gradient
- a soft **dual-tone clay shadow** (light highlight top-left, hue-tinted soft shadow bottom-right) so the tile reads as gently puffed out of the surface
- a high-contrast icon color
- enough internal padding for the icon to breathe
- consistent sizing and radius tokens

Preferred visual direction:

```text
color A ───────────────→ color B
       soft pastel linear gradient
        + puffy clay shadow
```

Gradients should normally be diagonal or gently directional rather than perfectly flat, and pastel/matte rather than saturated or glowing.

#### Curated gradient palette

Gradients must come from a centralized semantic gradient palette. Every stop stays in the pastel/matte range — no neon or fluorescent saturation.

Example roles:

```text
gradient.primary   (violet → indigo)
gradient.lavender
gradient.mint
gradient.pink
gradient.peach
gradient.sky
gradient.coral
gradient.amber
gradient.teal
```

The exact color stops belong in the centralized design tokens. Components must not invent arbitrary gradient values inline.

#### Controlled variation

The interface should have **visual variety without visual randomness**.

Do:

- vary gradients across cards and icon tiles
- use different gradient families for different semantic contexts
- allow category and transaction types to have distinct gradient identities
- use deterministic assignment so the same item does not randomly change color on every render
- keep gradient intensity appropriate to the surrounding theme
- reuse the same gradient identity for the same semantic category when consistency improves recognition

Do not:

- generate a new random gradient on every render
- use an unlimited set of unrelated colors
- choose gradients that reduce icon contrast
- use gradients as a substitute for status semantics
- make every component a gradient surface
- saturate a gradient into neon/glow territory

#### Where gradients are encouraged

Use clay gradient tiles particularly for:

- card icons
- wallet icons
- expense/transaction icons
- category icons
- quick-action icons
- analytics/category indicators
- status/feature icons when a richer visual anchor is useful
- selected navigation icons where it improves hierarchy
- compact empty-state or success-state icon containers
- card identity areas that are intentionally designed as colorful content surfaces

#### Where gradients should remain restrained

Do not automatically apply the icon-gradient treatment to:

- large text blocks
- primary financial values
- body copy
- every button
- every input
- every soft-UI surface
- chart backgrounds
- page backgrounds (pages use the plain soft linear gradient wash from Section 3, not an icon gradient)
- large containers where a calm clay/neumorphic surface is more readable

Large gradient areas are allowed only when they are a deliberate content/identity surface, such as a wallet/card visual (see Image reference 1's card treatment) or a clearly defined feature hero.

#### Gradient + Soft UI relationship

Gradients belong primarily to the **content/accent layer**.

Clay/Neumorphic material belongs primarily to the **UI/material layer**.

Preferred composition:

```text
Dark-purple / white theme canvas
        +
soft linear background gradient
        +
clay or neumorphic card
        +
clay gradient icon tile
        +
clear content
```

The gradient should remain crisp inside the icon tile. Do not blur the icon gradient itself to create an artificial glow.

#### Gradient icon sizing

Use shared component tokens rather than per-screen values.

Suggested variants:

```text
sm   → compact list / metadata
md   → standard card / transaction
lg   → feature / quick action
xl   → empty state / major feature
```

The icon itself should remain optically centered and should not touch the tile edges.

#### Gradient state behavior

Clay gradient icon tiles may have Motion interactions:

- press: convex shadow flips to a subtle concave/inset shadow (skeuomorphic push feedback)
- slight brightness/saturation change on selected state
- restrained hover treatment on pointer devices
- shared transition when the same entity moves between views

Do not animate the gradient continuously. The gradient is part of the visual identity, not an ambient animation.

#### Gradient accessibility

Icon meaning must never depend on gradient color alone.

Every semantic state must also have:

- iconography
- text where appropriate
- accessible label
- sufficient contrast

If a gradient reduces icon or text contrast, change the gradient or increase contrast. Never preserve a gradient at the expense of accessibility.

---

# 5. Soft Tactile Material System (Claymorphism · Neumorphism · Skeuomorphism)

This is the primary surface language, replacing the prior Liquid Glass system entirely. Every surface is **opaque** — there is no blur, no translucency, and nothing behind a surface should ever show through it.

The system blends three related ideas:

- **Claymorphism** (day mode default): solid, matte, puffy 3D shapes with a light highlight and a soft, hue-tinted shadow — like the surface was molded from soft clay.
- **Neumorphism** (night mode default): surfaces rendered in a color very close to the canvas, distinguished only by a soft dual-tone shadow (a light "catch-light" edge plus a darker shadow edge), so elements look extruded from or pressed into the same material as the background.
- **Skeuomorphism**: the umbrella principle that controls should look and behave like physical objects — buttons look pressable, inputs look like a groove something can be typed into, toggles look like a real switch. Motion press-feedback (convex → concave) is what sells this.

## Material levels

### Surface 0 — Content

No clay/neumorphic treatment.

Used for:

- page background
- large financial values
- charts
- travel imagery
- primary content

### Surface 1 — Clay Card (day mode default)

```css
background: var(--surface);
border-radius: var(--radius-lg);
box-shadow:
  -8px -8px 16px var(--shadow-clay-highlight),
  10px 10px 22px var(--shadow-clay-shadow);
```

Used for:

- cards
- list groups
- compact controls
- secondary containers

### Surface 1 — Neumorphic Card (night mode default)

```css
background: var(--surface);
border-radius: var(--radius-lg);
box-shadow:
  -6px -6px 14px var(--shadow-neu-highlight),
  8px 8px 18px var(--shadow-neu-shadow);
```

Same role as the clay card above — the two are theme variants of one `SoftCard` component, never separate components.

### Surface 2 — Elevated

Deeper shadow spread and a slightly larger offset than Surface 1.

Used for:

- important cards
- floating controls
- selected surfaces
- elevated widgets

### Surface 3 — Floating

Used for:

- bottom sheets
- dialogs
- floating action controls
- navigation surfaces
- popovers

Uses the deepest shadow in the system so it visibly separates from the canvas. Never make a floating surface hard to distinguish from the page behind it.

### Inset / Concave surface

The inverse of the above — used for inputs, wells, and **pressed** states. Shadows swap sides (highlight bottom-right, shadow top-left) so the surface reads as pushed *into* the page rather than raised out of it.

```css
box-shadow:
  inset 4px 4px 10px var(--shadow-clay-shadow),
  inset -4px -4px 10px var(--shadow-clay-highlight);
```

(Swap `clay-*` for `neu-*` tokens in night mode.)

---

# 6. Soft UI Rules

### Do

- Keep every surface fully opaque.
- Use a light highlight + a darker, theme-tinted shadow on every raised surface (never a single flat drop-shadow).
- Tint shadows with the theme's hue (violet-tinted in both modes) rather than plain black/white.
- Use inset/concave shadows for inputs and pressed states.
- Use different material strengths (Surface 1/2/3) for hierarchy.
- Preserve readable contrast — text and financial values sit on fully opaque surfaces, so contrast is simple to guarantee.
- Keep shadow softness and radius consistent across all components.

### Don't

- Do not use `backdrop-filter` / blur anywhere.
- Do not use translucent or semi-transparent surfaces.
- Do not use neon glow, bright glowing borders, or luminous rings as decoration.
- Do not use a single hard black drop-shadow — always the soft dual-tone pair.
- Do not make financial values sit on a busy or low-contrast surface.
- Do not use heavy, high-contrast shadows that look like a hard drop-shadow rather than a soft emboss.
- Do not make the entire page one giant clay surface — vary elevation deliberately.

The result should feel **soft, tactile, and physical** — like the UI is made of the same soft material as the page, not a pane of glass floating above it.

---

# 7. Soft Gradient Background

Every screen sits on a **soft linear gradient background** — never a flat single color, never a radial neon glow field, never blurred atmospheric color blobs.

```text
Night mode:  linear-gradient(160deg, #1B1428 0%, #0F0B18 100%)
Day mode:    linear-gradient(160deg, #FFFFFF 0%, #F1EDFC 100%)
```

Example concept:

```text
Soft linear gradient canvas
    +
content
    +
clay / neumorphic controls (opaque, no blur)
```

The gradient must remain low-contrast and calm — it sets a gentle mood, it is never the main visual feature, and it must never be radial, glowing, or neon-colored.

---

# 8. Typography

Use **Geist Sans** as the primary typeface.

Use system fallbacks where necessary.

```text
Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Do not use a separate display font.

## Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---:|---:|---:|---|
| `display-xl` | 48px | 600 | 1.0 | Major hero/value |
| `display-lg` | 36px | 600 | 1.08 | Page title |
| `heading-lg` | 28px | 600 | 1.15 | Major section |
| `heading-md` | 20px | 600 | 1.3 | Card/section title |
| `label-lg` | 16px | 500 | 1.3 | Strong labels |
| `body-lg` | 16px | 400 | 1.5 | Important body |
| `body-md` | 14px | 400 | 1.45 | Default UI |
| `body-sm` | 12px | 400 | 1.4 | Metadata |
| `caption` | 11px | 400 | 1.35 | Fine information |

Financial numbers may use slightly stronger weight and tabular numerals.

Use:

```css
font-variant-numeric: tabular-nums;
```

for aligned financial values.

### Typography rule

Large numbers should be visually dominant.

For example:

```text
₹42,850
Total spent
```

The amount should be immediately readable before the supporting label.

---

# 9. Spacing

Use a 4px base unit.

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Common usage:

- 8px: icon/text gaps
- 12px: compact control spacing
- 16px: standard component padding
- 20px: card padding
- 24px: major card padding
- 32px: screen sections
- 48px+: major visual separation

Mobile layouts should generally use 16px horizontal page gutters.

---

# 10. Corner Radius

Soft tactile surfaces read best with generous, consistent geometry — slightly larger and puffier than a flat/hairline system.

Use:

| Token | Value | Use |
|---|---:|---|
| `radius-xs` | 10px | Tiny controls |
| `radius-sm` | 14px | Inputs / compact controls |
| `radius-md` | 18px | Standard cards |
| `radius-lg` | 24px | Important cards |
| `radius-xl` | 28px | Large soft-UI containers |
| `radius-sheet` | 32px | Bottom sheets |
| `radius-pill` | 999px | Pills |
| `radius-full` | 50% | Circular controls |

Avoid random radii.

Every component must use the shared radius tokens.

---

# 11. Navigation

Universal Travel Wallet is a mobile-first application.

Do not build a desktop dashboard and shrink it for mobile.

## Bottom navigation

Use a floating, visually separated soft clay/neumorphic bottom navigation (Surface 3).

Suggested structure:

```text
┌─────────────────────────────────┐
│ Home   Trips   Wallet   Activity│
└─────────────────────────────────┘
```

The exact navigation labels can evolve with the product information architecture.

Selected item:

- accent-colored icon
- accent-colored label
- a subtle inset/concave "active pill" behind the selected tab (looks pressed in), not a glow

Unselected items:

- muted icon
- muted label

The navigation should visually float above content (Surface 3 shadow depth).

## Desktop

On larger screens, navigation can adapt into a side rail or top structure while preserving the same component and visual language.

Do not duplicate navigation implementations.

---

# 12. Quick Actions

Primary travel actions should be immediately accessible.

Examples:

- Add Expense
- Exchange
- Wallet
- Settle

Use large touch-friendly controls.

A quick action can use:

- icon
- short label
- soft clay/neumorphic surface (convex at rest, concave when pressed)
- accent for the most important action

Avoid oversized dashboard-style button grids.

---

# 13. Buttons

## Primary

Primary actions use a convex clay/neumorphic surface with an accent-tinted fill.

```text
accent tint fill
+
high contrast text
+
soft dual-tone shadow (convex)
+
on press: shadow flips to inset/concave
```

## Secondary

Neutral surface color (not accent-tinted), same convex/concave shadow behavior.

## Tertiary

Text/icon action without a container.

## Icon button

Minimum target:

```text
44 × 44px
```

Preferred mobile target:

```text
48 × 48px
```

Never make an important action depend on a tiny icon.

---

# 14. Inputs

Inputs use the **inset/concave** treatment from Section 5 — they look like a groove pressed into the surface, ready to receive input (the classic skeuomorphic/neumorphic input pattern).

Standard input:

- inset clay/neumorphic well (concave shadow)
- no border needed when the inset shadow alone reads clearly; a hairline may be added for extra definition
- 48–52px minimum height
- clear focus state (accent-colored inset ring)
- strong text contrast
- large numeric input treatment for money

Currency and amount inputs should prioritize direct manipulation.

Example:

```text
┌──────────────────────────┐
│  500K          IDR  ˅    │
└──────────────────────────┘
```

The currency selector should be searchable.

Avoid huge native-looking dropdown menus.

Prefer:

- searchable sheet
- recent currencies
- popular currencies
- favorites

---

# 15. Financial Value Components

Financial values are the most important content in the application.

Create reusable components such as:

- `CurrencyAmount`
- `BaseCurrencyAmount`
- `RateDisplay`
- `GainLossDisplay`
- `SavingsDisplay`
- `BalanceDisplay`
- `BudgetProgress`

These components must receive data and formatting information rather than calculating financial logic themselves.

Financial calculations belong to the domain calculation layer.

---

# 16. Cards

Cards should not all look identical.

Use semantic variants.

### Standard soft card

For normal content (Surface 1).

### Elevated soft card

For important information (Surface 2).

### Financial card

For:

- spending
- wallet
- budget
- balance

### Transaction card

For:

- expenses
- exchanges
- settlements
- wallet movements

### Interactive card

For tappable destinations — press feedback flips the shadow to concave.

All variants must reuse the same underlying `SoftCard` component.

### Card accent rule

Cards should commonly have a small visual anchor near the leading content, especially when the card represents a recognizable entity or action.

When an icon is present, prefer the shared `GradientIconTile` pattern from Section 4.1.

This creates a consistent visual rhythm:

```text
[ clay gradient icon ]  Label / title / metadata
                        Primary value
                        Supporting information
```

The gradient icon should provide color and personality while the card surface remains calm and readable.

Do not make the entire standard card gradient merely because its icon uses a gradient.

---

# 17. Wallet Card

Wallet information should be glanceable. This is the one place a **large, deliberate gradient surface** is encouraged (matching a physical card/wallet visual), rendered with the same clay puffiness as everything else — never glossy or glassy.

Example:

```text
Cash Wallet

₹18,500
IDR 1.2M

Cash
Updated today
```

The primary amount should dominate.

Wallet cards can use a richer violet/indigo gradient fill to read like a physical card, but must remain readable — text sits in solid high-contrast color, never gradient text.

---

# 18. Expense Card

Show the most useful information first:

```text
Dinner
Food

₹2,450
IDR 420K

Paid by You
Today
```

For shared expenses:

```text
Dinner
₹2,450

You paid
You get ₹1,225
```

Do not force users to open a detail page for information that can be safely summarized.

---

# 19. Group Balance

Group balances must be extremely clear.

Use plain language:

- You pay
- You take
- They pay you
- They take from you
- Your balance
- Final amount
- Settled

Do not use overly technical financial terminology.

The strongest value should be visually dominant.

---

# 20. Settlement UI

Settlement screens should use a focused soft clay/neumorphic composition.

Example:

```text
You pay

₹1,200

to Rahul

Final amount

₹1,200
```

When comparing the other person's calculation:

```text
Your amount       ₹1,200
Their amount      ₹2,000
Difference          ₹800

Final amount        ₹800
```

The final amount should be unmistakable.

---

# 21. Currency Converter

The converter is a primary utility.

Recommended structure:

```text
┌─────────────────────────────┐
│ 500K                   IDR  │
│                             │
│            ⇅                │
│                             │
│ ₹2,000                  INR │
└─────────────────────────────┘
```

Support:

- two-way conversion
- swap
- current rate
- cached rate
- rate timestamp
- K/M shorthand
- full value
- base currency equivalent

The calculator must remain useful offline.

---

# 22. Negotiation UI

Negotiation should feel like a fast utility rather than a form.

Example:

```text
Shopkeeper price

500K IDR

≈ ₹2,000

-20%
-30%
-40%

Your offer

350K IDR
```

The most important values should update immediately.

Use Motion for:

- percentage changes
- amount transitions
- currency swaps
- savings
- offer updates

Do not animate every label independently.

---

# 23. Cash Counter

Cash counting should use large touch-friendly controls.

Example:

```text
Counted

187K IDR

≈ ₹750

Remaining
37K
```

Use large numeric presentation.

Keep controls simple enough for one-handed use.

---

# 24. Sheets and Dialogs

Bottom sheets are preferred for mobile contextual actions.

Use soft clay/neumorphic Surface 3 for:

- currency selection
- participant selection
- wallet selection
- payment method
- filters
- quick actions

Sheets should:

- enter smoothly
- have clear hierarchy
- maintain focus
- support dismissal gestures where appropriate
- remain fully opaque and easy to read regardless of what's behind them

Dialogs should be reserved for:

- destructive actions
- important confirmation
- critical errors

Do not turn every interaction into a dialog.

---

# 25. Charts

Charts should prioritize mathematical correctness and readability.

Use 2D charts by default.

Do not use 3D charts merely for visual appeal.

Charts should support:

- dark theme
- light theme
- real local data
- touch interaction
- accessible labels
- tooltips
- responsive sizing

Frame the chart inside a soft clay/neumorphic container rather than obscuring it with texture or shadow.

---

# 26. Icons

Use Lucide React consistently.

Icons should:

- use predictable meanings
- have consistent stroke weight
- remain readable at small sizes
- sit comfortably inside 44–48px touch targets

Do not mix unrelated icon libraries.

### Icon color treatment

Icons used as compact visual anchors should normally sit inside the shared clay gradient icon tile.

Prefer:

```text
GradientIconTile (clay puffy surface)
    ↓
Lucide icon
```

over:

```text
Flat colored square
    ↓
Lucide icon
```

The gradient treatment is a reusable visual pattern, not a reason to create custom icon artwork.

---

# 27. Motion, GSAP & Parallax

Motion is part of the design system, alongside GSAP for scroll-driven work and parallax for depth. They are complementary, not competing systems.

Use the `motion` package (Framer Motion) for component-level React interactions:

```bash
npm install motion
```

```ts
import { motion } from "motion/react";
```

Motion's official React documentation supports Next.js and React 18.2+ and provides layout, gestures, transitions, presence, reduced-motion support, and other interaction primitives.

Use **GSAP** (with `ScrollTrigger`) for scroll-orchestrated sequences and finer-grained timeline control that Motion doesn't cover well — always scoped via `gsap.context()` with proper cleanup on unmount.

Use **parallax** deliberately and sparingly for depth cues (e.g. background gradient drifting slightly slower than foreground content on scroll) — never so much that it distracts from financial content or hurts scroll performance.

## Motion principles

Animations should be:

- fast
- smooth
- subtle
- interruptible
- purposeful
- consistent

Avoid:

- excessive bouncing
- long transitions
- flashy entrance animations
- animation that delays interaction
- excessive parallax
- animation of important financial values that makes them temporarily unreadable

---

# 28. Reusable Motion System

Create shared Motion primitives/variants.

Examples:

```text
motion/variants
motion/transitions
motion/presence
motion/gestures
```

Reusable animation patterns:

- page enter
- sheet enter
- modal enter
- card press (convex → concave shadow flip)
- list item enter
- list item exit
- tab transition
- shared layout transition
- number transition
- success state
- error state
- expand/collapse
- scroll parallax (GSAP `ScrollTrigger`)

Do not duplicate animation configuration across components.

---

# 29. Financial Animation

Financial values may animate when they change.

Examples:

- wallet balance
- total spending
- budget remaining
- negotiation savings
- settlement amount
- conversion value

The underlying value must update immediately.

Animation is only a visual transition between two already-correct states.

Never let animation become the source of truth.

---

# 30. Interaction States

Every reusable interactive component should define:

```text
default   (convex clay/neumorphic)
hover
pressed   (shadow flips to concave/inset)
focus
selected
disabled
loading
error
success
```

Mobile-first components should prioritize:

- pressed
- selected
- focus
- disabled

Hover must never be required to understand or operate the product. The **pressed** state is the most important tactile signal in this system — it must always visibly invert the shadow direction, not just change opacity or scale.

---

# 31. Loading States

Avoid generic full-page spinners.

Prefer:

- skeletons
- content placeholders
- progressive rendering
- subtle Motion
- immediate local data

Offline startup must never wait for network data.

---

# 32. Empty States

Empty states should explain:

1. what is missing
2. why it matters
3. what the user can do next

Example:

```text
No expenses yet

Add your first expense to start
tracking your trip.

+ Add Expense
```

Keep empty states visually calm.

---

# 33. Error States

Errors must be understandable.

Avoid technical messages such as:

```text
ERR_NETWORK_500
```

Prefer:

```text
Couldn't refresh the exchange rate

Your saved rate is still available.
```

For offline use:

```text
You're offline

Using the latest saved exchange rate.
```

---

# 34. Accessibility

Follow accessible mobile interaction patterns.

Minimum target:

```text
44 × 44px
```

Preferred:

```text
48 × 48px
```

Support:

- keyboard navigation
- visible focus
- semantic HTML
- screen readers
- sufficient contrast
- reduced motion
- readable financial values
- accessible dialogs and sheets

Because every soft-UI surface is fully opaque, contrast is controlled directly by color choice rather than by blur or opacity — there is no translucency to fight. If a shadow ever makes content harder to read, soften the shadow rather than reducing surface contrast.

---

# 35. Responsive Design

The design is mobile-first.

### Small phone

```text
< 480px
```

Priorities:

- one-column layouts
- large controls
- compact cards
- bottom navigation
- bottom sheets
- minimal horizontal content

### Tablet

```text
480–1024px
```

Allow:

- two-column layouts
- wider cards
- expanded utility areas

### Desktop

```text
1024px+
```

Use the same design system with:

- wider content
- adaptive navigation
- multi-column content
- larger chart areas
- optional side navigation

Do not create a separate desktop visual language.

---

# 36. Content Layer vs UI Layer

Use two conceptual layers.

## Content layer

Contains:

- travel imagery
- trip identity
- charts
- financial information
- destination color
- contextual content

## UI layer

Contains:

- navigation
- buttons
- sheets
- dialogs
- selectors
- controls
- floating actions

The UI layer uses the Soft Clay/Neumorphic material system (Section 5).

The content layer provides identity.

This separation keeps the app visually rich without making every surface the same tactile material.

---

# 37. Design Tokens

All visual values must be centralized.

Do not scatter:

```css
#7C6FEF
rgba(...)
20px
28px
```

through components.

Use semantic tokens.

Examples:

```text
color.background
color.backgroundGradient
color.surface
color.surfaceStrong
color.border
color.text.primary
color.text.secondary
color.accent.primary

radius.sm
radius.md
radius.lg
radius.sheet

space.xs
space.sm
space.md
space.lg

shadow.clayHighlight
shadow.clayShadow
shadow.neuHighlight
shadow.neuShadow
shadow.inset
```

The exact implementation can use Tailwind CSS variables.

---

# 38. Component Architecture

Repeated UI must be reusable.

Examples:

```text
CurrencyAmount
CurrencySelector
AmountInput
PercentageButton
WalletCard
ExpenseCard
TransactionItem
ParticipantSelector
BottomSheet
ConfirmDialog
EmptyState
ErrorState
SuccessState
BudgetProgress
AnalyticsCard
ChartContainer
QuickAction
NegotiationInput
CashCounter
SoftCard
SoftButton
SoftIconButton
SoftNavigation
GradientIconTile
```

A component should accept data and configuration, and render either its clay or neumorphic variant based on the active theme — never as two separate components.

Do not copy the same UI into multiple screens.

---

# 39. Component Composition

Prefer:

```text
SoftCard
    ↓
FinancialCard
    ↓
WalletCard
```

rather than creating independent card implementations.

Likewise:

```text
SoftButton
    ↓
PrimaryButton
SecondaryButton
IconButton
```

The underlying material (Section 5) and interaction behavior (convex ⇄ concave on press) should remain consistent.

---

# 40. Design System Do's

- Support both dark-purple night mode and white day mode as first-class themes.
- Use the Soft Clay/Neumorphic material for every interactive surface.
- Keep financial values highly readable on fully opaque surfaces.
- Use soft, dual-tone, theme-tinted shadows (never a single flat drop-shadow).
- Use inset/concave shadows for inputs and pressed states.
- Use large touch targets.
- Use reusable components that switch material variant by theme, not by duplication.
- Use consistent spacing and radius tokens.
- Use Motion, GSAP, and restrained parallax for meaningful interactions.
- Preserve accessibility.
- Keep screens calm and focused.
- Use soft linear background gradients (never radial glow, never neon).
- Use pastel clay gradients as a recurring accent pattern for compact icon containers.
- Keep gradient variation controlled, deterministic, semantic, and theme-aware.

---

# 41. Design System Don'ts

- Do not copy Apple's interface directly.
- Do not use `backdrop-filter`, blur, or any translucent surface anywhere.
- Do not use neon, glowing, or fluorescent color anywhere in the product.
- Do not use a single hard black drop-shadow — always the soft dual-tone pair.
- Do not use random decorative gradients. Use only curated, centralized gradient tokens with controlled semantic variation.
- Do not use tiny controls.
- Do not hide financial values behind animation.
- Do not create desktop-first dashboard layouts.
- Do not create duplicate components for each theme — one component, theme-aware tokens.
- Do not place business calculations inside UI components.
- Do not use multiple competing icon libraries.
- Do not introduce another design language for individual modules.
- Do not sacrifice readability for aesthetics.

---

# 42. Reference Relationship

The supplied Vercel/Geist reference remains the **structural and typographic inspiration**:

- restrained design
- precise typography
- strong spacing
- clean grids
- reusable cards
- clear controls
- subtle elevation
- responsive behavior

The Universal Travel Wallet adaptation intentionally changes:

```text
Near-white Vercel canvas
        ↓
Dark-purple night canvas / white day canvas, soft linear gradient wash

Flat/hairline cards
        ↓
Opaque Soft Clay/Neumorphic materials (Claymorphism · Skeuomorphism · Neumorphism)

Marketing-oriented hero gradients
        ↓
Pastel clay gradient icon tiles + one deliberate wallet/card gradient surface

Vercel marketing buttons
        ↓
Mobile utility controls with tactile press feedback

Documentation/product marketing rhythm
        ↓
App-like travel workflow

Static visual states
        ↓
Purposeful Motion, GSAP & parallax interactions
```

---

# 43. Final Visual Target

The finished product should feel like:

**A premium, tactile travel-money application with the precision of a modern developer product, the warmth of a hand-molded object, and zero neon.**

It should never feel like:

- a generic SaaS dashboard
- a cryptocurrency dashboard
- a glassmorphism template
- a neon/cyberpunk dashboard
- an Apple clone
- a marketing landing page
- an over-animated design showcase

The strongest impression should be:

> **"This feels like a soft, physical travel app I would actually want to touch and use every day while travelling."**

A recognizable signature detail should appear throughout the product:

> **Small icons carry rich pastel gradient color inside puffy clay tiles, while the surrounding UI stays calm, opaque, and readable.**

This gradient language should be visible across cards, transactions, wallets, categories, quick actions, and other appropriate compact icon surfaces without turning the product into a gradient-heavy template.

---

# 43.1 Screenshot-Derived Custom Pattern Reference

The custom gradient rule in this document is derived from the supplied UI references (Claymorphism finance app, Neumorphic widget screen, Neumorphic dark music player).

Observed patterns that should influence implementation:

- Soft, puffy card surfaces with generous internal spacing and rounded geometry (Claymorphism reference).
- A compact leading icon container is used as a strong visual anchor, rendered as a puffy pastel tile.
- Icon containers use matte pastel gradients with varied color families, never neon-saturated.
- Dark mode controls (Neumorphism reference) are monochrome-on-monochrome, distinguished purely by soft dual-tone shadow, with a single accent color reserved for the primary/selected control.
- Status pills use strong-but-matte semantic colors and compact pill geometry.
- Large financial values remain solid, high-contrast text rather than gradient text.
- Progress indicators use semantic color while the surrounding card remains visually restrained.
- Payment/transaction rows use the same icon-container concept to create a consistent list rhythm.
- Colorful card identity can be stronger on dedicated financial/card visuals, while standard content cards remain restrained.
- Data visualization uses distinct semantic colors, but the chart itself remains the information-bearing layer.

Implementation interpretation for Universal Travel Wallet:

1. Adopt the Soft Clay/Neumorphic material foundation described in Section 5 (dark-purple night mode = neumorphic, white day mode = claymorphic).
2. Add the screenshot-derived pastel gradient icon treatment as a signature accent pattern.
3. Use gradients through centralized tokens and reusable components.
4. Prefer deterministic semantic assignment over true randomness.
5. Preserve financial readability and accessibility.
6. Keep the overall interface premium and controlled rather than turning it into a generic colorful gradient template.
7. Apply the same pattern consistently across repeated UI instead of recreating gradient/shadow styles screen by screen.

---

# 44. Implementation Rule

Before implementing a new visual component:

1. Search the existing component system.
2. Reuse an existing component when possible.
3. Extend a component when the behavior is genuinely shared.
4. Create a new component only when the concept is distinct.
5. Centralize new tokens.
6. Define responsive behavior.
7. Define interaction states, including the convex/concave press flip.
8. Define Motion/GSAP/parallax behavior where useful.
9. Verify dark-purple night mode and white day mode.
10. Verify accessibility.
11. Verify the component does not duplicate existing functionality.

The design system is a shared foundation, not a reason to create unnecessary abstractions.

---

# 45. Design Priority Order

When visual decisions conflict, use this order:

```text
1. Financial correctness
2. Accessibility
3. Readability
4. Usability
5. Information hierarchy
6. Performance
7. Consistency
8. Visual polish
9. Decorative effects
```

A beautiful effect must always lose to clarity.
