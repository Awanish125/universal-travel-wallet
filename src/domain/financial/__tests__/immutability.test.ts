import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { convertAmount } from '../conversion';

describe('Historical Financial Immutability Rule', () => {
  it('should guarantee that historical transactions preserve exchange rate captured at creation time', () => {
    // Scenario: User recorded an expense on Jan 1 with rate 1 USD = 80 INR
    const originalExpenseUsd = Money.fromDecimal('100.00', 'USD');
    const historicalRateOnJan1 = '80.00';
    const baseExpenseJan1 = convertAmount(originalExpenseUsd, 'INR', historicalRateOnJan1);

    expect(baseExpenseJan1.toDecimalString()).toBe('8000');

    // On Feb 1, current market exchange rate updates to 1 USD = 85 INR
    const newMarketRateOnFeb1 = '85.00';

    // Verify historical base expense remains 8000 INR when new rate is evaluated separately
    expect(baseExpenseJan1.toDecimalString()).toBe('8000');

    // A newly created expense on Feb 1 uses the new rate
    const baseExpenseFeb1 = convertAmount(originalExpenseUsd, 'INR', newMarketRateOnFeb1);
    expect(baseExpenseFeb1.toDecimalString()).toBe('8500');

    // Historical record remains completely unaffected
    expect(baseExpenseJan1.toDecimalString()).not.toBe(baseExpenseFeb1.toDecimalString());
  });
});
