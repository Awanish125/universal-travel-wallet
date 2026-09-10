# 2026-09-05 — UI System Overhaul: Controls, Cards, Dropdowns, Range Calendar

## USER REQUEST (verbatim)

Sent with screenshots of the stats row, the How-it-works cards, the date inputs,
the Create trip button, the calculator setup modal, an open country dropdown,
the navigation bar, the CTA card and the trip form.

```
This infinity should not be icon this should be made by code and always animating
same card color for all component as we have in  2nd component of home page and apply bird flying in every card with rendom 2-3-4-5-6 and alos add cloud moving use svg code for that rendom sahpe cloude
Icon color of input should be light color in dark mode and in light mode dark color
Button color and not look googd change wevery where and also use same input style morphism for button
fix this modal ui make same as crate trip form it should look
see how dropdown is going beind others


and crete an custom scroll bar with liqid glass and apply every where
No flag is coming in dropdown
see nav bar is looking soo dull
And click on cross button of calculator nothing happening it should redirrect to previous page

give this hover effect to every card (Ready for your next trip? card hover effect )

This dropdown minue shuld have same mrphissm styleing every where
active color of inut tag also need be chnaged and make it card border animation same animation on active input r focused input

calander should be MUI and same morpgism styel and it should be selection like satrt date end date like hotle booking ebsite have the selected duration get highlighted that  type of

Crete trip button is not working fix all thee hing nd if find same thing other plce apply same changer there also
```

---

## AI RESULT

### Bugs

**1. `crypto.randomUUID` is undefined outside a secure context.** Every create
action in the app called it directly. `localhost` is a secure context, so it
works on the development machine — but opening the app from a phone on the same
network (`http://192.168.x.x:3000`), the obvious way to test a mobile-first app,
is not, and there the call is `undefined` and every save throws before it writes
anything. New `src/lib/newId()` uses the platform API when present, falls back to
`crypto.getRandomValues` formatted as a v4 UUID, and finally to `Math.random`.
All **13 call sites** across 12 files now use it.

This is the one code-level cause that produces exactly the reported symptom
while working fine here — see *Not reproduced* below for what I could and could
not confirm.

**2. Dropdown panels rendered underneath later content.** The panel lived inside
the control, so it inherited every ancestor's stacking context and overflow —
no `z-index` on the panel can escape that. It is now rendered through a portal
to `document.body`, positioned in viewport coordinates, and repositioned on
scroll (captured, so a sheet's own scroll container counts) and resize. It also
flips above the trigger when there is not enough room below.

**3. The date range picker reset itself after the first click.** Its reset
effect watched `startDate` as well as `isOpen`, so choosing a start date
immediately put the picker back into "pick a start" and the second click could
never land on the end. Caught by driving it in the browser.

**4. `ScrollReveal` re-ran its effect on every render.** `fromCycle` is written
as an inline array literal, a fresh identity each time, so the effect re-hid the
children continuously. It now depends on the joined string instead.

**5. The calculator's close button did nothing on first run.** No `onClose` was
passed, on the reasoning that there was "nothing to go back to". There is — the
previous page. It now goes back, or to `/trips` when there is no history.

**6. Vitest was collecting a spawned task's git worktree** under
`.claude/worktrees/`, reporting 120 tests for a project that has 68. The config
now scopes collection to `src/`.

### Controls

A single set of surfaces in `globals.css`, so a field and a button are shaded
from the same tokens and cannot drift apart:

- **`.field-surface`** — one inset surface for every input, select and trigger.
  Focus lights an accent ring; `data-invalid` lights a red one.
- **`.field-focus-ring`** — a focused field now borrows the card's sweeping
  accent border, painted on a masked `::before` ring so it does not fight the
  field's own border. Active input and active card finally speak the same
  language.
- **`.btn-soft` / `.btn-soft-primary` / `.btn-soft-secondary`** — convex at
  rest, concave when pressed, lit by the accent rather than filled with a flat
  block of it. `SoftButton` is rebuilt on them and gained a `danger` variant;
  `softButtonClasses()` exports the same look for links, since a `<Link>` inside
  a `<button>` is invalid markup.
- Heights became floors (`min-h-*`) rather than fixed `h-*`, which had been
  silently overriding callers' padding — `size="lg"` also used `h-13`, not a
  Tailwind step, so it had no height rule at all.
- **`color-scheme`** is now declared per theme. The date picker's calendar
  button, number spinners and caret are painted by the browser from that
  property, not from CSS colour, which is why the calendar icon was near-black
  and invisible on the dark canvas.

Every hand-rolled input class string across seven files collapsed onto
`.field-surface`.

### Scrollbars

A thin themed scrollbar applied globally — `scrollbar-width`/`scrollbar-color`
for Firefox, the WebKit pseudo-elements for Chrome and Safari, both driven from
new `--scrollbar-thumb` tokens in each theme.

### Cards

- **One fill for every card.** `SoftCard` always fills from `--surface-strong`;
  the variants differ in depth, not colour.
- **The CTA card's hover is now the house hover.** The pointer-tracked 3D tilt
  moved from `CTASection` into `SoftCard`, so every card in the product tilts
  the same way and the CTA no longer carries its own copy of the motion values.
- **`CardAmbience`** — 2–6 birds (random per card) and two drifting clouds built
  from seeded overlapping ellipses, so no two cards share a flock or a cloud
  shape. Everything on a card shares one tick, and the tick is added only while
  the card is on screen (`tickWhileVisible`), so off-screen cards cost nothing.
  It replaces the single-bird `CardBird`.
  Ambience is skipped automatically on anything below 260×116, measured with a
  `ResizeObserver` — the same component is a hero panel on one screen and a
  wallet row on another, and a list row does not want weather.
  Clouds sit low in the card at 2.5–5.5% opacity, after a first pass put them
  over the labels where they read as smudges.

### Flags

Flag emoji are two regional-indicator characters the platform is meant to
compose into one glyph. **Windows does not** — it draws the two letters, which
is why every row read "AF", "AX", "AL". Bundling 250 flag SVGs is not an option
either, since the app must work offline.

New `Emblem` measures once on a canvas whether this platform actually composes a
flag, and falls back to a clean accent code chip when it does not — showing the
currency symbol where it is short (`₹`, `Rp`) and the ISO code otherwise. It
renders the chip during SSR and the first paint, then swaps, so the server and
client markup match.

### Date range calendar

**`DateRangeField`** replaces the two native date inputs: one control showing
both dates and the nights between them, opening a calendar where the first click
sets the start, the second the end, and the span between highlights as a
continuous band with only its two ends rounded — the hotel-booking behaviour
asked for. It previews the span on hover, restarts the range if you click before
the start, and marks today.

**Not MUI, deliberately.** Point 98 and Rule 68 forbid mixing in a second UI
system, and `@mui/material` was removed earlier today for exactly that reason;
`@mui/x-date-pickers` would also pull in emotion and a date adapter, then need
every surface, shadow and radius overridden to look morphic anyway. This is
built on the project's own tokens with plain `Date` arithmetic and local
`YYYY-MM-DD` keys — no date library either (Rule 25). If you would rather have
MUI regardless, say so and I will record the baseline change and swap it.

### Other

- **Animated infinity.** `InfinityMark` draws a lemniscate as an SVG path with a
  lit segment travelling endlessly around it, via a CSS `stroke-dashoffset`
  animation — no glyph, no animation frames, and it stops for reduced motion.
  The `∞` character could not animate and changed shape with whatever font
  loaded.
- **Navigation.** Depth under both bars, a gradient brand mark, a spring-slid
  active pill on desktop, and quieter secondary type.
- **Settlement modal** was the last dialog still hand-rolling its own overlay; it
  is now on the shared `Sheet` with the shared field styling and a searchable
  wallet picker, matching the trip form.
- The calculator setup sheet already shared the form's components; with the new
  field and button surfaces it now matches it visually too.

### Files

**Added** — `src/lib/id.ts`, `src/components/common/Emblem.tsx`,
`CardAmbience.tsx`, `DateRangeField.tsx`, `InfinityMark.tsx`.

**Rewritten** — `SoftButton.tsx`, `SoftCard.tsx`, `SearchableSelect.tsx`,
`CTASection.tsx`.

**Edited** — `globals.css`, `vitest.config.ts`, `ScrollReveal.tsx`,
`CountrySelect.tsx`, `CurrencySelect.tsx`, `BottomNav.tsx`, `Navbar.tsx`,
`HeroContent.tsx`, `StatsSection.tsx`, `SettlementModal.tsx`,
`CurrencySetupModal.tsx`, `BudgetProgressCard.tsx`, `calculator/page.tsx`,
`trips/new/page.tsx`, plus the 12 files that generated ids and the 7 that
carried their own input classes.

**Deleted** — `src/components/common/CardBird.tsx`.

**Dependencies** — none added or removed.

---

## TESTS PERFORMED

- `tsc --noEmit`, `next lint`, `next build` — all clean.
- `vitest run` — 68 passing across 18 files (was double-counting to 120 before
  the config fix).
- Built stylesheet grepped: `webkit-scrollbar`, `field-surface`,
  `btn-soft-primary`, `field-focus-ring` and `infinity-mark` all emit rules.

### Verified in the browser

- Country dropdown is portalled to `<body>`, `position: fixed`, `z-index: 80`,
  and the trigger's focus ring lights on open.
- Range calendar: clicking 10 advanced the prompt to "Now pick the day you come
  back", clicking 18 produced "Sep 10, 2026 → Sep 18, 2026 · 8n", and a
  screenshot confirms 11–17 highlighted as a band between two accent-filled ends.
- Emblem falls back to chips: "ID" for Indonesia, "₹" for INR, "Rp" for IDR.
- The trip form now renders five `.field-surface` controls with five focus
  rings, no native date inputs, and `color-scheme: dark`.
- **Creating a trip works end to end** — filled the form by script and it landed
  on `/trips/<id>` showing "Bali October · Indonesia · You count in ₹ INR · You
  spend in Rp IDR".
- The calculator setup sheet renders three shared fields with focus rings and
  the new gradient primary button.

### Not reproduced

**The "Create trip button is not working" report.** On a clean build the flow
works, verified above. My first attempts to reproduce it did fail — but the
console showed `ChunkLoadError`, 404s on `/_next/static/chunks/...` and a
hydration failure, i.e. a corrupted dev build left over from deleting `.next`
under a running server, not an application fault. After restarting the server it
submitted correctly.

So I fixed the one code-level cause that would produce this exact symptom for
you and not for me — `crypto.randomUUID` off `localhost` — and the two genuine
bugs testing did surface. If it still fails for you, the console message at the
moment you press the button would settle it.

### Not verified

- Animation playback, as before: this preview pane reports a zero-height
  viewport and delivers no animation frames, so tweens are verified by their
  start states and computed styles rather than watched.
- The bird and cloud motion, the infinity spark and the navigation pill spring
  therefore need a real browser to confirm they feel right.
- Light mode was not re-screenshotted after the control restyle.
- Touch interaction and screen readers were not exercised.

---

## FOLLOW-UP, SAME SESSION (verbatim)

```
I like the prvious input field style that was of same color and i ask to apply same for other also
i was having same color of of background with same color of input with clamorphism
and i ask you to create that linear gradient style border animation that we have on all card that sae animation for input field which are in focus
and also
the button should have claymorphism style and i dont like this bright color linear gradient button it should mathing to background only the font color should be light and aslo button stlye should be claymorphism only the diffrence it should be up lifted and input should be depth

and the cloude you have make for card are not going linar it go to x-y position and jump back to x its not look real even cloud are only in left side of every card and one cloud has no round face see the image
 and clude is also on top of other

please make rea physics implementation and also the bird are flying at same place make it rendom place and rendom size and rendom visbsality so it fill like 3d
```

### The ambience bug the user spotted

**Percentage transforms resolve against the element's own box, not its parent.**
Both birds and clouds were positioned with `translate(x%, y%)` on the SVG
itself. A bird SVG is 24px wide, so `translateX(100%)` moved it 24 pixels — it
flapped on the spot. A cloud is 120px, so it never left the left edge of the
card. Every symptom in the report follows from that one mistake.

Rewritten to measure the card (`ResizeObserver`) and position everything in
**pixels** against it. Verified numerically against a real 622x646 card: a
mid-depth cloud now sweeps x from -111 to 689 (~73s per crossing) and a bird
from -21 to 643. Previously each moved by its own width.

The rest of the report, addressed:

| Report | Change |
|---|---|
| "jump back to x" | The wrap is now hidden: a cloud fades out over its last width and fades in over its first, so it dissolves rather than teleports. |
| "not going linear" | It is linear now - constant px/s - with a slow sine bob (1.5-4px, 0.12-0.28Hz) so it drifts rather than sliding on rails. |
| "one cloud has no round face" | Shapes were free ellipses, which could come out flat-sided. A cloud is now a row of **circles** on a flat base, radii tapered by `sin` so the silhouette peaks in the middle. |
| "cloud is also on top of other" | Each cloud owns a horizontal lane (`height / count`) and starts staggered across the card, so two can no longer overlap. |
| "birds flying at same place" | Fixed by the pixel rewrite; each crossing also re-rolls position, direction, size and depth. |
| "random size / visibility / feel 3D" | One `depth` value per object now drives size, opacity **and** speed together - distant birds are small (0.45x), faint (0.18) and slow; near ones large (1.3x), solid (0.58) and quick. Wing-beat rate scales with depth too. |

### Controls

**Fields are the same colour as the surface they sit on**, sunk into it by a
dual-tone inset shadow - claymorphism doing the work instead of contrast. They
read `var(--card-fill)`, which `SoftCard` sets and custom properties inherit, so
a field inside a card is *exactly* that card's colour and falls back to the
standard surface outside one. Verified: field background and card fill both
resolve to `rgb(25, 27, 29)`.

**The animated border is the focus indicator.** It was implemented in the
previous pass but invisible, because a solid `0 0 0 1.5px var(--accent-primary)`
focus ring was painted on top of it. That ring is gone; a focused field now
shows only the sweeping conic gradient, confirmed running (`border-angle-spin`,
4s, sampled mid-sweep at 113.652deg) and visible in a screenshot.

**Buttons are clay, not gradient slabs.** Same surface colour as the fields,
raised by the mirror of their inset shadow, with light type - a button is
relief, a field is intaglio, and pressing a button sinks it to exactly the
field's depth. The accent survives only as a hairline inset edge and as the
hover type colour. Verified: button background `rgb(25, 27, 29)`, text
`rgb(242, 243, 244)`, convex dual-tone shadow. The `danger` variant lost its red
slab too and now carries the intent in the type colour.

### Also fixed

**The whole app was rendering in Times New Roman.** `font-family:
var(--font-geist-sans), system-ui, ...` - with no fallback *inside* `var()`, a
missing variable makes the entire declaration invalid at computed-value time, so
it falls back to the browser default serif rather than to the system sans listed
right after it. Now `var(--font-geist-sans, ui-sans-serif)`, in both
`globals.css` and the Tailwind font stack, so the page can never drop to serif
again.

`SoftCard` also re-measures on `window.resize`, not only via `ResizeObserver` -
a viewport change that does not resize the element's own box would otherwise
leave a card stuck at its first measured size.

---

## KNOWN LIMITATIONS / FOLLOW-UPS

0. **The ambience motion itself is still unwatched.** This preview pane reports
   a 0x0 viewport and delivers no animation frames, so the flock and the clouds
   are verified by their mount, their counts, their measured card box and the
   traversal maths - not by watching them fly. Worth a look in your browser.
1. `Emblem` shows code chips rather than flags on Windows. Real flags would need
   ~250 bundled SVGs to stay offline-capable; worth doing if flags matter more
   than bundle size.
2. `CardAmbience` runs on every card above its size floor. On a screen with many
   large cards that is several birds animating at once — all on one shared,
   visibility-gated ticker, but worth watching on a low-end phone.
3. The range calendar shows one month at a time. Two side-by-side months on
   desktop would match booking sites more closely.
4. `StaggerContainer` still animates from `opacity: 0` through Motion and has not
   moved onto the `src/lib/motion.ts` contract.
