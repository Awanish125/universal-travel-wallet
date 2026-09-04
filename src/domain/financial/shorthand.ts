import { Money, getCurrencyDecimals } from './money';

/**
 * Parses shorthand numeric input string into standard numeric string.
 * Supports:
 * '1K' -> '1000'
 * '100K' -> '100000'
 * '1.5M' -> '1500000'
 * '500' -> '500'
 */
export function parseShorthandAmount(input: string): string {
  if (!input || input.trim() === '') return '0';

  const clean = input.trim().toUpperCase().replace(/,/g, '');
  
  if (clean.endsWith('K')) {
    const num = parseFloat(clean.slice(0, -1));
    if (isNaN(num)) return '0';
    return String(Math.round(num * 1000));
  }

  if (clean.endsWith('M')) {
    const num = parseFloat(clean.slice(0, -1));
    if (isNaN(num)) return '0';
    return String(Math.round(num * 1000000));
  }

  const parsed = parseFloat(clean);
  if (isNaN(parsed)) return '0';
  return String(parsed);
}

/**
 * Formats a Money object into compact shorthand string (e.g. 500K, 1.5M).
 */
export function formatCompactNumber(money: Money): string {
  const val = money.toNumber();
  const absVal = Math.abs(val);

  if (absVal >= 1000000) {
    const m = val / 1000000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (absVal >= 1000) {
    const k = val / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }

  return val.toFixed(getCurrencyDecimals(money.currency));
}

/**
 * Formats a Money object into standard localized full number string (e.g. Rp500,000).
 */
export function formatFullNumber(money: Money): string {
  const dec = getCurrencyDecimals(money.currency);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  }).format(money.toNumber());
}
