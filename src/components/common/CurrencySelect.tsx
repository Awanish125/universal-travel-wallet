'use client';

import React, { useMemo } from 'react';
import { CURRENCIES, getCurrencyDetails } from '../../lib/currencies';
import { SearchableSelect, SearchableOption } from './SearchableSelect';
import { Emblem } from './Emblem';

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  label?: string;
  /** Short plain-language note under the label, e.g. "where you are from". */
  hint?: string;
  error?: string;
  disabled?: boolean;
}

/**
 * Currency picker. Searching matches the code (INR), the name (Indian Rupee)
 * and the symbol (₹), so typing a shortform finds the currency.
 */
export function CurrencySelect({
  value,
  onChange,
  className,
  label,
  hint,
  error,
  disabled,
}: Props) {
  const options = useMemo<SearchableOption[]>(
    () =>
      CURRENCIES.map((currency) => ({
        value: currency.code,
        label: `${currency.code} — ${currency.symbol}`,
        description: currency.name,
        leading: <Emblem emoji={currency.flag} code={currency.code} symbol={currency.symbol} />,
        keywords: `${currency.name} ${currency.symbol}`,
      })),
    []
  );

  // A trip may hold a currency the generated list does not cover; show it
  // rather than silently rendering the field as empty.
  const optionsWithCurrent = useMemo(() => {
    if (!value || options.some((o) => o.value === value)) return options;
    const details = getCurrencyDetails(value);
    return [
      {
        value: details.code,
        label: `${details.code} — ${details.symbol}`,
        description: details.name,
        leading: <Emblem emoji={details.flag} code={details.code} symbol={details.symbol} />,
      },
      ...options,
    ];
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
      disabled={disabled}
      placeholder="Choose a currency"
      searchPlaceholder="Search INR, Rupee, ₹..."
      emptyMessage="No currency matches that search."
    />
  );
}
