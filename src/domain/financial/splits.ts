import { Money } from './money';
import { roundToCurrencyDecimals } from './rounding';

export interface SplitResult {
  participantId: string;
  amount: Money;
  percentage?: number;
}

export type SplitMethod = 'EQUAL' | 'PERCENTAGE' | 'CUSTOM';

/**
 * Calculates equal split shares among participants.
 * Guarantees that the sum of individual split shares EXACTLY equals total expense amount,
 * distributing any rounding fraction (e.g. 1 cent/rupiah) to the payer or primary participant.
 */
export function calculateEqualSplits(
  totalAmount: Money,
  participantIds: string[],
  payerId?: string
): SplitResult[] {
  if (participantIds.length === 0) return [];

  const count = participantIds.length;
  const rawShare = totalAmount.divide(count);
  const roundedShare = roundToCurrencyDecimals(rawShare);

  // Sum up base rounded shares
  let totalDistributed = Money.zero(totalAmount.currency);
  const results: SplitResult[] = participantIds.map((id) => {
    totalDistributed = totalDistributed.add(roundedShare);
    return {
      participantId: id,
      amount: roundedShare,
      percentage: Number((100 / count).toFixed(2)),
    };
  });

  // Calculate remainder difference (e.g. Total 10.00 / 3 = 3.33 each -> Total 9.99, Diff = 0.01)
  const remainder = totalAmount.subtract(totalDistributed);
  if (!remainder.isZero()) {
    // Assign remainder to payer if in participant list, otherwise first participant
    const primaryIndex = payerId && participantIds.includes(payerId) 
      ? participantIds.indexOf(payerId) 
      : 0;
    
    results[primaryIndex].amount = results[primaryIndex].amount.add(remainder);
  }

  return results;
}

/**
 * Calculates percentage split shares among participants.
 * Percentages must sum to 100.
 */
export function calculatePercentageSplits(
  totalAmount: Money,
  participantPercentages: Record<string, number>
): SplitResult[] {
  const entries = Object.entries(participantPercentages);
  if (entries.length === 0) return [];

  let totalPercentage = 0;
  entries.forEach(([, pct]) => { totalPercentage += pct; });

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error(`Percentages must sum to 100%. Total was ${totalPercentage}%`);
  }

  let totalDistributed = Money.zero(totalAmount.currency);
  const results: SplitResult[] = entries.map(([id, pct]) => {
    const rawAmount = totalAmount.multiply(pct).divide(100);
    const roundedAmount = roundToCurrencyDecimals(rawAmount);
    totalDistributed = totalDistributed.add(roundedAmount);

    return {
      participantId: id,
      amount: roundedAmount,
      percentage: pct,
    };
  });

  const remainder = totalAmount.subtract(totalDistributed);
  if (!remainder.isZero() && results.length > 0) {
    results[0].amount = results[0].amount.add(remainder);
  }

  return results;
}
