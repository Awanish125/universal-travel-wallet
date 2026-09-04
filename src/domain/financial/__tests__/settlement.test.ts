import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { calculateSettlementComparison, calculatePartialSettlement } from '../settlement';

describe('Settlement Calculation Engine', () => {
  it('should compare cross-app settlement inputs correctly (Point 20 example)', () => {
    // Rahul enters Awanish amount: ₹1,200 (user-1)
    // Awanish enters Rahul amount: ₹2,000 (user-2)
    const userAmount = Money.fromDecimal('1200', 'INR');
    const otherAmount = Money.fromDecimal('2000', 'INR');

    const result = calculateSettlementComparison(userAmount, otherAmount, 'rahul', 'awanish');

    expect(result.directionLabel).toBe('YOU_PAY');
    expect(result.finalSettlementAmount.toDecimalString()).toBe('800');
    expect(result.debtorId).toBe('rahul');
    expect(result.creditorId).toBe('awanish');
  });

  it('should handle partial settlement calculations accurately', () => {
    const originalBalance = Money.fromDecimal('1000', 'INR');
    const partialPayment = Money.fromDecimal('400', 'INR');

    const result = calculatePartialSettlement(originalBalance, partialPayment);

    expect(result.isFullySettled).toBe(false);
    expect(result.remainingBalance.toDecimalString()).toBe('600');
    expect(result.settledAmount.toDecimalString()).toBe('400');
  });

  it('should mark fully settled when payment meets or exceeds balance', () => {
    const originalBalance = Money.fromDecimal('1000', 'INR');
    const fullPayment = Money.fromDecimal('1000', 'INR');

    const result = calculatePartialSettlement(originalBalance, fullPayment);

    expect(result.isFullySettled).toBe(true);
    expect(result.remainingBalance.toDecimalString()).toBe('0');
  });
});
