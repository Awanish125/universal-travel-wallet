'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Money } from '../../domain/financial/money';
import { currencySymbol, formatAmount } from '../../lib/currency-format';
import { getCurrencyDecimals } from '../../domain/financial/money';
import { AnimatedNumber } from './AnimatedNumber';

interface Props {
  /** Either a domain Money, or a raw amount plus its currency. */
  money?: Money;
  amount?: number;
  currency?: string;
  /** Interpolate the digits when the value changes. Defaults to false. */
  animate?: boolean;
  /** Render the three-letter code instead of the symbol. */
  showCode?: boolean;
  className?: string;
  symbolClassName?: string;
}

/**
 * The single way financial values are rendered (Point 92). Numbers stay solid,
 * high-contrast and tabular; the symbol sits in its own muted span so the
 * digits remain the loudest thing on the row (Rule 73).
 */
export function CurrencyAmount({
  money,
  amount,
  currency,
  animate = false,
  showCode = false,
  className,
  symbolClassName,
}: Props) {
  const resolvedCurrency = (money?.currency ?? currency ?? 'USD').toUpperCase();
  const resolvedAmount = money?.toNumber() ?? amount ?? 0;
  const decimals = getCurrencyDecimals(resolvedCurrency);
  const prefix = showCode ? resolvedCurrency : currencySymbol(resolvedCurrency);

  return (
    <span className={clsx('financial-num inline-flex items-baseline gap-1', className)}>
      <span className={clsx('font-bold text-muted-foreground', symbolClassName)}>
        {prefix}
      </span>
      {animate ? (
        <AnimatedNumber value={resolvedAmount} decimals={decimals} />
      ) : (
        <span>{formatAmount(resolvedAmount, resolvedCurrency, { withSymbol: false }).replace(`${resolvedCurrency} `, '')}</span>
      )}
    </span>
  );
}
