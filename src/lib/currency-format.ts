import { Money, getCurrencyDecimals } from '../domain/financial/money';
import { getCurrencyDetails } from './currencies';

/**
 * Presentation-layer currency formatting.
 *
 * The domain `Money` value object deliberately knows nothing about symbols or
 * flags — it owns arithmetic and decimal rules only. Symbol lookup lives here,
 * so every screen renders money the same way (Point 71, Point 92).
 */

/** The symbol for a currency code, e.g. "₹" for INR. */
export function currencySymbol(code: string): string {
  return getCurrencyDetails(code).symbol || code.toUpperCase();
}

/** "₹" plus the code, e.g. "₹ INR" — used in labels and pickers. */
export function currencyBadge(code: string): string {
  const symbol = currencySymbol(code);
  return symbol === code.toUpperCase() ? code.toUpperCase() : `${symbol} ${code.toUpperCase()}`;
}

export interface FormatAmountOptions {
  /** Show the symbol instead of the three-letter code. Defaults to true. */
  withSymbol?: boolean;
  /** Override the currency's own decimal rule. */
  decimals?: number;
}

/** Formats a raw number with thousands separators and the currency's decimals. */
export function formatAmount(
  amount: number,
  currency: string,
  options: FormatAmountOptions = {}
): string {
  const decimals = options.decimals ?? getCurrencyDecimals(currency);
  const digits = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const prefix =
    options.withSymbol === false ? currency.toUpperCase() : currencySymbol(currency);
  return `${prefix}${options.withSymbol === false ? ' ' : ''}${digits}`;
}

/** Formats a domain `Money` for display. */
export function formatMoney(money: Money, options: FormatAmountOptions = {}): string {
  return formatAmount(money.toNumber(), money.currency, options);
}
