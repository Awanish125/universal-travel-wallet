import { Money } from './money';
import { roundToCurrencyDecimals } from './rounding';

/**
 * Currency Conversion Service
 * Converts an amount from one currency to another using a given exchange rate.
 * 
 * Historical Immutability Rule:
 * The exchangeRate passed to this function is captured at transaction time and MUST NOT
 * be retroactively recalculated when live exchange rates update.
 */
export function convertAmount(
  sourceMoney: Money,
  targetCurrency: string,
  exchangeRate: number | string
): Money {
  if (sourceMoney.currency === targetCurrency.toUpperCase()) {
    return sourceMoney;
  }

  const convertedMoney = sourceMoney.multiply(exchangeRate);
  const targetMoney = Money.fromDecimal(convertedMoney.toDecimalString(), targetCurrency);
  return roundToCurrencyDecimals(targetMoney);
}

/**
 * Calculates effective exchange rate from given source and target amounts.
 */
export function calculateEffectiveRate(
  sourceAmount: number | string,
  targetAmount: number | string
): string {
  const src = Money.fromDecimal(sourceAmount, 'TMP');
  const tgt = Money.fromDecimal(targetAmount, 'TMP');
  if (src.isZero()) return '0';
  return tgt.divide(src.toDecimalString()).toDecimalString();
}
