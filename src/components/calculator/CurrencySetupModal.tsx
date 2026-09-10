'use client';

import React, { useEffect, useState } from 'react';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { CurrencySelect } from '../common/CurrencySelect';
import { CountrySelect } from '../common/CountrySelect';
import { getCurrencyForCountry } from '../../lib/countries';

interface CurrencySetupModalProps {
  isOpen: boolean;
  initialHome?: string;
  initialLocal?: string;
  onComplete: (home: string, local: string) => void;
  /** Closing on first run leaves the page — see the calculator route. */
  onClose: () => void;
}

/**
 * Asks the two questions the calculator needs, in the words a traveller uses:
 * where they are from and where they are. Picking the destination country fills
 * the local currency in, so the second currency is usually never touched.
 */
export function CurrencySetupModal({
  isOpen,
  initialHome = '',
  initialLocal = '',
  onComplete,
  onClose,
}: CurrencySetupModalProps) {
  const [home, setHome] = useState(initialHome);
  const [local, setLocal] = useState(initialLocal);
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setHome(initialHome);
    setLocal(initialLocal);
  }, [isOpen, initialHome, initialLocal]);

  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry);
    const currency = getCurrencyForCountry(nextCountry);
    if (currency) setLocal(currency);
  }

  const canContinue = home.length === 3 && local.length === 3;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Set up your calculator"
      description="Tell it once — it remembers for next time."
      footer={
        <SoftButton
          variant="primary"
          disabled={!canContinue}
          onClick={() => onComplete(home, local)}
          className="w-full py-4 text-base"
        >
          Start bargaining
        </SoftButton>
      }
    >
      <div className="space-y-4">
        <CurrencySelect
          label="Money you count in"
          hint="— your home money"
          value={home}
          onChange={setHome}
        />

        <CountrySelect
          label="Where are you shopping?"
          hint="— fills the local money in"
          value={country}
          onChange={handleCountryChange}
        />

        <CurrencySelect
          label="Money you'll pay with"
          hint="— the local money"
          value={local}
          onChange={setLocal}
        />
      </div>
    </Sheet>
  );
}
