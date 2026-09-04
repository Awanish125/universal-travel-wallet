import BigNumber from 'bignumber.js';

/**
 * Money Value Object
 * Encapsulates monetary amounts and currency codes.
 * Hides BigNumber implementation details from the rest of the application.
 */
export class Money {
  private readonly _amount: BigNumber;
  readonly currency: string;

  private constructor(amount: BigNumber, currency: string) {
    this._amount = amount;
    this.currency = currency.toUpperCase();
  }

  static fromDecimal(amount: number | string, currency: string): Money {
    const bn = new BigNumber(amount);
    if (bn.isNaN()) {
      throw new Error(`Invalid monetary amount: ${amount}`);
    }
    return new Money(bn, currency);
  }

  static zero(currency: string): Money {
    return new Money(new BigNumber(0), currency);
  }

  get rawAmount(): BigNumber {
    return this._amount;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount.plus(other._amount), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this._amount.minus(other._amount), this.currency);
  }

  multiply(factor: number | string): Money {
    return new Money(this._amount.times(new BigNumber(factor)), this.currency);
  }

  divide(divisor: number | string): Money {
    const bnDiv = new BigNumber(divisor);
    if (bnDiv.isZero()) {
      throw new Error('Division by zero in Money calculation');
    }
    return new Money(this._amount.dividedBy(bnDiv), this.currency);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this._amount.isEqualTo(other._amount);
  }

  isGreaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount.isGreaterThan(other._amount);
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this._amount.isLessThan(other._amount);
  }

  isZero(): boolean {
    return this._amount.isZero();
  }

  isNegative(): boolean {
    return this._amount.isNegative();
  }

  toDecimalString(): string {
    return this._amount.toString();
  }

  toNumber(): number {
    return this._amount.toNumber();
  }

  format(decimals?: number): string {
    const defaultDecimals = getCurrencyDecimals(this.currency);
    const dec = decimals ?? defaultDecimals;
    return `${this.currency} ${this._amount.toFixed(dec)}`;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}

/**
 * Returns standard currency decimal rules.
 * Default 2 decimals, 0 for IDR/JPY/VND, 3 for KWD/BHD/OMR.
 */
export function getCurrencyDecimals(currencyCode: string): number {
  const code = currencyCode.toUpperCase();
  if (['IDR', 'JPY', 'VND', 'KRW', 'CLP'].includes(code)) return 0;
  if (['KWD', 'BHD', 'OMR', 'JOD'].includes(code)) return 3;
  return 2;
}
