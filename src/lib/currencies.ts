import { customList } from 'country-codes-list';

export interface CurrencyItem {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Generate the list from the country-codes-list package
// Getting a map of CurrencyCode -> Data
const currencyCodeToName = customList('currencyCode', '{currencyNameEn}');
const currencyCodeToSymbol = customList('currencyCode', '{currencySymbol}');
const currencyCodeToFlag = customList('currencyCode', '{flag}');

const currenciesMap = new Map<string, CurrencyItem>();

Object.keys(currencyCodeToName).forEach(code => {
  if (code && !currenciesMap.has(code)) {
    currenciesMap.set(code, {
      code,
      name: currencyCodeToName[code] || code,
      symbol: currencyCodeToSymbol[code] || code,
      flag: currencyCodeToFlag[code] || '🌍'
    });
  }
});

export const CURRENCIES: CurrencyItem[] = Array.from(currenciesMap.values()).sort((a, b) => a.code.localeCompare(b.code));

export function getCurrencyDetails(code: string): CurrencyItem {
  return currenciesMap.get(code.toUpperCase()) || {
    code: code.toUpperCase(),
    name: code.toUpperCase(),
    symbol: code.toUpperCase(),
    flag: '🌍'
  };
}
