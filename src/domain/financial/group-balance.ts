import { Money } from './money';

export interface SharedExpenseInput {
  id: string;
  payerId: string;
  totalAmount: Money;
  splits: { participantId: string; amount: Money }[];
}

export interface SettlementInput {
  payerId: string;
  receiverId: string;
  amount: Money;
}

export interface PersonBalance {
  participantId: string;
  totalPaid: Money;
  totalShare: Money;
  netBalance: Money; // Positive = Owed money (is creditor), Negative = Owes money (is debtor)
}

/**
 * Calculates net balance per participant across shared expenses and settlements.
 * Preserves the Non-Duplication Rule: Only the actual payer records the expense.
 */
export function calculateGroupBalances(
  currency: string,
  participantIds: string[],
  expenses: SharedExpenseInput[],
  settlements: SettlementInput[] = []
): Record<string, PersonBalance> {
  const zero = Money.zero(currency);
  const balances: Record<string, PersonBalance> = {};

  participantIds.forEach((id) => {
    balances[id] = {
      participantId: id,
      totalPaid: zero,
      totalShare: zero,
      netBalance: zero,
    };
  });

  // Process shared expenses
  expenses.forEach((expense) => {
    const payer = expense.payerId;
    if (balances[payer]) {
      balances[payer].totalPaid = balances[payer].totalPaid.add(expense.totalAmount);
    }

    expense.splits.forEach((split) => {
      const pid = split.participantId;
      if (balances[pid]) {
        balances[pid].totalShare = balances[pid].totalShare.add(split.amount);
      }
    });
  });

  // Process settlements (Payer paid Receiver -> Payer gets credited, Receiver gets debited)
  settlements.forEach((settlement) => {
    const pId = settlement.payerId;
    const rId = settlement.receiverId;

    if (balances[pId]) {
      balances[pId].totalPaid = balances[pId].totalPaid.add(settlement.amount);
    }
    if (balances[rId]) {
      balances[rId].totalShare = balances[rId].totalShare.add(settlement.amount);
    }
  });

  // Calculate final net balance: Net = TotalPaid - TotalShare
  Object.keys(balances).forEach((id) => {
    const b = balances[id];
    b.netBalance = b.totalPaid.subtract(b.totalShare);
  });

  return balances;
}
