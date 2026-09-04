import { ExchangeRateProvider } from '../../domain/services/rate-provider';

/**
 * Primary Online Exchange Rate Provider using Frankfurter API (ECB data).
 * Open source, free, CORS-enabled, no API key required.
 */
export class FrankfurterProvider implements ExchangeRateProvider {
  readonly id = 'frankfurter';
  readonly name = 'Frankfurter (European Central Bank)';

  async fetchRates(baseCurrency: string): Promise<Record<string, number>> {
    const base = baseCurrency.toUpperCase();
    const url = `https://api.frankfurter.app/latest?from=${base}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Frankfurter API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.rates) {
      throw new Error('Invalid rate payload from Frankfurter API');
    }

    // Frankfurter includes target rates, set base-to-base rate as 1.0
    const rates: Record<string, number> = {
      [base]: 1.0,
      ...data.rates,
    };

    return rates;
  }
}
