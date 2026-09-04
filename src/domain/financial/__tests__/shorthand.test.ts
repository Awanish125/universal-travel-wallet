import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { parseShorthandAmount, formatCompactNumber, formatFullNumber } from '../shorthand';

describe('Shorthand Parser & Formatter', () => {
  it('should parse shopkeeper shorthand inputs', () => {
    expect(parseShorthandAmount('1K')).toBe('1000');
    expect(parseShorthandAmount('10K')).toBe('10000');
    expect(parseShorthandAmount('100K')).toBe('100000');
    expect(parseShorthandAmount('500K')).toBe('500000');
    expect(parseShorthandAmount('1M')).toBe('1000000');
    expect(parseShorthandAmount('1.5M')).toBe('1500000');
    expect(parseShorthandAmount('250')).toBe('250');
  });

  it('should format numbers into compact shorthand string', () => {
    expect(formatCompactNumber(Money.fromDecimal('500000', 'IDR'))).toBe('500K');
    expect(formatCompactNumber(Money.fromDecimal('1500000', 'IDR'))).toBe('1.5M');
    expect(formatCompactNumber(Money.fromDecimal('1000', 'USD'))).toBe('1K');
  });

  it('should format numbers into localized full string', () => {
    const money = Money.fromDecimal('500000', 'IDR');
    expect(formatFullNumber(money)).toBe('500,000');
  });
});
