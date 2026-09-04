import { describe, it, expect } from 'vitest';
import { Money, getCurrencyDecimals } from '../money';

describe('Money Value Object', () => {
  it('should encapsulate decimal amounts and currency codes', () => {
    const money = Money.fromDecimal('100.50', 'USD');
    expect(money.currency).toBe('USD');
    expect(money.toDecimalString()).toBe('100.5');
    expect(money.toNumber()).toBe(100.5);
  });

  it('should handle exact addition without floating point binary errors', () => {
    const m1 = Money.fromDecimal('0.1', 'USD');
    const m2 = Money.fromDecimal('0.2', 'USD');
    const result = m1.add(m2);
    expect(result.toDecimalString()).toBe('0.3');
  });

  it('should throw when adding different currencies', () => {
    const m1 = Money.fromDecimal('100', 'USD');
    const m2 = Money.fromDecimal('100', 'EUR');
    expect(() => m1.add(m2)).toThrow(/Currency mismatch/);
  });

  it('should format currencies according to decimal rules', () => {
    const usd = Money.fromDecimal('1234.567', 'USD');
    expect(usd.format()).toBe('USD 1234.57');

    const idr = Money.fromDecimal('500000', 'IDR');
    expect(idr.format()).toBe('IDR 500000');

    const kwd = Money.fromDecimal('12.3456', 'KWD');
    expect(kwd.format()).toBe('KWD 12.346');
  });

  it('should correctly identify currency decimal places', () => {
    expect(getCurrencyDecimals('IDR')).toBe(0);
    expect(getCurrencyDecimals('JPY')).toBe(0);
    expect(getCurrencyDecimals('USD')).toBe(2);
    expect(getCurrencyDecimals('KWD')).toBe(3);
  });
});
