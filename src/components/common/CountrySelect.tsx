'use client';

import React, { useMemo } from 'react';
import { COUNTRIES } from '../../lib/countries';
import { getCurrencyDetails } from '../../lib/currencies';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { Emblem } from './Emblem';

interface Props {
  /** The country's English name — what a Trip stores. */
  value: string;
  onChange: (countryName: string) => void;
  className?: string;
  label?: string;
  hint?: string;
  error?: string;
}

/**
 * Country picker. Each row shows the money spent there, because picking a
 * country is what fills the trip's spending currency in.
 */
export function CountrySelect({ value, onChange, className, label, hint, error }: Props) {
  const options = useMemo<SearchableOption[]>(
    () =>
      COUNTRIES.map((country) => {
        const currency = getCurrencyDetails(country.currencyCode || '');
        return {
          value: country.name,
          label: country.name,
          description: country.currencyCode
            ? `Spends in ${currency.symbol} ${country.currencyCode}`
            : undefined,
          leading: <Emblem emoji={country.flag} code={country.code} />,
          keywords: `${country.code} ${country.currencyCode}`,
        };
      }),
    []
  );

  // Trips created before this picker existed stored free text; keep it visible.
  const optionsWithCurrent = useMemo(() => {
    if (!value || options.some((o) => o.value === value)) return options;
    return [{ value, label: value, leading: <Emblem code="??" /> }, ...options];
  }, [options, value]);

  return (
    <SearchableSelect
      className={className}
      label={label}
      hint={hint}
      options={optionsWithCurrent}
      value={value}
      onChange={onChange}
      error={error}
      placeholder="Choose a country"
      searchPlaceholder="Search Indonesia, India..."
      emptyMessage="No country matches that search."
    />
  );
}
