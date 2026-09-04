import { describe, it, expect } from 'vitest';
import { NegotiationCalculatorService } from '../negotiation-calculator';
import { Money } from '../../financial/money';

describe('NegotiationCalculatorService', () => {
  describe('applyDiscount', () => {
    it('applies 0% discount correctly', () => {
      const price = Money.fromDecimal('1000', 'IDR');
      const discounted = NegotiationCalculatorService.applyDiscount(price, 0);
      expect(discounted.toDecimalString()).toBe('1000');
    });

    it('applies 20% discount correctly', () => {
      const price = Money.fromDecimal('500000', 'IDR');
      const discounted = NegotiationCalculatorService.applyDiscount(price, 20);
      // 500,000 * 0.8 = 400,000
      expect(discounted.toDecimalString()).toBe('400000');
    });

    it('applies 100% discount correctly', () => {
      const price = Money.fromDecimal('1000', 'USD');
      const discounted = NegotiationCalculatorService.applyDiscount(price, 100);
      expect(discounted.toDecimalString()).toBe('0');
    });
  });

  describe('parseInput', () => {
    it('parses K shorthand correctly', () => {
      const parsed = NegotiationCalculatorService.parseInput('150K', 'IDR');
      expect(parsed.toDecimalString()).toBe('150000');
    });

    it('parses M shorthand correctly', () => {
      const parsed = NegotiationCalculatorService.parseInput('1.5M', 'IDR');
      expect(parsed.toDecimalString()).toBe('1500000');
    });

    it('parses standard numbers', () => {
      const parsed = NegotiationCalculatorService.parseInput('2500', 'USD');
      expect(parsed.toDecimalString()).toBe('2500');
    });
  });

  describe('calculateDiscountPercentage', () => {
    it('calculates integer percentage drop', () => {
      const orig = Money.fromDecimal('1000', 'USD');
      const offer = Money.fromDecimal('800', 'USD');
      expect(NegotiationCalculatorService.calculateDiscountPercentage(orig, offer)).toBe(20);
    });

    it('returns 0 if offer is higher than original', () => {
      const orig = Money.fromDecimal('1000', 'USD');
      const offer = Money.fromDecimal('1200', 'USD');
      expect(NegotiationCalculatorService.calculateDiscountPercentage(orig, offer)).toBe(0);
    });
  });
});
