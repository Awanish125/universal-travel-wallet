import BigNumber from 'bignumber.js';

// Configure default BigNumber settings for financial safety
BigNumber.config({
  EXPONENTIAL_AT: [-12, 20],
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

export function safeAdd(a: string | number, b: string | number): string {
  return new BigNumber(a).plus(new BigNumber(b)).toString();
}

export function safeSubtract(a: string | number, b: string | number): string {
  return new BigNumber(a).minus(new BigNumber(b)).toString();
}

export function safeMultiply(a: string | number, b: string | number): string {
  return new BigNumber(a).times(new BigNumber(b)).toString();
}

export function safeDivide(a: string | number, b: string | number): string {
  const divisor = new BigNumber(b);
  if (divisor.isZero()) {
    throw new Error('Division by zero in safeDivide');
  }
  return new BigNumber(a).dividedBy(divisor).toString();
}

export function safeRound(amount: string | number, decimals: number): string {
  return new BigNumber(amount).toFixed(decimals, BigNumber.ROUND_HALF_UP);
}

export function compareAmounts(a: string | number, b: string | number): number {
  return new BigNumber(a).comparedTo(new BigNumber(b)) ?? 0;
}
