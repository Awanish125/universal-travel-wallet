# Universal Travel Wallet — Project Knowledge & Product Specification

> **STATUS: FROZEN BASELINE DEFINITION**  
> **BASELINE DATE:** 2026-09-04  
> **SCOPE:** Points 0 through 99 defined below constitute the frozen product and technical baseline for Universal Travel Wallet.  
> **RULE OF IMMUTABILITY:** Requirements in this baseline must NOT be silently removed, weakened, replaced, or contradicted. Any future change to these requirements requires explicit user instruction, updating this document, preserving history in `.ai/HISTORY/`, recording the decision in `.ai/DECISIONS.md`, and documenting the change in `.ai/CHANGELOG.md`.

---

# Product Goal

Build a universal travel money and expense management application that works for any country and any currency.

The application should help users manage:
- Trips
- Multiple currencies
- Currency exchanges
- Wallets
- Personal expenses
- Group/shared expenses
- Automatic group balance calculation
- Settlement between people
- Budget
- Budget alerts
- Expense analytics
- Bargaining and negotiation
- Fast currency calculations
- Cash counting
- Transaction history
- End-of-trip reporting
- Backup and restore
- Offline-first travel finance management

**Identity Rule:** The application is *Universal Travel Wallet*, not a Bali-specific application.

---

# Frozen Baseline Specification (Points 0 – 99)

## Section 1: Core Principles & Trip Management

### Point 0: Core Product Principles
The application must prioritize:
- Simple language
- Simple navigation
- Minimum typing
- Large and accessible actions
- Clear information
- Automatic calculations
- Fast common actions
- Mobile-first experience
- Offline-first architecture

**Non-Negotiable Rules:**
- Users should not have to manually enter information that the application can calculate automatically.
- Participants, budgets, and additional currencies must be optional when creating a trip. They can be added later.
- The application must work offline without requiring a backend or paid server for V1.
- The application should feel like a premium mobile travel-money application rather than a traditional web dashboard.

---

### Point 1: Trip Management
Users can create and manage trips.

**Required trip information:**
- Trip name
- Country
- Start date
- End date
- Base/home currency
- **Local/spending currency** *(added 2026-09-05 by ADR 006, on explicit user instruction)*

> **AMENDMENT 2026-09-05 (ADR 006).** A trip now carries a second currency — the money spent at
> the destination — alongside the home currency. It is derived from the country and can be
> overridden. Existing trips are backfilled by Dexie schema v2 and never left without one.
>
> The interface no longer uses the words "base currency" or "target currency". It says
> *"Money you count in"* (— your home money) and *"Money you'll spend there"*, and shows the
> currency symbol beside the code (`₹ INR`, `Rp IDR`). The stored field names `baseCurrency` and
> `localCurrency` are unchanged, so every other frozen point that refers to the base currency
> still describes the same value.
>
> *Previous wording of this list is preserved above — only the sixth line and this note were added.*

**Optional trip information:**
- Budget
- Daily budget
- Participants
- Additional currencies

**Trip Actions:**
Users can: Create trip, Edit trip, Add participants later, Add currencies later, Add budget later, Archive trip, Delete trip, Duplicate trip, Export trip, Import trip, Finish trip, View trip summary.

---

### Point 2: Trip Dashboard
Each trip should have a dashboard showing important financial information immediately.

**Dashboard metrics:**
- Total spent
- Wallet balance
- Money exchanged
- Settlement status
- Budget status (where configured)

**Quick actions:**
- Add Expense
- Exchange
- Wallet
- Settle

The dashboard must prioritize the most important information and avoid unnecessary complexity.

---

### Point 3: Participants
- Participants are optional.
- Users can add participants at any time.
- Participants are local to a trip.
- No online accounts are required for participants.
- **Participant Actions:** Add participant, Edit participant, Remove participant, View participant expenses, View participant balance, Settle with participant.
- Participants should be reusable throughout the trip.

---

### Point 4: Add Participant While Adding Expense
While creating an expense, the user must be able to add a participant without leaving the expense flow.
- The user should be able to: Search existing participant, Add new participant, Automatically select the newly created participant.
- The same behavior should be available for selecting the person who paid.
- The flow should minimize navigation and typing.

---

## Section 2: Currency Management, Converter & Exchange Records

### Point 5: Currency Management
- The application must support any currency and must NOT contain country-specific currency logic.
- **Actions:** Add currencies, Remove currencies, Set base currency, Search currencies, View currency symbol, View currency flag, View currency formatting, Support different decimal rules.
- A trip can contain multiple currencies.
- Currency management must be reusable throughout the application.

> **AMENDMENT 2026-09-05 (ADR 006).** Two additions, both required by Point 0's rule that users
> must not re-enter what the application can derive:
> 1. **Country drives currency.** Choosing where the user is going selects that country's
>    currency automatically (Indonesia → IDR, India → INR). Still overridable. The mapping is a
>    data table covering every country, so no country-specific *logic* is introduced.
> 2. **Currency choices are remembered globally.** Once chosen anywhere, the home and local
>    currencies are preselected on every later screen, including the standalone calculator.

---

### Point 6: Currency Converter
Provide a two-way currency converter containing:
- From currency
- To currency
- Amount
- Converted amount
- Current exchange rate
- Swap action (instantly swap currencies)
- Compact number formatting support: e.g., `100K`, `1M`, `1.5M`.

---

### Point 7: Currency Exchange Records
Users can record independent currency exchange transactions.

**Exchange record fields:**
- Given currency
- Given amount
- Received currency
- Received amount
- Date/time
- Provider
- Location
- Fee
- Note

**Automatic Calculations:**
- Actual exchange rate
- Current market rate
- Expected amount
- Difference
- Gain/loss
- Percentage difference
- Base-currency impact

**Historical Immutability Rule:** The actual historical exchange rate must be permanently stored. Future exchange-rate updates must NEVER modify the historical exchange rate.

---

### Point 8: Exchange History
Users can view all exchange transactions showing:
- Given amount, Received amount, Currency, Actual rate, Market rate, Difference, Gain/loss, Fees, Date/time.

**Overall exchange statistics:**
- Total exchanged
- Total received
- Average actual rate
- Average market rate
- Total gain/loss
- Total fees
- Best exchange rate
- Worst exchange rate

---

## Section 3: Wallet & Exchange Integration

### Point 9: Wallet
Wallets represent money currently held by the user.

**Supported wallet types:**
- Cash
- Bank
- Card
- UPI
- Other

**Wallet Actions:** Add wallet, Remove wallet, Exchange money, Transfer money, Adjust balance, View wallet history.  
Wallet balances must update automatically when connected transactions occur.

---

### Point 10: Exchange + Wallet Integration
When an exchange is associated with wallets:
- The source wallet decreases.
- The destination wallet increases.
- The exchange remains permanently recorded in exchange history.
- Wallet transaction history is updated.
- The exchange and wallet systems must use the same underlying financial data model where appropriate.

---

## Section 4: Expense Management & Splitting Engine

### Point 11: Expense Management & Non-Duplication Rule
- **Payer Rule:** Only the person who actually paid an expense should record it. Other participants must NOT duplicate the same expense.
- **Example:** If Rahul paid for dinner, Rahul records the dinner expense. Other participants do not create another copy of that dinner expense.
- Group balances are calculated from the original expense.

---

### Point 12: Personal Expense
A personal expense does not require participant selection.
- Flow: Enter amount → Select currency → Select category → Select payment method/wallet → Add optional note/image → Save.
- Personal expenses do NOT create group obligations.

---

### Point 13: Shared Expense
Shared expenses must support:
- Actual payer
- Participants
- Amount
- Currency
- Split method (Supported methods: **Equal**, **Percentage**, **Custom**)
- Auto calculates each participant's share automatically.
- Only the actual payer records the expense.

---

### Point 14: Expense Categories
- **Default categories:** Food, Hotel, Transport, Scooter, Activities, Shopping, Spa/Massage, Beach Club, Drinks, Tickets, SIM/Internet, Visa, Tips, Emergency, Other.
- Users can create custom categories.
- Categories should be reusable throughout analytics and expense management.

---

### Point 15: Expense Payment Method
- **Supported methods:** Cash, Card, UPI, Bank, Other.
- If an expense is connected to a wallet, the wallet balance must decrease automatically.
- If it is not connected to a wallet, the expense can still be recorded.

---

### Point 16: Expense Exchange Rate & Immutability
Foreign-currency expenses must preserve the actual exchange rate used for that expense.
- **Stored fields:** Original amount, Original currency, Base currency, Exchange rate, Base-currency amount.
- **Immutability Rule:** Historical expense values must NEVER change because the current exchange rate changes.

---

### Point 17: Group Expense Calculation
The application automatically calculates:
- Who paid
- Amount paid
- Each person's share
- Who paid more
- Who owes whom
- Net balance

**Example:**
- Rahul pays ₹800 for four people.
- Each person's share is ₹200.
- Rahul's own share is ₹200.
- The other three people collectively owe Rahul ₹600.
- The application calculates this automatically across all group expenses.

---

### Point 18: Automatic Person Balance
Participant balances must be calculated automatically without manual entry.
- The balance engine considers: Shared expenses, Payments, Settlements, Adjustments.
- Preserves the rule: Only the actual payer records the shared expense; participants do not duplicate expenses.

---

## Section 5: Settlement System & Flow

### Point 19: Settlement
- Settlement clears calculated group balances.
- Each person sees their own calculated amount.
- The application determines the required settlement amount automatically.

---

### Point 20: Simple Settlement Flow & UX Language
Settlement language must remain extremely simple.

**Terminology Rules:**
- Use simple terms: *You pay*, *You take*, *They pay you*, *They take from you*, *Your balance*, *Final amount*, *Settled*.
- AVOID technical jargon: *Obligation*, *Counterparty*, *Reconciliation*, *Claim balance*.

**Cross-App Comparison Flow:**
- Rahul app says: Awanish pays Rahul ₹1,200.
- Awanish app says: Rahul pays Awanish ₹2,000.
- Rahul enters Awanish's amount: ₹1,200 → Rahul sees: *You take ₹800 from Awanish*.
- Awanish enters Rahul's amount: ₹2,000 → Awanish sees: *You pay Rahul ₹800*.
- **Final Result:** Awanish → ₹800 → Rahul.

---

### Point 21: Settlement Payment Method
Supported methods: Wallet, Cash, Card, UPI, Other.
- If a wallet is selected: Deduct the settlement amount from the wallet.
- For Cash/Card/UPI/Other: Mark settlement as paid; do NOT automatically modify a wallet unless explicitly linked.

---

### Point 22: Partial Settlement
- Partial settlement must be supported (pay part now, settle remaining later).
- **Preserved state:** Original balance, Amount already settled, Remaining balance, Settlement history.

---

### Point 23: Settlement History
- Shows: Date, Person, Amount, Currency, Payment method, Status, Partial settlement history.
- Original expenses remain unchanged.

---

### Point 24: Settlement Details
- Shows: Other person's amount, User's amount, Difference, Final settlement amount.
- Settlement clears or adjusts the balance only; it must NOT modify original expense records.

---

### Point 25: Manual Settlement Adjustment
- Users may optionally record a mutually agreed manual settlement adjustment (e.g., taxi expense was ₹500, but participants agree on a different settlement amount).
- Recorded separately; does NOT overwrite the original expense.

---

### Point 26: Multi-Currency Settlement
- Settlement can happen in another currency.
- **Stored fields:** Original calculated base amount, Actual settlement amount, Settlement currency, Settlement exchange rate, Base-currency value.
- Historical settlement rates remain immutable.

---

## Section 6: Currency Performance, Negotiation & Cash Calculator

### Point 27: Final Foreign Currency Conversion
At trip end, users can convert remaining foreign currency back to base currency.
- **Stored fields:** Sold currency, Sold amount, Base currency, Received amount, Market rate, Actual rate, Difference, Fee, Date, Wallet.
- Conversion remains permanently recorded.

---

### Point 28: Overall Currency Performance
Combine currency activity across Exchanges, Expenses (where relevant), and Final currency conversion.
- **Shows:** Total base currency exchanged, Total foreign currency received, Average actual rate, Average market rate, Total gain/loss, Total fees, Remaining foreign currency, Amount converted back, Overall currency impact.
- Historical values must NEVER change due to future exchange rates.

---

### Point 29: Fast Negotiation & Currency Calculator
Dedicated fast shopping/bargaining/cash utility.
- **Standalone Mode:** Users can launch the calculator without creating or opening a trip. In this mode, the user manually selects the Base and Target currencies.

> **AMENDMENT 2026-09-05 (ADR 006).** The calculator asks for its two currencies only on first
> use. Afterwards it reuses the globally remembered choice and offers a "Change money" action to
> revisit it. The interface calls them *"Money you count in"* and *"Money you'll pay with"*.
- **Goal Flow:** Hear price → Enter → Understand → Negotiate → Offer → Buy → Optionally add expense (if linked to a trip).
- Auto-fetches exchange rates when online (cached locally).
- When offline: Uses most recent cached rate, allows manual rate override.
- No API dependency for operation.

---

### Point 30: Shopkeeper Shorthand Input
Support shorthand numbers:
- `1K` = 1,000
- `10K` = 10,000
- `100K` = 100,000
- `500K` = 500,000
- `1M` = 1,000,000
- `1.5M` = 1,500,000
- **Example:** `100K IDR` displays appropriately as `Rp100,000`, `100K IDR`, and Base-currency equivalent. Parser supports full numbers as well.

---

### Point 31: Two-Way Negotiation Input
One primary amount input with a currency selector.
- Entering base or foreign currency reinterprets numeric input according to selected currency (e.g., `150 INR` vs `150 IDR`).

---

### Point 32: Both Currency Values
Important results show both currencies (e.g., `500K IDR ≈ ₹2,950`). Show full and compact numbers where appropriate.

---

### Point 33: Three Number Formats
Support context-appropriate formats:
1. **Full number:** `Rp500,000`
2. **Compact number:** `500K`
3. **Currency value:** `₹2,950`

---

### Point 34: Live Negotiation Mode
Displays original shopkeeper price and allows quick percentage adjustments (e.g., `500K IDR` ↓ `-20%` ↓ `400K IDR`).

---

### Point 35: Percentage Controls
- **Default buttons:** `-5%`, `-10%`, `-15%`, `-20%`, `-25%`, `-30%`, `-40%`, `-50%`.
- **Also support:** `+5%`, `+10%`, `Custom %`.
- **Example:** `500K - 25% = 375K`. Must be mathematically accurate.

---

### Point 36: Direct Offer Mode
Users enter desired offer in either currency (e.g., Shopkeeper `500K IDR`, User enters `₹2,000` → app calculates `≈ 374K IDR`).

---

### Point 37: Currency Swap
Instant input currency switch. Same numeric input reinterpreted based on active currency.

---

### Point 38: Negotiation Comparison
Show: Shopkeeper price, User offer, Amount saved, Discount percentage (in both currencies where useful).

---

### Point 39: Negotiation History
Negotiation can optionally be saved.
- **Stored fields:** Original price, Final price, Currency, Discount percentage, Amount saved, Base-currency saving, Date/time, Note, Category.
- Separate from expenses until user explicitly converts purchase into an expense.

---

### Point 40: Final Negotiated Purchase → Add Expense
- Action: **Add to Expense**.
- Pre-fills: Final amount, Currency, Category = Shopping, Exchange rate, Base value.
- Editable: Category, Payer, Payment method, Wallet, Personal/shared, Participants, Note, Date/time, Image.
- Saving updates: Expense data, Wallet, Group balance, Analytics, Transaction totals.
- Negotiation itself does NOT automatically create an expense without explicit user action.

---

### Point 41: Cash Counting Mode
Enter required amount and select denominations.
- Displays: Required amount, Counted amount, Remaining, Extra, Short, Exact (e.g., Required `187K`, Counted `180K`, Remaining `7K`).
- Touch-friendly large interface.

---

### Point 42: Cash Counting + Currency Display
Display: Full amount (`187,000 IDR`), Compact K/M format (`187K IDR`), Base-currency equivalent (`≈ ₹1,100`).

---

### Point 43: Offline Negotiation Calculator
Works completely offline (parsing, shorthand, currency switching, %, direct offer, savings, cash counting, cached rates, manual override). No API call required for core functionality.

---

## Section 7: System Architecture, Data & Offline Persistence

### Point 44: Exchange Rate Provider Architecture
Provider abstraction pipeline:  
`Provider` → `Fetch Rate` → `Validate Rate` → `Store Rate` → `IndexedDB Cache`.
- Stored data: Rate, Timestamp, Source/provider.
- Fallback: If provider fails, use cached rate. Does not break calculator or historical transactions.
- Supports multiple providers in future.

---

### Point 45: Manual Exchange Rate Override
Manual override applies only to current calculator/session unless explicitly saved. Never modifies historical exchange transactions.

---

### Point 46: Advanced App-Like UI/UX
- Mobile-first layouts, large touch targets, bottom sheets, native-feeling dialogs, smooth transitions, sticky actions, premium typography, consistent spacing, modern cards, clean currency displays, light/dark themes.
- Supports: iPhone, Android, Mobile browsers, PWA, Desktop.

---

### Point 47: Fast Calculator UX
Prioritize speed for common calculations (Shopkeeper price → User offer → Quick % adjustment → Final price & savings → Add Expense / Count Cash).

---

### Point 48: Global Automatic Calculation
Centralized auto-calculation engine for: Currency conversion, Percentage calculation, Savings, Exchange rate, Base-currency amount, Group balance, Settlement amount, Wallet balance, Budget remaining, Analytics totals. No manual entry of calculable values.

---

### Point 49: Complete Offline Architecture
PWA with IndexedDB-based local persistence storing: Trips, Expenses, Images, Wallets, Exchanges, Settlements, Budgets, Analytics data, Negotiation history, Cash-counting state, Currency data, Rate cache, Transaction history. Network access only enhances exchange rates.

---

### Point 50: No Backend Requirement for V1
V1 does NOT require paid server, paid database, backend, user accounts, authentication, cloud sync, or online participant accounts. Fully usable locally.

---

### Point 51: End-of-Trip Summary
Complete report showing: Trip info, Total spent, Category totals, Daily average, Wallet balances, Exchange performance, Final currency conversion, Outstanding balances, Settled amounts, Budget status & performance.

---

### Point 52: Backup & Restore
- **Export formats:** Complete trip JSON, Expenses CSV, Exchange CSV, Settlement CSV, Wallet data CSV.
- **Import processing:** Validate data, detect conflicts, ask confirmation before destructive replacement, safely merge where supported. Never silently destroy existing data.
- **JSON Backup contents:** Trips, Participants, Expenses, Images, Wallets, Exchanges, Settlements, Categories, Budget, Negotiation history, Currency data, Metadata.

---

### Point 53: Offline-First Capability
Complete feature set (trips, expenses, images, wallets, exchanges, settlements, calculations, converter, negotiation, cash counting, analytics, history, budget, reports, backup/restore) available without internet connection. Internet required only for fresh rates.

---

### Point 54: Local Data Persistence (Dexie)
IndexedDB via Dexie abstraction layer for all domain entities. Do NOT scatter raw IndexedDB operations throughout UI components.

---

### Point 55: Complete Offline Startup
Cached PWA opens immediately, loads local data immediately, with NO network startup wait, NO full-screen loading, NO "Connecting..." screen. Background refresh after startup.

---

### Point 56: Data Integrity & Immutability
Historical financial values MUST NEVER change because of current exchange rates. Applies to Exchange records, Expense conversions, Settlement calculations, Final currency conversions, Negotiated purchases converted into expenses.

---

### Point 57: No Backend Requirement Standard
Remain capable of functioning without a backend in V1.

---

### Point 58: Future-Proof Domain Architecture
Loosely coupled, reusable domain modules: Trip, Currency, Exchange, Wallet, Expense, Participant, Group Balance, Settlement, Budget, Analytics, Negotiation, Cash Calculator, Transaction History, Backup/Restore, Offline Storage, Rate Provider.

---

### Point 59: Final Overall Application Flow
`Create Trip` → `Currency / Wallet` → `Exchange Money` → `Shopkeeper Negotiation` → `Optional Add to Expense` → `Personal / Shared Expense` → `Automatic Group Balance` → `Settlement` → `Final Foreign Currency Conversion` → `Overall Trip Report`.

---

## Section 8: Summary of Core Finalized Rules

### Point 60: Most Important Finalized Rules Summary
- **Trip:** Optional participants, budget, additional currencies. Everything addable later.
- **Expenses:** Only actual payer records expense. Participants never duplicate. Auto group calculations. Optional images.
- **Settlement:** Auto balance calculation. Each app calculates own balance. Users compare. App determines difference. "You pay" / "You take" language. Wallet payments update wallet; non-wallet payments mark paid. Partial settlement supported. Immutable original expenses.
- **Currency:** Multi-currency, multi-exchange support. Immutable historical rates. Market rate comparisons. Auto gain/loss & fee tracking. Final conversion support. Overall currency performance.
- **Negotiation:** K/M shorthand. Dual currency display & input. Cached/offline rates + manual override. Percentage & direct offer negotiation. Cash counting. Explicit conversion to expense.
- **Offline:** Dexie + IndexedDB persistence. Offline startup. No backend needed for V1.

---

## Section 9: Technology Stack, UI Components & Design System

### Point 61: Technology Stack & UI/UX Foundation
- **Stack:** Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Base UI, Motion for React, Lucide React, Dexie, IndexedDB, React Hook Form, Zod, Recharts, PWA/service worker architecture.
- Avoid unnecessary libraries; specialized libraries allowed only when providing clear technical value.

---

### Point 62: UI Component System — shadcn/ui + Base UI
- Primary foundation: **shadcn/ui** + **Base UI** primitives.
- Own and customize component source.
- Standard components for Buttons, Inputs, Dialogs, Sheets, Tabs, Popovers, Calendars, Selectors, Search/command, Form controls.
- No competing primary UI systems.

---

### Point 63: Tailwind CSS
- Used for styling, responsive design, design tokens, CSS variables, light/dark themes, spacing, layouts.
- Centralized design tokens instead of hard-coded inline styles.

---

### Point 64: Motion for React
- Primary animation system for screen transitions, sheets, dialogs, cards, lists, tabs, currency/wallet changes, expense/settlement/budget states, negotiation, gestures, shared element transitions.

---

### Point 65: Motion Design Rules
- Fast, smooth, subtle, purposeful, consistent, mobile-friendly.
- Avoid excessive bounce, long transitions, interaction-blocking animations.

---

### Point 66: Financial Value Animation Rule
- Visual financial changes may be animated (balances, spending, budget, savings, settlement), BUT underlying state must be immediately correct. Animation is visual feedback only, NEVER the source of financial truth.

---

### Point 67: Lucide React Icons
- Primary icon library: consistent, simple, modern, accessible.

---

### Point 68: Forms — React Hook Form + Zod
- React Hook Form + Zod validation across Trips, Expenses, Participants, Wallets, Exchanges, Settlements, Budgets, Negotiation, Backup/import. Validation at domain and UI layers.

---

### Point 69: IndexedDB — Dexie Layer
- Dexie abstraction layer providing Database schemas, Repositories, Migrations, Queries, and React live-query integration.

---

### Point 70: Single Source of Truth
- Centralized financial calculation engine powering Dashboard, Wallet, Expenses, Group balances, Settlement, Budget, Analytics, Transaction history, End-of-trip report, Negotiation. No duplicated financial formulas across components.

---

### Point 71: Currency Architecture
- Reusable currency service handling currency metadata, symbols, flags, decimal rules, formatting, conversion, rate direction, caching, manual overrides, historical/current rates. No currency-specific (e.g. IDR/INR) hardcoded business logic.

---

### Point 72: Exchange Rate Provider Architecture
- Provider abstraction (`Fetch` → `Validate` → `Store` → `Cache`). Offline mode uses cache. API is never a single point of failure.

---

### Point 73: Recharts for Analytics
- Standard 2D analytics (Category spending, Spending over time, Budget, Currency performance, Payment methods, Daily spending). Real data, mathematically correct, offline, responsive, light/dark aware.

---

### Point 74: 3D Visualization Rule
- 2D charts by default. 3D introduced ONLY if it provides genuine analytical/interaction value. Never sacrifice readability, accuracy, performance, or accessibility.

---

### Point 75: PWA & Service Worker
- Installable PWA supporting Add to Home Screen, Standalone mode, Offline shell, Service worker, Cached static assets, Offline routes, IndexedDB, Background rate refresh, Web app manifest.

---

### Point 76: Offline Architecture Flow
`Internet` → `Exchange Rate Provider` → `Validation` → `IndexedDB Cache` → `Local Application`. Core app uses local data; network failure does not impact functionality.

---

### Point 77: No Network-Dependent Startup
Local data loads first; fresh network data refreshes silently in the background.

---

### Point 78: Negotiation Calculator Technical Requirements
Reuses Currency service, Exchange-rate service, Number formatting, Cached rates, Calculation engine. Supports K/M parsing, dual currencies, currency switching, percentages, direct offers, savings, cash counting, add to expense.

---

### Point 79: Dedicated Negotiation UI
Dedicated mobile utility UI for shopkeeper price, user offer, quick percentage buttons, savings display, Add Expense / Count Cash actions.

---

### Point 80: Cash Counting UX
Large touch-friendly controls showing Required amount, Counted amount, Remaining, Exact, Extra, Short. Quick denomination tapping.

---

### Point 81: Expense Image Handling
Optional receipt/bill images stored locally. Optimized via compression, resizing, thumbnails, lazy loading. Expense functions perfectly without an image.

---

### Point 82: Unified Transaction Architecture
Unified transaction index referencing Expense, Exchange, Wallet movement, Settlement, Final conversion, Adjustment. Domain records remain source of truth.

---

### Point 83: Backup Architecture
Preserves data relationships. Import workflow: Validate schema/version → Conflict detection → User confirmation → Safe merge/replace.

---

### Point 84: CSV Architecture
Separate CSV exports for Expenses, Exchanges, Settlements, Wallet transactions. JSON is primary complete backup format.

---

### Point 85: Accessibility Standard
Keyboard nav, focus management, screen-reader labels, semantic HTML, contrast, touch target sizes, accessible dialogs/sheets, reduced-motion support.

---

### Point 86: Mobile-First Responsive Design
Primary target: iPhone, Android. Secondary target: Small/large phones, tablets, desktop. Custom mobile-first layouts, not shrunk desktop views.

---

### Point 87: App-Like Interaction Patterns
Bottom navigation, quick actions, bottom sheets, swipe gestures, smooth transitions, sticky actions, large touch targets. Avoid desktop sidebars, dense admin tables, tiny buttons.

---

### Point 88: Design System Consistency
Unified design system for colors, typography, spacing, radius, shadows, icons, buttons, inputs, cards, sheets, dialogs, toasts, tabs, motion, empty/error/success states.

---

### Point 89: Light & Dark Theme
Native support for Light and Dark modes using centralized CSS variables/tokens. All surfaces, charts, text, and borders adapt cleanly.

---

### Point 90: Application Performance
Fast performance with large local datasets. Optimized IndexedDB queries, React rendering, virtualization/pagination where needed.

---

### Point 91: Motion Performance Rules
Prefer `transform` and `opacity`. Respect reduced-motion preferences. Animations must never make financial workflows feel slower.

---

### Point 92: Component Reusability Rule
Mandatory reusable component abstractions: `CurrencyAmount`, `CurrencySelector`, `AmountInput`, `PercentageButton`, `WalletCard`, `ExpenseCard`, `TransactionItem`, `ParticipantSelector`, `BottomSheet`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `SuccessState`, `BudgetProgress`, `AnalyticsCard`, `ChartContainer`, `QuickAction`, `NegotiationInput`, `CashCounter`.

---

### Point 93: Domain Services Separation
Business logic separated from UI via dedicated services: Currency, Exchange-rate, Expense, Wallet, Settlement, Budget, Analytics, Negotiation, Transaction, Backup. UI components consume domain logic.

---

### Point 94: Validation & Financial Precision
Precise money/decimal handling. Do NOT rely on naive JavaScript floating-point arithmetic for financial calculations. Centralized rounding, decimal rules, currency conversion, percentages, expense splitting, settlement, gain/loss, fees.

---

### Point 95: Automated Testing Requirements
Automated test suite covering: Currency conversion, Exchange gain/loss, Multiple exchanges, Wallet calculations, Expense splitting, Group balances, Settlement, Partial settlement, Multi-currency settlement, Final conversion, Budget, Negotiation %, K/M parsing, Cash counting, Import/export, Historical rates.

---

### Point 96: Offline Testing Scenarios
Test online, slow network, offline, API failure, invalid API response, cached rate, no cached rate, manual override, offline refresh, PWA offline startup, IndexedDB persistence.

---

### Point 97: Dependency Discipline
Strict adherence to approved stack: shadcn/ui, Base UI, Tailwind CSS, Motion, Lucide React, Dexie, IndexedDB, React Hook Form, Zod, Recharts, PWA/service worker. Avoid redundant libraries.

---

### Point 98: No Generic UI Library Mixing
Primary system is shadcn/ui + Base UI + Tailwind CSS. Do NOT mix MUI, Ant Design, Chakra, or Mantine.

---

### Point 99: Final UI/UX & Architecture Standard
Universal Travel Wallet must feel like a **Premium Mobile Travel-Money Application** featuring:
- Soft Tactile UI visual language — Claymorphism (day mode) / Neumorphism (night mode), Skeuomorphic press feedback, zero glass/blur/neon (see ADR 005 in `.ai/DECISIONS.md`)
- Mobile-first UX and app-like interaction
- Motion, GSAP & parallax-powered animation layer
- shadcn/ui + Base UI accessible UI foundation
- Tailwind CSS styling system
- Lucide React icon system
- Dexie + IndexedDB local persistence
- PWA offline-first architecture
- Centralized calculation engine (single source of financial truth)
- Historical financial immutability & mathematical precision
- Accessible, performant, cohesive light/dark UI system

---

## Section 10: Authoritative Visual Design System Reference

The authoritative visual design specification is documented in [design-system/universal-travel-wallet.md](file:///d:/awi/universal-travel-wallet/design-system/universal-travel-wallet.md).

### Design System Hierarchy
```text
Universal Travel Wallet Project Knowledge
        ↓
Project Rules
        ↓
Universal Travel Wallet Design System (design-system/universal-travel-wallet.md)
        ↓
Custom Screenshot-Derived Design Patterns (GradientIconTile, Curated Tokens)
        ↓
UI/UX Pro Max as supporting design intelligence
        ↓
Page/component implementation
```

### Key Visual Rules:
- **Authoritative Source:** `design-system/universal-travel-wallet.md` is the primary visual specification. Supporting tools (like UI/UX Pro Max) act as intelligence helpers and must NEVER override or replace this design system.
- **Soft Tactile Surface Material (ADR 005, supersedes the original Liquid Glass mandate):** Primary surface/material language is opaque Claymorphism (day mode) / Neumorphism (night mode) with Skeuomorphic press feedback — `SoftCard`, `SoftButton`, soft dual-tone shadows, zero blur/translucency/neon.
- **Custom Gradient Accent Pattern:** Curated pastel linear gradients rendered as puffy clay tiles for small icon containers (`GradientIconTile`), category icons, wallet icons, card leading anchors, and quick-action icons. Gradients belong exclusively to the content/accent layer, leaving surrounding UI surfaces, body copy, and financial values calm and readable.
- **Deterministic Gradient Assignment:** Gradients are selected from centralized tokens with semantic or deterministic mapping, avoiding random per-render color changes.
- **Financial Readability Priority:** Financial numbers must remain solid, high-contrast, tabular text (`tabular-nums`). Gradients or visual effects must never obscure monetary data.

