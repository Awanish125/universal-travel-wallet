import { Expense } from '../entities/expense';
import { Settlement } from '../entities/settlement';
import { Money } from '../financial/money';
import BigNumber from 'bignumber.js';

export interface ParticipantBalance {
  participantId: string;
  totalPaid: Money;
  totalConsumed: Money;
  netBalance: Money; // Positive = Should receive money. Negative = Owes money.
}

export interface Debt {
  fromId: string; // the person who owes
  toId: string; // the person who is owed
  amount: Money; // amount owed in base currency
}

export class BalanceEngine {
  /**
   * Calculates the net balances of all participants in the trip's base currency,
   * factoring in both Expenses and previous Settlements.
   */
  static calculateBalances(
    tripId: string,
    baseCurrency: string,
    participants: string[],
    expenses: Expense[],
    settlements: Settlement[]
  ): ParticipantBalance[] {
    
    // Track raw numbers for precision
    const paidMap = new Map<string, BigNumber>();
    const consumedMap = new Map<string, BigNumber>();

    // Initialize all participants to 0
    for (const pId of participants) {
      paidMap.set(pId, new BigNumber(0));
      consumedMap.set(pId, new BigNumber(0));
    }

    // 1. Process Expenses
    for (const exp of expenses) {
      // Ensure we only process expenses for this trip
      if (exp.tripId !== tripId) continue;

      const payerId = exp.payerId;
      if (!paidMap.has(payerId)) paidMap.set(payerId, new BigNumber(0));
      
      // Credit the payer the base amount they paid
      paidMap.set(payerId, paidMap.get(payerId)!.plus(exp.baseAmount.rawAmount));

      // Debit consumers
      if (exp.isShared && exp.splits) {
        for (const split of exp.splits) {
          // Note: The split amount saved in the database is in the *original* currency of the expense!
          // We must convert it to base currency using the expense's exchange rate.
          const splitAmountInBase = split.amount.rawAmount.times(new BigNumber(exp.exchangeRate));
          
          if (!consumedMap.has(split.participantId)) {
            consumedMap.set(split.participantId, new BigNumber(0));
          }
          consumedMap.set(split.participantId, consumedMap.get(split.participantId)!.plus(splitAmountInBase));
        }
      } else {
        // If not shared, the payer consumed 100% of it
        if (!consumedMap.has(payerId)) consumedMap.set(payerId, new BigNumber(0));
        consumedMap.set(payerId, consumedMap.get(payerId)!.plus(exp.baseAmount.rawAmount));
      }
    }

    // 2. Process Settlements
    // A settlement is someone paying off their debt.
    // Payer (debtor) gives money to Receiver (creditor).
    // Effectively, Payer "paid" more, Receiver "consumed" more.
    for (const stl of settlements) {
      if (stl.tripId !== tripId) continue;
      
      const pId = stl.payerId;
      const rId = stl.receiverId;
      
      if (!paidMap.has(pId)) paidMap.set(pId, new BigNumber(0));
      if (!consumedMap.has(rId)) consumedMap.set(rId, new BigNumber(0));

      paidMap.set(pId, paidMap.get(pId)!.plus(stl.baseAmount.rawAmount));
      consumedMap.set(rId, consumedMap.get(rId)!.plus(stl.baseAmount.rawAmount));
    }

    // 3. Compile final ParticipantBalance objects
    const results: ParticipantBalance[] = [];
    for (const pId of participants) {
      const totalPaid = paidMap.get(pId) || new BigNumber(0);
      const totalConsumed = consumedMap.get(pId) || new BigNumber(0);
      const netBalance = totalPaid.minus(totalConsumed);

      results.push({
        participantId: pId,
        totalPaid: Money.fromDecimal(totalPaid.toString(), baseCurrency),
        totalConsumed: Money.fromDecimal(totalConsumed.toString(), baseCurrency),
        netBalance: Money.fromDecimal(netBalance.toString(), baseCurrency),
      });
    }

    return results;
  }

  /**
   * Calculates the simplified settlement debts (who owes whom) using a greedy algorithm.
   */
  static simplifyDebts(balances: ParticipantBalance[], baseCurrency: string): Debt[] {
    // Separate into debtors and creditors
    const debtors = balances.filter(b => b.netBalance.isNegative())
      .map(b => ({ id: b.participantId, amount: b.netBalance.rawAmount.abs() }))
      .sort((a, b) => b.amount.minus(a.amount).toNumber()); // Largest debtors first

    const creditors = balances.filter(b => b.netBalance.isGreaterThan(Money.zero(baseCurrency)))
      .map(b => ({ id: b.participantId, amount: b.netBalance.rawAmount }))
      .sort((a, b) => b.amount.minus(a.amount).toNumber()); // Largest creditors first

    const debts: Debt[] = [];
    let i = 0; // debtors index
    let j = 0; // creditors index

    // Rounding threshold to avoid 0.01 cent floating debt loops
    const THRESHOLD = new BigNumber(0.01);

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const settleAmount = BigNumber.minimum(debtor.amount, creditor.amount);

      if (settleAmount.isGreaterThan(THRESHOLD)) {
        debts.push({
          fromId: debtor.id,
          toId: creditor.id,
          amount: Money.fromDecimal(settleAmount.toString(), baseCurrency)
        });
      }

      debtor.amount = debtor.amount.minus(settleAmount);
      creditor.amount = creditor.amount.minus(settleAmount);

      if (debtor.amount.isLessThanOrEqualTo(THRESHOLD)) i++;
      if (creditor.amount.isLessThanOrEqualTo(THRESHOLD)) j++;
    }

    return debts;
  }
}
