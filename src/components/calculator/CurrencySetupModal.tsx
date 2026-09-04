import React, { useState } from 'react';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { CurrencySelect } from '../common/CurrencySelect';

interface CurrencySetupModalProps {
  isOpen: boolean;
  onComplete: (base: string, target: string) => void;
}

export function CurrencySetupModal({ isOpen, onComplete }: CurrencySetupModalProps) {
  const [base, setBase] = useState('USD');
  const [target, setTarget] = useState('INR');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <SoftCard className="w-full max-w-sm p-6 text-center shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-2">Setup Calculator</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Choose your currencies to start negotiating.
        </p>

        <div className="space-y-4 text-left">
          <CurrencySelect 
            label="Base Currency"
            value={base}
            onChange={setBase}
          />
          
          <CurrencySelect 
            label="Target Currency"
            value={target}
            onChange={setTarget}
          />
        </div>

        <SoftButton 
          variant="primary"
          className="w-full py-3 mt-8 bg-brand-accent shadow-soft-accent font-bold"
          onClick={() => onComplete(base, target)}
        >
          Start Negotiating
        </SoftButton>
      </SoftCard>
    </div>
  );
}
