import { db } from '../db/dexie-db';

/**
 * Keys stored in the `settings` table. Keeping them in one place stops
 * stringly-typed keys from drifting apart across screens.
 */
export const SETTING_KEYS = {
  /** Last home currency the user chose anywhere in the app. */
  homeCurrency: 'preferred.homeCurrency',
  /** Last local/spending currency the user chose anywhere in the app. */
  localCurrency: 'preferred.localCurrency',
  /** Last country the user said they were travelling to. */
  homeCountry: 'preferred.homeCountry',
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export class SettingsRepository {
  async get(key: SettingKey): Promise<string | null> {
    const record = await db.settings.get(key);
    return record?.value ?? null;
  }

  async set(key: SettingKey, value: string): Promise<void> {
    await db.settings.put({ key, value });
  }

  /**
   * Remembers the currencies the user just picked so every later screen can
   * preselect them instead of asking again (Point 0: no re-entering what the
   * app already knows).
   */
  async rememberCurrencies(input: {
    home?: string;
    local?: string;
  }): Promise<void> {
    if (input.home) await this.set(SETTING_KEYS.homeCurrency, input.home.toUpperCase());
    if (input.local) await this.set(SETTING_KEYS.localCurrency, input.local.toUpperCase());
  }
}

export const settingsRepository = new SettingsRepository();
