import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { calculateEqualSplits, calculatePercentageSplits } from '../splits';

describe('Expense Splitting Engine', () => {
  it('should calculate equal splits and distribute remainder fractions to payer', () => {
    // 10.00 USD split 3 ways -> 3.33 + 3.33 + 3.33 = 9.99, remainder 0.01 assigned to payer ('user-1')
    const total = Money.fromDecimal('10.00', 'USD');
    const participants = ['user-1', 'user-2', 'user-3'];
    const splits = calculateEqualSplits(total, participants, 'user-1');

    expect(splits).toHaveLength(3);
    expect(splits[0].amount.toDecimalString()).toBe('3.34');
    expect(splits[1].amount.toDecimalString()).toBe('3.33');
    expect(splits[2].amount.toDecimalString()).toBe('3.33');

    // Verify sum exacts total
    const sum = splits[0].amount.add(splits[1].amount).add(splits[2].amount);
    expect(sum.equals(total)).toBe(true);
  });

  it('should calculate percentage splits correctly', () => {
    const total = Money.fromDecimal('100.00', 'INR');
    const percentages = { 'user-1': 50, 'user-2': 30, 'user-3': 20 };
    const splits = calculatePercentageSplits(total, percentages);

    expect(splits[0].amount.toDecimalString()).toBe('50');
    expect(splits[1].amount.toDecimalString()).toBe('30');
    expect(splits[2].amount.toDecimalString()).toBe('20');
  });

  it('should throw if percentages do not sum to 100%', () => {
    const total = Money.fromDecimal('100.00', 'INR');
    const percentages = { 'user-1': 50, 'user-2': 30 };
    expect(() => calculatePercentageSplits(total, percentages)).toThrow(/Percentages must sum to 100%/);
  });
});
