'use client';

import React from 'react';
import { SoftButton } from '../common/SoftButton';

interface Props {
  currency: string;
  onAddAmount: (amountToAdd: number) => void;
}

// Preset chips based on common travel note values
const CHIPS = [100000, 50000, 20000, 10000, 5000, 1000, 100, 50, 10, 5, 1];

export function BillChipsInput({ currency, onAddAmount }: Props) {
  // Choose sensible bill chips depending on whether the currency is high-denomination (IDR/VND/JPY) or normal (USD/EUR/INR)
  const isHighDenom = ['IDR', 'VND', 'KRW', 'JPY', 'CLP'].includes(currency.toUpperCase());
  const selectedChips = isHighDenom 
    ? [100000, 50000, 20000, 10000, 5000]
    : [100, 50, 20, 10, 5];

  return (
    <div className="pt-2">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
        Quick Bill Addition (+ {currency})
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {selectedChips.map(chip => (
          <SoftButton
            key={chip}
            type="button"
            variant="secondary"
            onClick={() => onAddAmount(chip)}
            className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-black shrink-0"
          >
            +{chip >= 1000 ? `${chip / 1000}K` : chip}
          </SoftButton>
        ))}
      </div>
    </div>
  );
}
