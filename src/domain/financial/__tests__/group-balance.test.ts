import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { calculateGroupBalances, SharedExpenseInput, SettlementInput } from '../group-balance';

describe('Group Balance Engine', () => {
  it('should calculate net balances accurately for shared expenses (Rahul dinner example)', () => {
    // Rahul (user-1) pays ₹800 for 4 people (user-1, user-2, user-3, user-4)
    const expense: SharedExpenseInput = {
      id: 'exp-1',
      payerId: 'user-1',
      totalAmount: Money.fromDecimal('800', 'INR'),
      splits: [
        { participantId: 'user-1', amount: Money.fromDecimal('200', 'INR') },
        { participantId: 'user-2', amount: Money.fromDecimal('200', 'INR') },
        { participantId: 'user-3', amount: Money.fromDecimal('200', 'INR') },
        { participantId: 'user-4', amount: Money.fromDecimal('200', 'INR') },
      ],
    };

    const participants = ['user-1', 'user-2', 'user-3', 'user-4'];
    const balances = calculateGroupBalances('INR', participants, [expense]);

    // Payer user-1 paid 800, share 200 -> Net balance +600
    expect(balances['user-1'].netBalance.toDecimalString()).toBe('600');
    // Participant user-2 paid 0, share 200 -> Net balance -200
    expect(balances['user-2'].netBalance.toDecimalString()).toBe('-200');
    expect(balances['user-3'].netBalance.toDecimalString()).toBe('-200');
    expect(balances['user-4'].netBalance.toDecimalString()).toBe('-200');
  });

  it('should adjust net balances when settlements occur', () => {
    const expense: SharedExpenseInput = {
      id: 'exp-1',
      payerId: 'user-1',
      totalAmount: Money.fromDecimal('800', 'INR'),
      splits: [
        { participantId: 'user-1', amount: Money.fromDecimal('400', 'INR') },
        { participantId: 'user-2', amount: Money.fromDecimal('400', 'INR') },
      ],
    };

    // Settlement: user-2 pays user-1 ₹400
    const settlement: SettlementInput = {
      payerId: 'user-2',
      receiverId: 'user-1',
      amount: Money.fromDecimal('400', 'INR'),
    };

    const balances = calculateGroupBalances('INR', ['user-1', 'user-2'], [expense], [settlement]);

    expect(balances['user-1'].netBalance.toDecimalString()).toBe('0');
    expect(balances['user-2'].netBalance.toDecimalString()).toBe('0');
  });
});
