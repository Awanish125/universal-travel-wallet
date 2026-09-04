import { Money } from '../financial/money';
import { parseShorthandAmount } from '../financial/shorthand';
import { convertAmount } from '../financial/conversion';

export class NegotiationCalculatorService {
  /**
   * Applies a percentage discount to a given price.
   * @param price The original price.
   * @param discountPercentage The percentage to subtract (e.g., 20 for 20%).
   * @returns The new discounted price.
   */
  static applyDiscount(price: Money, discountPercentage: number): Money {
    if (discountPercentage === 0) return price;
    if (discountPercentage >= 100) return Money.zero(price.currency);
    
    // factor = 1 - (discount / 100)
    // Avoid precision issues by doing: price * (100 - discount) / 100
    const remainingPercentage = 100 - discountPercentage;
    return price.multiply(remainingPercentage).divide(100);
  }

  /**
   * Parses shorthand input into a Money object.
   * @param input The shorthand string (e.g., '1.5M', '500K').
   * @param currency The currency code.
   * @returns The Money object representing the parsed value.
   */
  static parseInput(input: string, currency: string): Money {
    const rawValue = parseShorthandAmount(input);
    return Money.fromDecimal(rawValue, currency);
  }

  /**
   * Calculates the discount percentage between an original price and an offer.
   * Returns a rounded integer percentage.
   */
  static calculateDiscountPercentage(originalPrice: Money, offerPrice: Money): number {
    if (originalPrice.isZero()) return 0;
    if (offerPrice.isGreaterThan(originalPrice)) return 0;

    const diff = originalPrice.subtract(offerPrice);
    const percentage = diff.rawAmount.dividedBy(originalPrice.rawAmount).multipliedBy(100);
    return Math.round(percentage.toNumber());
  }

  /**
   * Converts an offer or price to another currency using a given exchange rate.
   */
  static convertToTargetCurrency(
    amount: Money, 
    targetCurrency: string, 
    rate: number
  ): Money {
    if (amount.currency === targetCurrency) return amount;
    return convertAmount(amount, targetCurrency, rate);
  }
}
