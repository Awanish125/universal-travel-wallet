import { ExchangeRateProvider } from '../../domain/services/rate-provider';
import { db } from '../db/dexie-db';

export class CompositeRateManager {
  private primaryProvider: ExchangeRateProvider;

  constructor(primaryProvider: ExchangeRateProvider) {
    this.primaryProvider = primaryProvider;
  }

  /**
   * Fetches exchange rate for a given pair.
   * Strategy:
   * 1. Check IndexedDB rateCache for fresh rate (< 24 hours).
   * 2. If missing or stale, try primary online rate provider.
   * 3. On success, store in IndexedDB rateCache.
   * 4. On failure or offline, fallback to existing stale rate in IndexedDB rateCache.
   * 5. If no cache exists, return 1.0 fallback without throwing or breaking app startup.
   */
  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if (from === to) return 1.0;

    const cacheKey = `${from}_${to}`;
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Check IndexedDB rate cache
    try {
      const cached = await db.rateCache.get(cacheKey);
      if (cached && now - cached.timestamp < ONE_DAY_MS) {
        return cached.rate;
      }
    } catch {
      // IndexedDB query error ignored in rate lookup
    }

    // Attempt online fetch from primary provider
    try {
      const rates = await this.primaryProvider.fetchRates(from);
      if (rates && typeof rates[to] === 'number') {
        const fetchedRate = rates[to];
        // Cache fetched rates in IndexedDB
        await db.rateCache.put({
          id: cacheKey,
          baseCurrency: from,
          targetCurrency: to,
          rate: fetchedRate,
          provider: this.primaryProvider.id,
          timestamp: now,
        });
        return fetchedRate;
      }
    } catch {
      // Network/Provider failure -> Failover to stale cache
    }

    // Stale Cache Fallback
    try {
      const stale = await db.rateCache.get(cacheKey);
      if (stale) return stale.rate;
    } catch {
      // Ignore
    }

    // Default fallback rate (No network, no cache)
    return 1.0;
  }
}
