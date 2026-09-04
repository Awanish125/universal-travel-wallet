import { ExchangeRateProvider } from '../../domain/services/rate-provider';

export class OpenCurrencyProvider implements ExchangeRateProvider {
  readonly id = 'fawazahmed0-cdn';
  readonly name = 'Open Currency API (Fawaz Ahmed)';

  /**
   * Fetches exchange rates using the free public API from @fawazahmed0/currency-api.
   * This CDN-based API provides daily updated rates for 150+ fiat currencies.
   * Endpoint: https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/{base}.json
   */
  async fetchRates(baseCurrency: string): Promise<Record<string, number>> {
    const baseCode = baseCurrency.toLowerCase();

    try {
      const response = await fetch(
        `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${baseCode}.json`
      );

      if (!response.ok) {
        throw new Error(`OpenCurrencyProvider HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Response format: { date: "...", [baseCode]: { targetCode: rate, ... } }
      const rates = data[baseCode];
      
      if (!rates) {
        throw new Error(`OpenCurrencyProvider: Rates not found for ${baseCode}`);
      }

      // Convert all target codes to uppercase to match domain standard
      const upperRates: Record<string, number> = {};
      for (const [key, value] of Object.entries(rates)) {
        upperRates[key.toUpperCase()] = value as number;
      }

      return upperRates;
    } catch (error) {
      console.error('OpenCurrencyProvider fetch failed:', error);
      throw error;
    }
  }
}
