export interface RateCacheEntry {
  id: string; // Key: `${base}_${target}`
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  provider: string;
  timestamp: number; // Date.now() timestamp
}

export interface ExchangeRateProvider {
  readonly id: string;
  readonly name: string;
  fetchRates(baseCurrency: string): Promise<Record<string, number>>;
}
