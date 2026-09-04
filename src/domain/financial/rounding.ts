import { Money, getCurrencyDecimals } from './money';

/**
 * Rounds a Money object to its currency's standard decimal places using ROUND_HALF_UP.
 */
export function roundToCurrencyDecimals(money: Money): Money {
  const decimals = getCurrencyDecimals(money.currency);
  const roundedStr = money.rawAmount.toFixed(decimals);
  return Money.fromDecimal(roundedStr, money.currency);
}
