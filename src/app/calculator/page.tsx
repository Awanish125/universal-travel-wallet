'use client';

import React, { useState } from 'react';
import { NegotiationCalculator } from '../../components/calculator/NegotiationCalculator';
import { CurrencySetupModal } from '../../components/calculator/CurrencySetupModal';

export default function StandaloneCalculatorPage() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [currencies, setCurrencies] = useState({ base: 'USD', target: 'IDR' });

  const handleSetupComplete = (base: string, target: string) => {
    setCurrencies({ base, target });
    setIsSetupComplete(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <CurrencySetupModal 
        isOpen={!isSetupComplete} 
        onComplete={handleSetupComplete} 
      />
      
      {isSetupComplete && (
        <NegotiationCalculator 
          baseCurrency={currencies.base} 
          targetCurrency={currencies.target} 
        />
      )}
    </main>
  );
}
