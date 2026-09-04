import { Money } from './money';
import { roundToCurrencyDecimals } from './rounding';

export interface ExchangeRecordPerformance {
  actualRate: string;
  marketRate: string;
  expectedReceivedAmount: Money;
  actualReceivedAmount: Money;
  difference: Money; // actualReceived - expectedReceived
  gainLoss: Money; // Positive = Gain, Negative = Loss
  percentageDifference: number;
}

export interface OverallExchangeStats {
  totalGivenAmount: Money;
  totalReceivedAmount: Money;
  averageActualRate: string;
  averageMarketRate: string;
  totalGainLoss: Money;
  totalFees: Money;
  bestRate: string;
  worstRate: string;
}

/**
 * Calculates exchange performance metrics for a single exchange transaction.
 */
export function calculateExchangePerformance(
  givenAmount: Money,
  receivedAmount: Money,
  marketRate: number | string,
  fee: Money
): ExchangeRecordPerformance {
  const actualRateStr = receivedAmount.divide(givenAmount.toDecimalString()).toDecimalString();
  const marketRateStr = String(marketRate);

  // Expected amount at market rate
  const expectedMoney = givenAmount.multiply(marketRateStr);
  const expectedReceived = roundToCurrencyDecimals(Money.fromDecimal(expectedMoney.toDecimalString(), receivedAmount.currency));

  // Difference = Received - Expected
  const difference = receivedAmount.subtract(expectedReceived);
  const gainLoss = difference.subtract(fee);

  const pctDiff = expectedReceived.isZero() 
    ? 0 
    : Number(difference.divide(expectedReceived.toDecimalString()).multiply(100).toDecimalString());

  return {
    actualRate: actualRateStr,
    marketRate: marketRateStr,
    expectedReceivedAmount: expectedReceived,
    actualReceivedAmount: receivedAmount,
    difference,
    gainLoss,
    percentageDifference: Number(pctDiff.toFixed(2)),
  };
}
