'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { NegotiationCalculator } from '../../components/calculator/NegotiationCalculator';
import { CurrencySetupModal } from '../../components/calculator/CurrencySetupModal';
import { useCurrencyPreferences } from '../../hooks/useCurrencyPreferences';
import { db } from '../../infrastructure/db/dexie-db';

export default function StandaloneCalculatorPage() {
  const router = useRouter();
  const preferences = useCurrencyPreferences();
  const activeTrip = useLiveQuery(
    () => db.trips.orderBy('createdAt').reverse().filter((t) => t.status === 'ACTIVE').first(),
    []
  );
  const [currencies, setCurrencies] = useState<{ home: string; local: string } | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);

  // Reuse the currencies the user already chose on a trip or an earlier visit.
  // The setup sheet only appears the very first time, or when they ask for it.
  useEffect(() => {
    if (!preferences.isLoaded || currencies) return;
    if (preferences.home && preferences.local) {
      setCurrencies({ home: preferences.home, local: preferences.local });
    } else {
      setIsSetupOpen(true);
    }
  }, [preferences.isLoaded, preferences.home, preferences.local, currencies]);

  async function handleSetupComplete(home: string, local: string) {
    setCurrencies({ home, local });
    setIsSetupOpen(false);
    await preferences.remember({ home, local });
  }

  return (
    <main className="min-h-screen bg-background">
      <CurrencySetupModal
        isOpen={isSetupOpen}
        initialHome={currencies?.home || preferences.home}
        initialLocal={currencies?.local || preferences.local}
        onClose={() => {
          if (currencies) {
            setIsSetupOpen(false);
            return;
          }
          // Nothing is set up yet, so there is no calculator to fall back to —
          // leave the page instead of closing onto an empty screen.
          if (window.history.length > 1) router.back();
          else router.push('/trips');
        }}
        onComplete={handleSetupComplete}
      />

      {currencies && (
        <NegotiationCalculator
          baseCurrency={currencies.home}
          targetCurrency={currencies.local}
          onChangeCurrencies={() => setIsSetupOpen(true)}
          onCurrenciesSwapped={(home, local) => {
            setCurrencies({ home, local });
            void preferences.remember({ home, local });
          }}
          onAddToExpense={(finalPrice, currency) => {
            // Carries the negotiated price straight into the expense form of
            // the current trip (Point 40). Nothing is recorded until the user
            // saves it there.
            if (!activeTrip) {
              router.push('/trips/new');
              return;
            }
            const query = new URLSearchParams({
              amount: String(finalPrice),
              currency,
              category: 'cat-shopping',
            });
            router.push(`/trips/${activeTrip.id}/expense?${query.toString()}`);
          }}
        />
      )}

      {!currencies && !isSetupOpen && (
        <div className="flex min-h-screen items-center justify-center">
          <p className="animate-pulse text-muted-foreground">Loading calculator...</p>
        </div>
      )}
    </main>
  );
}
