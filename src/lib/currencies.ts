import { customList } from 'country-codes-list';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

/**
 * Resolves a currency's symbol through the platform's own Intl data.
 *
 * `country-codes-list` has no currency-symbol field — asking it for one used to
 * return the literal string `{currencySymbol}`, which is what every screen then
 * displayed. Intl knows the symbols for every ISO 4217 code, works offline, and
 * costs no extra dependency.
 */
function resolveSymbol(code: string): string {
  for (const display of ['narrowSymbol', 'symbol'] as const) {
    try {
      const parts = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: code,
        currencyDisplay: display,
      }).formatToParts(0);
      const symbol = parts.find((part) => part.type === 'currency')?.value;
      // Intl returns the generic currency sign for placeholder codes such as
      // XXX ("no currency"), which tells the reader nothing. Anything else —
      // including the code itself — is a usable label.
      if (symbol && symbol !== '¤') return symbol;
    } catch {
      // An unknown code throws RangeError. Try the next display style, then
      // give up and use the code.
    }
  }
  return code;
}

const currencyCodeToName = customList('currencyCode', '{currencyNameEn}');
const currencyCodeToFlag = customList('currencyCode', '{flag}');

const currenciesMap = new Map<string, CurrencyItem>();

Object.keys(currencyCodeToName).forEach((code) => {
  if (!code || currenciesMap.has(code)) return;
  currenciesMap.set(code, {
    code,
    name: currencyCodeToName[code] || code,
    symbol: resolveSymbol(code),
    flag: currencyCodeToFlag[code] || '🌍',
  });
});

export const CURRENCIES: CurrencyItem[] = Array.from(currenciesMap.values()).sort((a, b) =>
  a.code.localeCompare(b.code)
);

export function getCurrencyDetails(code: string): CurrencyItem {
  const upper = code.toUpperCase();
  const known = currenciesMap.get(upper);
  if (known) return known;

  // A currency can be valid without belonging to a country in the list.
  return {
    code: upper,
    name: upper,
    symbol: resolveSymbol(upper),
    flag: '🌍',
  };
}
