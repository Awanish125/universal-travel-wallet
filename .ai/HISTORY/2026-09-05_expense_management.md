# Session Log: Expense Management & Feature Adjustments

**Date:** 2026-09-05

## USER REQUEST
1. Use a package for getting a list of all countries, flags, ISO codes, and symbols.
2. Use React MUI and Tailwind to implement the searchable dropdown properly.
3. Use a Google-searched open-source real-time API for exchange rates.
4. Continue with Expense Logging after fixing the above.

## AI RESULT
- **Global Currencies Package**: Installed `country-codes-list` and mapped it inside `src/lib/currencies.ts` to dynamically build a list of all global currencies with their official emojis, symbols, and ISO-4217 codes.
- **MUI Integration**: Replaced the native `<select>` elements and `react-select` with `@mui/material/Autocomplete`, heavily styled using Tailwind `sx` props to match the `shadcn/ui` theme (`CurrencySelect.tsx`).
- **Open Source Live API**: Refactored `OpenCurrencyProvider` to use `@fawazahmed0/currency-api` (an open-source, free CDN providing real-time daily rates for 150+ fiat currencies).
- **Calculator 2-Way Binding**: Rewrote `useNegotiationCalculator` so the user can freely type shorthand numbers (`200K`) into *either* the Base or Foreign currency inputs, and the UI dynamically updates the other input instantly.
- **Core Expense Logging (Points 13 & 14)**:
  - Built `ExpenseMapper` and `ExpenseRepository` for Hexagonal Architecture persistence.
  - Implemented transactional integrity in `ExpenseRepository` (When an expense is saved using a Wallet, the wallet's balance is automatically deducted in a Dexie Transaction).
  - Wired up `AddExpensePage` (`/trips/[id]/expense`) fetching live participants, wallets, and categories from IndexedDB, automatically translating foreign expense inputs into the trip's Base Currency using the live `CompositeRateManager`.
