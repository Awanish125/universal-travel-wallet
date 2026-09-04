import { Money } from './money';
import { roundToCurrencyDecimals } from './rounding';

export interface SettlementObligation {
  fromParticipantId: string;
  toParticipantId: string;
  amount: Money;
}

export interface SettlementComparisonResult {
  debtorId: string;
  creditorId: string;
  userEnteredAmount: Money;
  otherEnteredAmount: Money;
  difference: Money;
  finalSettlementAmount: Money;
  directionLabel: string; // 'YOU_PAY' | 'YOU_TAKE'
}

export interface PartialSettlementState {
  originalBalance: Money;
  settledAmount: Money;
  remainingBalance: Money;
  isFullySettled: boolean;
}

/**
 * Compares two cross-app settlement claims to determine final bilateral settlement amount.
 * 
 * Example (Point 20):
 * Rahul app says: Awanish pays Rahul ₹1,200.
 * Awanish app says: Rahul pays Awanish ₹2,000.
 * Result: Rahul takes ₹800 from Awanish (Awanish pays Rahul ₹800).
 */
export function calculateSettlementComparison(
  userAmount: Money,
  otherPersonAmount: Money,
  userId: string,
  otherPersonId: string
): SettlementComparisonResult {
  if (userAmount.currency !== otherPersonAmount.currency) {
    throw new Error('Settlement comparison amounts must be in the same currency');
  }

  // Net difference = otherPersonAmount - userAmount
  const diff = otherPersonAmount.subtract(userAmount);
  
  if (diff.isGreaterThan(Money.zero(userAmount.currency))) {
    // Other person claims user owes more than user claims -> User pays difference
    return {
      debtorId: userId,
      creditorId: otherPersonId,
      userEnteredAmount: userAmount,
      otherEnteredAmount: otherPersonAmount,
      difference: diff,
      finalSettlementAmount: diff,
      directionLabel: 'YOU_PAY',
    };
  } else {
    // User claims other person owes more -> User takes difference
    const positiveDiff = Money.zero(userAmount.currency).subtract(diff);
    return {
      debtorId: otherPersonId,
      creditorId: userId,
      userEnteredAmount: userAmount,
      otherEnteredAmount: otherPersonAmount,
      difference: positiveDiff,
      finalSettlementAmount: positiveDiff,
      directionLabel: 'YOU_TAKE',
    };
  }
}

/**
 * Calculates remaining balance after a partial settlement.
 */
export function calculatePartialSettlement(
  originalBalance: Money,
  settlementPayment: Money
): PartialSettlementState {
  const remaining = originalBalance.subtract(settlementPayment);
  const remainingRounded = roundToCurrencyDecimals(remaining);
  const isFullySettled = remainingRounded.isZero() || remainingRounded.isNegative();

  return {
    originalBalance,
    settledAmount: settlementPayment,
    remainingBalance: isFullySettled ? Money.zero(originalBalance.currency) : remainingRounded,
    isFullySettled,
  };
}
