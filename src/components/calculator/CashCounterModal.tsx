'use client';

import React, { useState } from 'react';
import { X, Calculator, Plus, Minus, CheckCircle } from 'lucide-react';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';

interface Props {
  targetCurrency: string;
  requiredAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

// Standard denomination bill presets (customizable by user)
const DEFAULT_DENOMINATIONS = [100000, 50000, 20000, 10000, 5000, 2000, 1000];

export function CashCounterModal({ targetCurrency, requiredAmount, isOpen, onClose }: Props) {
  const [counts, setCounts] = useState<Record<number, number>>({});

  if (!isOpen) return null;

  const handleIncrement = (denom: number) => {
    setCounts(prev => ({ ...prev, [denom]: (prev[denom] || 0) + 1 }));
  };

  const handleDecrement = (denom: number) => {
    setCounts(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) - 1) }));
  };

  const resetCounts = () => setCounts({});

  // Calculations
  const countedTotal = Object.entries(counts).reduce(
    (sum, [denom, count]) => sum + Number(denom) * count,
    0
  );

  const difference = countedTotal - requiredAmount;
  const isExact = Math.abs(difference) < 1;
  const isExtra = difference > 0;
  const isShort = difference < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <SoftCard className="w-full sm:max-w-md max-h-[90vh] flex flex-col p-6 rounded-t-3xl sm:rounded-3xl animate-in slide-in-from-bottom-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand-accent" />
            <h2 className="text-xl font-bold text-foreground">Cash Counter</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-muted rounded-full text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Required vs Counted Summary */}
        <div className="p-4 bg-muted/40 rounded-2xl mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Target Price:</span>
            <span className="font-bold text-foreground">{requiredAmount.toLocaleString()} {targetCurrency}</span>
          </div>

          <div className="flex justify-between text-base font-black text-foreground">
            <span>Counted Cash:</span>
            <span className="text-brand-accent">{countedTotal.toLocaleString()} {targetCurrency}</span>
          </div>

          {/* Difference Status */}
          {countedTotal > 0 && (
            <div className={`pt-2 border-t border-border/40 flex justify-between items-center text-xs font-bold ${
              isExact ? 'text-emerald-500' : isExtra ? 'text-blue-500' : 'text-destructive'
            }`}>
              <span className="flex items-center gap-1">
                {isExact ? <CheckCircle className="w-4 h-4"/> : isExtra ? 'Extra Change:' : 'Short By:'}
              </span>
              <span className="text-sm font-black">
                {Math.abs(difference).toLocaleString()} {targetCurrency}
              </span>
            </div>
          )}
        </div>

        {/* Denomination Counter List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
          {DEFAULT_DENOMINATIONS.map(denom => {
            const count = counts[denom] || 0;
            return (
              <div key={denom} className="flex items-center justify-between p-3 bg-background border border-border/60 rounded-xl">
                <div>
                  <span className="text-sm font-black text-foreground block">
                    {denom >= 1000 ? `${denom / 1000}K` : denom}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    = {(denom * count).toLocaleString()} {targetCurrency}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleDecrement(denom)}
                    disabled={count === 0}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-foreground disabled:opacity-30 hover:bg-surface-strong"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-foreground">{count}</span>
                  <button 
                    onClick={() => handleIncrement(denom)}
                    className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/40">
          <SoftButton variant="secondary" onClick={resetCounts} className="flex-1 py-3 text-xs font-bold">
            Reset
          </SoftButton>
          <SoftButton variant="primary" onClick={onClose} className="flex-1 py-3 text-xs font-bold bg-brand-accent">
            Done
          </SoftButton>
        </div>

      </SoftCard>
    </div>
  );
}
