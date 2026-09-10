# 2026-09-05 — Full Audit, Plain-Language Currency Model, Flow Rebuild & GSAP Home Page

## USER REQUEST (verbatim)

```
1:Read the docs
2:Audit full code and test everything is completed
3:I have some iisue like on mobile device adding trip button is not showing i have to make horizantal screen than it visble
No option to delete trip and no easy access to trip
I cant able to search in dropdown like currency shortform INR
In trip if i select base curncy and other thing it should not ask again and again for the detail it shuld be same in all the event
while creating teip coutry should be dropdown

while adding expences i can able to find category linst inside the list it should have list and also option too if i searh in dropdown and not find


Inside trip if i set base curncy As INR and when i go to exchnage inside that trip i must be changing from base crency to there local curncy but it is not auto filled its take time to do entery


While recorrd exchnage if no wallet is there give option to crate wallet so user does not to go back and create wallet first


Give fleaxiblity and easy to use to user
While adding expences ther is no option to select Companinon its show only who pay but how can i split if pay for multipul person And if i want to add ne people while creating expence chek this also


if user try to delete any tri ask hin to doenlaod full detail and export file so he can use if needed
Inside trip if user set the base curncy and local curncy of the place where is goin dont ask hile nogotion every time what is base currency and taget currncy


and dont use term base currancy use a proper daya to day terms

same for trget curncy

if user select whwere are you from like india than base curncy is ruppe
and if sleect where are you viisting And he select Indonasia bali than the target currcy is IDR use syboo also to show currncy

and onse user selct base currny any where gloabalise for the and by defaut mark it slected like if user slected base curncy in tria inr than he will come trib then the inr will be auto selected


So perform full audit for test cases and also UI/UX adudit and make it full user friendly So user does not have to suffer for any thing dont hav eto change screen and re enter again and again same thing


navbar should always be ther to navigate any where form any page

Please do these chnages properly

and tan apply gsap animation on home page also Scroll animation with use of gsap pluging scroll trigger
and also hero section text anmate with motion and gsap It s look so basic right now
```

---

## AUDIT FINDINGS

### Critical — the app was rendering largely unstyled

1. **~18 Tailwind class names used across every app screen did not exist in `tailwind.config.ts`.**
   `text-foreground`, `text-muted-foreground`, `bg-muted`, `text-destructive`, `bg-destructive`,
   `bg-brand-accent` / `text-brand-accent` / `border-brand-accent`, `shadow-soft-inner`,
   `shadow-soft-outer`, `shadow-soft-accent`, `text-muted`. Verified by grepping the built
   stylesheet: every one produced **0** rules. Form inputs had no inset shadow, error text was
   not red, accent buttons were not violet, body copy fell back to the browser default. This is
   the root cause of the "it looks so basic right now" complaint.

2. **`darkMode: ["class"]` never matched.** The theme switches on `.light` (night is the
   default), so no `dark:` variant in the codebase ever activated.

3. **Interpolated Tailwind classes.** `ExpenseList` and `CategoryList` built icon colours as
   `` bg-${color}-100 dark:bg-${color}-500/20 ``. Tailwind cannot see those at build time, so
   the classes were never generated and category icons rendered with no colour at all.

4. **Currency symbols were the literal string `{currencySymbol}`.** `src/lib/currencies.ts`
   asked `country-codes-list` for a `{currencySymbol}` field that the package does not have, so
   the placeholder token was returned verbatim for all 150+ currencies.

5. **`@mui/material` + `@emotion/*` were installed and used** for the currency dropdown,
   violating frozen Point 98 and Rule 68 (no competing primary UI system).

6. **Blur and translucency throughout** (`backdrop-blur-lg/md/sm` on the bottom nav, six page
   headers and every modal backdrop), which ADR 005 forbids outright.

### Critical — dead or trapped UI

7. **The "add trip" floating button was unreachable on phones.** It sat at `bottom-6` with
   `z-30` while the mobile navigation bar was `fixed bottom-0` at `z-40` — the nav covered it
   completely. Rotating to landscape pushed the viewport past the `md` breakpoint, the mobile
   bar swapped for the desktop header, and the button reappeared. This matches the report
   exactly.

8. **Navigation was removed from the expense, exchange and summary screens** by an explicit
   `pathname.includes(...)` early return, stranding the user on the pages where leaving matters
   most.

9. **Deleting a trip was not offered anywhere**, and `TripRepository.delete` removed only the
   trip row — every expense, wallet, movement, exchange, settlement, budget and negotiation was
   orphaned in IndexedDB forever.

10. **Default categories were seeded only when the categories screen was opened.** A new user's
    first expense therefore had an empty category dropdown.

11. **Landing page dead ends:** the navbar linked to `#travel-smarter` and `#faq`, which do not
    exist; the "Create your first trip" button had no action at all; "Start a trip" scrolled to
    an anchor instead of opening the trip form. `HeroVisual`, `CurrencyOrbit` and the seven
    `landing/hero/*` components are unreferenced dead code.

12. **`Add to Expense` in the calculator was a hardcoded `alert()`** — frozen Point 40 was not
    implemented.

### Baseline (frozen Points 0–99) violations

13. **Point 14** requires 15 default categories (Food, Hotel, Transport, Scooter, Activities,
    Shopping, Spa/Massage, Beach Club, Drinks, Tickets, SIM/Internet, Visa, Tips, Emergency,
    Other). Only 8 existed, and 5 of those were not on the list.

14. **Points 12 & 13** — every expense was written with `isShared: true` and split equally
    across *all* participants. There was no personal/shared choice and no way to pick who the
    bill was actually split between.

15. **Point 4** — no way to add a participant from inside the expense flow.

16. **Point 15** — payment method was reduced to `walletId ? 'WALLET' : 'CASH'`; Card, UPI and
    Bank were unreachable.

17. **Point 5 / Point 71** ("no country-specific currency logic") — the exchange screen
    hardcoded `setValue('receivedCurrency', 'IDR')`.

18. **Point 92** — the mandatory reusable `CurrencyAmount`, `BottomSheet` and `ConfirmDialog`
    abstractions did not exist; every modal repeated its own overlay markup.

### Bugs found while verifying the rework

19. **`AnimatePresence` never unmounted its child from inside a portal.** The closed sheet
    stayed in the DOM at `opacity: 0` — a full-screen, `pointer-events: auto` layer that
    silently swallowed every click on the page behind it. Reproduced repeatedly in the browser.

20. **The scroll-lock effect leaked.** It depended on the inline `onClose` arrow, so it re-ran
    on every render and each run captured the `hidden` its predecessor had just written; the
    final cleanup then restored `hidden` and the page could never scroll again.

21. **`framer-motion@12.4.7` was pinned against `motion-dom@12.4.5` via an override.**
    Upgrading to `12.23.12` exposed that `motion-dom@12.43.0` (which satisfies framer-motion's
    own `^12.23.12` range) has removed the `activeAnimations` export framer-motion imports —
    an upstream semver break that fails the build.

22. **`SoftButton` size `lg` used `h-13`**, which is not a Tailwind spacing step, so the large
    button had no height rule.

---

## AI RESULT

### Design tokens (`tailwind.config.ts`, `src/app/globals.css`)

- Added every missing colour role: `foreground`, `muted` / `muted-foreground`, `destructive`,
  `success`, `warning`, and `brand.accent` as an alias of the accent token.
- Added `shadow-soft-outer`, `shadow-soft-outer-sm`, `shadow-soft-inner` and `shadow-soft-accent`
  as real Tailwind utilities built from the ADR 005 dual-tone shadow primitives.
- Added `--success`, `--warning`, `--danger`, `--info` and `--accent-shadow` CSS variables to
  both the night and day palettes.
- Changed `darkMode` to `["selector", "html:not(.light)"]` so dark variants match the theme the
  app actually uses.
- Verified in the built stylesheet: all nine previously-missing utilities now emit exactly one
  rule each.

### Plain-language currency model

Frozen requirement change, authorised by the request above — recorded as **ADR 006**:

- `Trip` gained `localCurrency` (the money spent at the destination) alongside `baseCurrency`.
  It falls back to the home currency, so trips saved before this field still work.
- Dexie schema **v2** backfills `localCurrency` for existing trips from their country, falling
  back to the home currency. No data is dropped.
- The words "base currency" and "target currency" are gone from the interface. Screens now say
  **"Money you count in"** (— your home money) and **"Money you'll spend there"**, the trip
  header reads *"You count in ₹ INR · You spend in Rp IDR"*, and the exchange screen is
  *"You hand over" / "You get back"*.
- New `src/lib/countries.ts` maps 250 countries to their flag and ISO currency. Picking
  **"Where are you going?"** fills the local currency in automatically.
- New `src/lib/currency-format.ts` resolves symbols through `Intl.NumberFormat`
  (`currencyDisplay: 'narrowSymbol'`), replacing the broken package field, and exposes
  `formatAmount` / `formatMoney` / `currencySymbol` / `currencyBadge`. The generic currency sign
  `¤`, which Intl returns for placeholder codes such as XXX, is rejected in favour of the code.
- New `settings-repository.ts` + `useCurrencyPreferences` remember the chosen currencies
  globally. Once picked anywhere they are preselected everywhere — a new trip, and the
  bargaining calculator, which no longer asks on every visit.

### New reusable components

| Component | Purpose |
|---|---|
| `SearchableSelect` | The one searchable dropdown, replacing MUI Autocomplete. Keyboard navigable, matches code + name + symbol, and takes an `onCreate` action that renders an "add" row carrying whatever was typed. |
| `CurrencySelect` / `CountrySelect` | Built on it; both show flags and symbols. |
| `Sheet` | The single dialog shell — bottom sheet on phones, centred dialog from `sm`. Portalled, Escape-closable, focus-moving, scroll-locking. |
| `CurrencyAmount` | Point 92's mandatory money renderer: muted symbol, solid tabular digits. |
| `SegmentedControl` | Two/three-way choices as tap targets (personal vs shared). |
| `PeoplePicker` | Multi-select chips for who a bill is split between, with an inline "Add person". |
| `ScrollReveal` | The one GSAP ScrollTrigger reveal used by every landing section. |
| `useGsapScrollTrigger` | Lazily loads GSAP + ScrollTrigger inside a scoped `gsap.context()`, honours reduced motion, and reverts on unmount. |

### Flow rebuilds

**New trip** — country is a searchable dropdown that fills the local currency in; the home
currency defaults to the remembered global preference; a one-line preview reads
"₹ INR at home · Rp IDR on the trip"; end-date-before-start-date is now validated.

**Trips list** — the floating button moved to `bottom-[calc(5.5rem+safe-area)]` at `z-40`, clear
of the navigation bar, and a visible "New trip" button was added beside the heading so the flow
never depends on the floating one. Each card gained a menu with Add expense, Record exchange,
Analytics, Summary report and Delete trip. Cards show `₹ INR → Rp IDR`.

**Delete trip** — `DeleteTripDialog` spells out exactly what is destroyed, offers a full JSON
backup and an expenses CSV, and keeps "Delete forever" **disabled** until the user has either
downloaded a copy or explicitly ticked "I don't need a copy". `TripRepository.delete` now
cascades across all nine trip-scoped tables in a single transaction.

**Add expense** — personal/shared segmented choice; `PeoplePicker` for who it is split between,
with a live "Split 3 ways — Rp150,000 each" preview; inline sheets to add a person, a category
or a wallet without leaving the form; searchable category list that offers to create what you
typed when nothing matches; explicit payment method (Cash/Card/UPI/Bank/Other) when no wallet is
used; currency defaults to the trip's local money; selecting a wallet aligns the currency to it.
Splits go through the existing `calculateEqualSplits`, which assigns the rounding remainder to
the payer, so shares always add back to the exact total.

**Record exchange** — prefills give = home money, receive = local money from the trip itself (no
hardcoded IDR); auto-fills the received amount from the live rate as you type and stops as soon
as you type your own; swap button; inline wallet creation on both sides; gain/loss reads "You did
better by" / "You lost" / "Exactly the same" rather than a signed number.

**Calculator** — reuses the remembered currencies instead of asking every visit, with a "Change
money" action to revisit. "Add as expense" now implements Point 40: it carries the negotiated
price, currency and Shopping category into the active trip's expense form, where nothing is
saved until confirmed.

**Navigation** — the bar renders on every route (Home · Trips · Calculator · Backup), opaque per
ADR 005, safe-area aware, with the bottom clearance applied once in the layout.

**Categories** — all 15 baseline categories plus the two legacy extras are seeded on app start,
idempotently and by stable id, so existing users gain the new ones and custom categories are
untouched. Custom categories can now be deleted; defaults are still protected by the repository.

### Home page animation

- Hero headline is split into words that rise out of a per-line overflow mask with rotation and
  a blur-to-sharp transition, staggered 55 ms apart, the two gradient words settling a beat later
  with a soft overshoot. The lines then drift apart at different speeds on scroll
  (`scrub: 0.8`).
- Two background washes parallax against the scroll at different rates.
- Badge, paragraph and both CTAs animate with Motion on a staggered delay ladder.
- Feature cards and How-it-works steps reveal through `ScrollReveal`.
- **`ScrollReveal` cannot strand content:** nothing is hidden until GSAP has actually loaded, an
  IntersectionObserver reveals alongside the trigger, and a timer writes the finished state
  directly if the tween has not completed when it should have.

### Bug fixes

- `Sheet` no longer uses `AnimatePresence`; unmounting is driven by an explicit timer and the
  overlay drops `pointer-events` while closing, so it can never block the page.
- The scroll-lock effect captures the value to restore only when the sheet opens.
- `framer-motion` upgraded to `12.23.12` with `motion-dom` pinned to the matching `12.23.12`.
- `@mui/material`, `@emotion/react`, `@emotion/styled` removed.
- Category icons now use `GradientIconTile` through a shared, deterministic colour→gradient table
  (`src/lib/category-visuals.ts`) instead of interpolated classes.
- All `backdrop-blur` removed; hardcoded emerald/amber swapped for `--success` / `--warning`.
- `SoftButton` `lg` height corrected to `h-14`.
- Settlement wording moved to the Point 20 vocabulary: "You pay X" / "You take from X".

### Files changed

**Added** — `src/lib/countries.ts`, `src/lib/currency-format.ts`, `src/lib/category-visuals.ts`,
`src/components/common/SearchableSelect.tsx`, `CountrySelect.tsx`, `Sheet.tsx`,
`CurrencyAmount.tsx`, `SegmentedControl.tsx`, `ScrollReveal.tsx`,
`src/components/participants/PeoplePicker.tsx`, `src/components/trips/DeleteTripDialog.tsx`,
`src/components/providers/AppDataProvider.tsx`,
`src/infrastructure/repositories/settings-repository.ts`,
`src/hooks/useCurrencyPreferences.ts`, `src/hooks/useGsapScrollTrigger.ts`,
`src/domain/__tests__/trip-deletion.test.ts`, `src/domain/__tests__/trip-currencies.test.ts`.

**Rewritten** — `tailwind.config.ts`, `src/lib/currencies.ts`, `CurrencySelect.tsx`,
`BottomNav.tsx`, `CategoryList.tsx`, `AddCategoryModal.tsx`, `AddParticipantModal.tsx`,
`CreateWalletModal.tsx`, `CurrencySetupModal.tsx`, `Hero.tsx`, `HeroContent.tsx`,
`app/trips/page.tsx`, `app/trips/new/page.tsx`, `app/trips/[id]/page.tsx`,
`app/trips/[id]/expense/page.tsx`, `app/trips/[id]/exchange/page.tsx`, `app/calculator/page.tsx`.

**Edited** — `globals.css`, `layout.tsx`, `package.json`, `dexie-db.ts`, `trip.ts`,
`trip-mapper.ts`, `trip-repository.ts`, `category-repository.ts`, `backup-service.ts`,
`ExpenseList.tsx`, `ParticipantBalancesList.tsx`, `BudgetProgressCard.tsx`,
`MiniAnalyticsCard.tsx`, `SettlementModal.tsx`, `SoftButton.tsx`, `StaggerContainer.tsx`,
`NegotiationCalculator.tsx`, `FeatureGrid.tsx`, `HowItWorks.tsx`, `CTASection.tsx`,
`Navbar.tsx`, `FeatureHighlights.tsx`, `app/trips/[id]/summary/page.tsx`, and the four page
headers that carried blur.

### Dependencies

- Removed: `@mui/material`, `@emotion/react`, `@emotion/styled`.
- Changed: `framer-motion` `12.4.7` → `12.23.12`; `overrides.motion-dom` `12.4.5` → `12.23.12`.
- No new dependencies added. Countries and currencies reuse the existing `country-codes-list`
  plus the platform's own `Intl`.

---

## TESTS PERFORMED

- **Unit tests: 68 passing across 18 files** (was 52 across 16). Added `trip-deletion.test.ts`
  (cascade removes all nine tables, other trips untouched, per-trip export completeness, missing
  trip returns null) and `trip-currencies.test.ts` (home/local separation, legacy fallback,
  country→currency for Indonesia/India/Japan and by ISO code, unknown country, symbol resolution
  and decimal rules). Expanded the category suite to assert all 15 Point 14 categories, seeding
  idempotency and custom-category preservation.
- `tsc --noEmit` — clean.
- `next lint` — no warnings or errors.
- `next build` — succeeds; all 15 routes compile.
- Built stylesheet grepped to confirm the nine previously-absent utilities now emit rules.

### Verified in the browser (mobile 375×812 and desktop)

Creating a trip end to end (country search → auto-filled IDR → INR home currency → dashboard
reading "You count in ₹ INR · You spend in Rp IDR"); currency search by shortform ("INR" →
"INR — ₹ · Indian rupee"); expense form prefilled with the local currency and 17 seeded
categories; adding a companion inline and watching the split become "Split 2 ways — Rp150,000
each"; saving Rp300,000 and seeing ₹1,607.01 with "You take from Rahul ₹803.50"; exchange screen
prefilled INR→IDR with 1,866,823 IDR auto-calculated; creating a wallet from inside the exchange
screen and having it auto-select; the delete dialog keeping "Delete forever" disabled until a
download or an explicit opt-out; the calculator reusing remembered currencies and handing
375,000 IDR to the expense form via query parameters; the navigation bar present on the summary
screen; the floating button clear of the bottom bar; light (Claymorphism) mode.

### Not verified

- **Animation playback could not be observed.** The preview pane never paints, so
  `requestAnimationFrame` does not fire in it at all (measured: zero frames in one second) and
  neither GSAP nor Motion can advance. Structure, triggers and final computed styles were
  verified programmatically instead — feature cards and steps reach `opacity: 1` after scrolling.
  The motion itself needs a real browser to confirm.
- Physical touch gestures, screen readers and print output were not exercised.
- `BackupService` file downloads are covered by unit tests over `collectTripData`; the browser
  download itself was not triggered, as the preview sandbox blocks it.

---

## KNOWN LIMITATIONS / FOLLOW-UPS

1. `StaggerContainer` still animates from `opacity: 0` via Motion. Real browsers resume
   animation frames on focus, but the same "stranded content" class of risk that `ScrollReveal`
   was hardened against applies in principle.
2. `HeroVisual`, `CurrencyOrbit` and `src/components/landing/hero/*` remain unreferenced dead
   code and still contain the pre-ADR-005 glow/blur styling. Left in place rather than deleted
   during feature work (Rule 44); worth a dedicated cleanup.
3. Splits are equal-only in the UI. `calculatePercentageSplits` and custom splits exist in the
   domain layer but Point 13's Percentage and Custom methods are not yet surfaced.
4. Settlement is still base-currency-only (Point 26 multi-currency settlement is stored but not
   offered in the modal).
5. Expense receipt images (Point 81) remain unimplemented.
