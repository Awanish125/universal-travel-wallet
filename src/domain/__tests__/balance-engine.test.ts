import { describe, it, expect } from 'vitest';
import { BalanceEngine } from '../../domain/services/balance-engine';
import { Expense, ExpenseSplitShare } from '../../domain/entities/expense';
import { Settlement } from '../../domain/entities/settlement';
import { Money } from '../../domain/financial/money';

describe('BalanceEngine', () => {
  it('correctly calculates who owes whom', () => {
    // Setup
    const participants = ['A', 'B', 'C'];
    const baseCurrency = 'USD';

    // A paid 300 total (100 each for A, B, C)
    const splits: ExpenseSplitShare[] = [
      { participantId: 'A', amount: Money.fromDecimal('100', 'USD'), percentage: 33.34 },
      { participantId: 'B', amount: Money.fromDecimal('100', 'USD'), percentage: 33.33 },
      { participantId: 'C', amount: Money.fromDecimal('100', 'USD'), percentage: 33.33 },
    ];

    const exp1 = new Expense({
      id: 'e1',
      tripId: 't1',
      payerId: 'A',
      originalAmount: Money.fromDecimal('300', 'USD'),
      baseAmount: Money.fromDecimal('300', 'USD'),
      exchangeRate: '1',
      category: 'food',
      paymentMethod: 'CASH',
      isShared: true,
      splitMethod: 'EQUAL',
      splits,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    const balances = BalanceEngine.calculateBalances('t1', baseCurrency, participants, [exp1], []);
    
    // A should have +200 net balance (Paid 300, consumed 100)
    // B should have -100 net balance (Paid 0, consumed 100)
    // C should have -100 net balance
    
    const balA = balances.find(b => b.participantId === 'A');
    const balB = balances.find(b => b.participantId === 'B');
    const balC = balances.find(b => b.participantId === 'C');

    expect(balA?.netBalance.toDecimalString()).toBe('200');
    expect(balB?.netBalance.toDecimalString()).toBe('-100');
    expect(balC?.netBalance.toDecimalString()).toBe('-100');

    // Debts simplify
    const debts = BalanceEngine.simplifyDebts(balances, baseCurrency);
    
    expect(debts).toHaveLength(2);
    // B owes A 100, C owes A 100 (order depends on sort, but both owe A 100)
    expect(debts.find(d => d.fromId === 'B')?.toId).toBe('A');
    expect(debts.find(d => d.fromId === 'B')?.amount.toDecimalString()).toBe('100');
    expect(debts.find(d => d.fromId === 'C')?.toId).toBe('A');
    expect(debts.find(d => d.fromId === 'C')?.amount.toDecimalString()).toBe('100');
  });

  it('factors in previous settlements', () => {
    const participants = ['A', 'B'];
    const baseCurrency = 'USD';

    // A paid 100 total (50 each for A, B)
    const exp1 = new Expense({
      id: 'e1', tripId: 't1', payerId: 'A',
      originalAmount: Money.fromDecimal('100', 'USD'),
      baseAmount: Money.fromDecimal('100', 'USD'),
      exchangeRate: '1', category: 'food', paymentMethod: 'CASH',
      isShared: true, splitMethod: 'EQUAL',
      splits: [
        { participantId: 'A', amount: Money.fromDecimal('50', 'USD') },
        { participantId: 'B', amount: Money.fromDecimal('50', 'USD') }
      ],
      date: new Date().toISOString(), createdAt: new Date().toISOString()
    });

    // B settles 20 back to A
    const set1 = new Settlement({
      id: 's1', tripId: 't1', payerId: 'B', receiverId: 'A',
      amount: Money.fromDecimal('20', 'USD'), baseAmount: Money.fromDecimal('20', 'USD'),
      exchangeRate: '1', paymentMethod: 'CASH', isPartial: true,
      originalBalance: Money.fromDecimal('50', 'USD'), settledAmount: Money.fromDecimal('20', 'USD'),
      remainingBalance: Money.fromDecimal('30', 'USD'),
      date: new Date().toISOString(), createdAt: new Date().toISOString()
    });

    const balances = BalanceEngine.calculateBalances('t1', baseCurrency, participants, [exp1], [set1]);
    
    // A: Paid 100, Consumed 50 = +50. But B settled 20 to A (A 'consumed' 20). So +30
    // B: Paid 0, Consumed 50 = -50. But B settled 20 to A (B 'paid' 20). So -30
    
    expect(balances.find(b => b.participantId === 'A')?.netBalance.toDecimalString()).toBe('30');
    expect(balances.find(b => b.participantId === 'B')?.netBalance.toDecimalString()).toBe('-30');
    
    const debts = BalanceEngine.simplifyDebts(balances, baseCurrency);
    expect(debts).toHaveLength(1);
    expect(debts[0].fromId).toBe('B');
    expect(debts[0].toId).toBe('A');
    expect(debts[0].amount.toDecimalString()).toBe('30');
  });
});
