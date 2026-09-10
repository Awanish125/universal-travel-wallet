import { describe, it, expect } from 'vitest';
import { Trip } from '../entities/trip';
import {
  COUNTRIES,
  getCountryByName,
  getCurrencyForCountry,
} from '../../lib/countries';
import { currencyBadge, currencySymbol, formatAmount } from '../../lib/currency-format';
import { Money } from '../financial/money';

function makeTrip(overrides: Partial<ConstructorParameters<typeof Trip>[0]> = {}): Trip {
  return new Trip({
    id: 't1',
    name: 'Bali',
    country: 'Indonesia',
    startDate: '2026-01-01',
    endDate: '2026-01-10',
    baseCurrency: 'inr',
    status: 'ACTIVE',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  });
}

describe('Trip currencies', () => {
  it('keeps the home and local currencies separate', () => {
    const trip = makeTrip({ localCurrency: 'idr' });
    expect(trip.baseCurrency).toBe('INR');
    expect(trip.localCurrency).toBe('IDR');
  });

  it('falls back to the home currency for trips saved before local currency existed', () => {
    const trip = makeTrip();
    expect(trip.localCurrency).toBe('INR');
  });
});

describe('Country to currency mapping', () => {
  it('derives the spending currency from the destination', () => {
    expect(getCurrencyForCountry('Indonesia')).toBe('IDR');
    expect(getCurrencyForCountry('India')).toBe('INR');
    expect(getCurrencyForCountry('Japan')).toBe('JPY');
  });

  it('accepts an ISO country code as well as a name', () => {
    expect(getCurrencyForCountry('ID')).toBe('IDR');
  });

  it('returns an empty string for something that is not a country', () => {
    expect(getCurrencyForCountry('Atlantis')).toBe('');
  });

  it('exposes a searchable list with flags', () => {
    expect(COUNTRIES.length).toBeGreaterThan(150);
    const indonesia = getCountryByName('Indonesia');
    expect(indonesia?.flag).toBeTruthy();
    expect(indonesia?.currencyCode).toBe('IDR');
  });
});

describe('Currency display', () => {
  it('shows the symbol for well-known currencies', () => {
    expect(currencySymbol('INR')).toBe('₹');
    expect(currencyBadge('INR')).toBe('₹ INR');
  });

  it('falls back to the code when a currency has no symbol of its own', () => {
    expect(currencyBadge('XXX')).toBe('XXX');
  });

  it('formats amounts with the currency\'s own decimal rule', () => {
    // IDR carries no minor unit, INR carries two.
    expect(formatAmount(500000, 'IDR')).toContain('500,000');
    expect(formatAmount(500000, 'IDR')).not.toContain('.00');
    expect(formatAmount(1234.5, 'INR')).toContain('1,234.50');
  });

  it('formats a Money value the same way', () => {
    const money = Money.fromDecimal('2950', 'INR');
    expect(formatAmount(money.toNumber(), money.currency)).toBe('₹2,950.00');
  });
});
