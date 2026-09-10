import { customList } from 'country-codes-list';

export interface CountryItem {
  /** ISO 3166-1 alpha-2 code, e.g. "ID". */
  code: string;
  /** English country name, e.g. "Indonesia". */
  name: string;
  /** Emoji flag. */
  flag: string;
  /** ISO 4217 code of the country's own currency, e.g. "IDR". */
  currencyCode: string;
}

const rawList = customList('countryCode', '{countryNameEn}|{currencyCode}|{flag}');

const countriesByCode = new Map<string, CountryItem>();

Object.entries(rawList).forEach(([code, value]) => {
  const [name, currencyCode, flag] = String(value).split('|');
  if (!code || !name) return;
  countriesByCode.set(code, {
    code,
    name,
    flag: flag || '🌍',
    currencyCode: (currencyCode || '').toUpperCase(),
  });
});

export const COUNTRIES: CountryItem[] = Array.from(countriesByCode.values()).sort((a, b) =>
  a.name.localeCompare(b.name)
);

/** Looks a country up by its ISO code. */
export function getCountryByCode(code: string): CountryItem | undefined {
  return countriesByCode.get(code.toUpperCase());
}

/**
 * Looks a country up by the exact English name stored on older trips, which
 * recorded the country as free text before the picker existed.
 */
export function getCountryByName(name: string): CountryItem | undefined {
  const needle = name.trim().toLowerCase();
  return COUNTRIES.find((c) => c.name.toLowerCase() === needle);
}

/** The currency a country spends in, or an empty string when unknown. */
export function getCurrencyForCountry(countryNameOrCode: string): string {
  const match =
    getCountryByCode(countryNameOrCode) || getCountryByName(countryNameOrCode);
  return match?.currencyCode ?? '';
}
