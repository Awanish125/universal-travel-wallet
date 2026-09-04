import { describe, it, expect } from 'vitest';
import { Money } from '../money';
import { convertAmount, calculateEffectiveRate } from '../conversion';

describe('Currency Conversion & Immutability', () => {
  it('should convert source currency to target currency using explicit rate', () => {
    const usd = Money.fromDecimal('100.00', 'USD');
    const eur = convertAmount(usd, 'EUR', '0.92');
    expect(eur.currency).toBe('EUR');
    expect(eur.toDecimalString()).toBe('92');
  });

  it('should round converted amounts according to target currency decimal rules', () => {
    const inr = Money.fromDecimal('1000.00', 'INR');
    // Converting INR to IDR (0 decimal currency)
    const idr = convertAmount(inr, 'IDR', '188.45');
    expect(idr.currency).toBe('IDR');
    expect(idr.toDecimalString()).toBe('188450');
  });

  it('should calculate effective exchange rate', () => {
    const rate = calculateEffectiveRate('100', '92.5');
    expect(rate).toBe('0.925');
  });
});
