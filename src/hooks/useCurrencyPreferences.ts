'use client';

import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../infrastructure/db/dexie-db';
import {
  SETTING_KEYS,
  settingsRepository,
} from '../infrastructure/repositories/settings-repository';

export interface CurrencyPreferences {
  /** Remembered home currency, or an empty string before the first choice. */
  home: string;
  /** Remembered local/spending currency, or an empty string. */
  local: string;
  /** False until the stored preferences have been read. */
  isLoaded: boolean;
  remember: (input: { home?: string; local?: string }) => Promise<void>;
}

/**
 * Reads and writes the globally remembered currency choices.
 *
 * Once a user picks a home currency anywhere — a trip, the calculator — every
 * other screen preselects it, so the same question is never asked twice.
 */
export function useCurrencyPreferences(): CurrencyPreferences {
  const stored = useLiveQuery(
    () => db.settings.bulkGet([SETTING_KEYS.homeCurrency, SETTING_KEYS.localCurrency]),
    []
  );

  const remember = useCallback(
    (input: { home?: string; local?: string }) =>
      settingsRepository.rememberCurrencies(input),
    []
  );

  return {
    home: stored?.[0]?.value ?? '',
    local: stored?.[1]?.value ?? '',
    isLoaded: stored !== undefined,
    remember,
  };
}
