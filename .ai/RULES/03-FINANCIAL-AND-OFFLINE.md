# Financial Accuracy & Offline Persistence Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 21: UI Must Not Own Financial Logic
UI components should display and collect information. Financial calculations belong to centralized domain logic.  
Do NOT calculate group balances, settlement amounts, currency conversions, exchange gain/loss, budget calculations, or wallet balances independently inside different components.

---

### [USER-DEFINED RULE] Rule 32: Financial Precision
Financial calculations must use an appropriate precise money/decimal strategy.  
Do NOT rely on naive JavaScript floating-point arithmetic for monetary calculations where it can cause inaccuracies.  
Centralize: Rounding, Currency decimals, Conversion, Percentages, Splits, Settlement calculations, Exchange calculations.

---

### [USER-DEFINED RULE] Rule 33: Historical Financial Immutability
Never modify historical financial values because of current data.  
Applies to: Historical exchange rates, Historical expense conversions, Historical settlement rates, Historical final conversions, Historical negotiated purchase conversions.  
Current exchange rates must NEVER rewrite historical transactions.

---

### [USER-DEFINED RULE] Rule 34: Offline-First Architecture
Core functionality must work without network access. Do NOT make the network a dependency for:
- Application startup
- Existing local data
- Expense management
- Wallets
- Settlements
- Calculations
- History
- Analytics
- Backup/restore

---

### [USER-DEFINED RULE] Rule 35: Network Enhances, Not Controls
Network functionality should enhance the application (e.g. current exchange rates refreshed online), but historical calculations must continue using stored historical data.

---

### [USER-DEFINED RULE] Rule 36: Database Access Must Be Centralized
Do not scatter raw IndexedDB operations throughout UI components. Use the established Dexie/data-access architecture. Components should not directly manage database internals unless there is a strong architectural reason.

---

### [USER-DEFINED RULE] Rule 37: Data Migration Safety
Never destructively change existing IndexedDB structures without a proper migration. Existing user data must be preserved. Database schema changes must be: Versioned, Migrated, Tested, and Recoverable where appropriate.
