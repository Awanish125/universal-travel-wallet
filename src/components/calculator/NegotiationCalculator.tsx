'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, Edit2, Plus, Banknote } from 'lucide-react';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { useNegotiationCalculator } from '../../hooks/useNegotiationCalculator';
import { formatFullNumber, formatCompactNumber } from '../../domain/financial/shorthand';
import { CashCounterModal } from './CashCounterModal';
import { motion } from 'framer-motion';

import { ThemeToggle } from '../common/ThemeToggle';

interface Props {
  baseCurrency: string;
  targetCurrency: string;
}

export function NegotiationCalculator({ baseCurrency, targetCurrency }: Props) {
  const calc = useNegotiationCalculator(baseCurrency, targetCurrency);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [manualRateInput, setManualRateInput] = useState('');

  const discountOpts = [10, 20, 25, 30, 40, 50];

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(manualRateInput);
    if (!isNaN(parsed) && parsed > 0) {
      calc.setExchangeRate(parsed);
      setIsEditingRate(false);
    }
  };

  const beginRateEdit = () => {
    setManualRateInput(calc.exchangeRate.toString());
    setIsEditingRate(true);
  };

  const swapCurrencies = () => {
    // Keep the rate consistent conceptually, but swap base/target
    const newBase = calc.targetCurrency;
    const newTarget = calc.baseCurrency;
    calc.setBaseCurrency(newBase);
    calc.setTargetCurrency(newTarget);
  };

  const [isCashCounterOpen, setIsCashCounterOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <CashCounterModal 
        targetCurrency={calc.targetCurrency} 
        requiredAmount={calc.targetFullValue.toNumber()} 
        isOpen={isCashCounterOpen} 
        onClose={() => setIsCashCounterOpen(false)} 
      />

      {/* Header with Rate Display */}
      <header className="p-4 flex flex-col gap-3 bg-background/90 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-extrabold tracking-tight">Calculator</h1>
          <ThemeToggle />
        </div>
        
        {isEditingRate ? (
          <form onSubmit={handleRateSubmit} className="flex gap-2 items-center bg-surface-strong border border-border/50 p-2 rounded-xl">
            <span className="text-sm font-medium pl-2">1 {calc.baseCurrency} =</span>
            <input 
              autoFocus
              type="number"
              step="any"
              value={manualRateInput}
              onChange={e => setManualRateInput(e.target.value)}
              className="bg-background border border-border rounded-md px-2 py-1 w-24 text-sm outline-none focus:border-brand-accent text-foreground"
            />
            <span className="text-sm font-medium">{calc.targetCurrency}</span>
            <SoftButton type="submit" variant="primary" className="py-1 px-3 text-xs ml-auto">Save</SoftButton>
          </form>
        ) : (
          <div 
            onClick={beginRateEdit}
            className="text-sm font-medium px-4 py-3 bg-muted/50 border border-border/50 rounded-xl cursor-pointer hover:bg-muted transition-colors flex items-center justify-between"
          >
            <span>
              {calc.isFetchingRate ? 'Updating live rates...' : `Rate: 1 ${calc.baseCurrency} = ${calc.exchangeRate.toFixed(2)} ${calc.targetCurrency}`}
            </span>
            <Edit2 className="w-3.5 h-3.5 opacity-50" />
          </div>
        )}
      </header>

      {/* Main Display Area */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full flex flex-col space-y-4">
        
        {/* Currencies Grid (Side-by-side on Desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          
          {/* Target Currency (e.g. Foreign Currency IDR) */}
          <SoftCard className="p-5 relative overflow-hidden flex flex-col gap-1 border border-border hover:border-brand-accent/30 transition-colors focus-within:border-brand-accent/50 focus-within:ring-2 focus-within:ring-brand-accent/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                {calc.targetCurrency} (Foreign)
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. 200K"
              value={calc.targetInputValue}
              onChange={(e) => calc.handleTargetChange(e.target.value)}
              className="w-full bg-transparent text-4xl font-black tracking-tighter outline-none text-foreground placeholder:text-muted-foreground/30"
            />
            <div className="text-sm font-medium text-muted-foreground mt-1">
              = {formatFullNumber(calc.targetFullValue)}
            </div>
          </SoftCard>

          {/* Swap Button (Absolute center on desktop, stacked on mobile) */}
          <div className="flex justify-center md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 -my-2 md:my-0 relative z-20">
            <SoftButton 
              variant="ghost" 
              onClick={swapCurrencies}
              className="rounded-full w-10 h-10 flex items-center justify-center bg-background border border-border shadow-md text-foreground hover:bg-surface-strong"
            >
              <ArrowRightLeft className="w-4 h-4 md:rotate-0 rotate-90" />
            </SoftButton>
          </div>

          {/* Base Currency (e.g. Home Currency INR) */}
          <SoftCard className="p-5 relative overflow-hidden flex flex-col gap-1 border border-border hover:border-brand-accent/30 transition-colors focus-within:border-brand-accent/50 focus-within:ring-2 focus-within:ring-brand-accent/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-brand-accent uppercase tracking-wider">
                {calc.baseCurrency} (Home)
              </span>
            </div>
            <input
              type="text"
              placeholder="e.g. 300"
              value={calc.baseInputValue}
              onChange={(e) => calc.handleBaseChange(e.target.value)}
              className="w-full bg-transparent text-4xl font-black tracking-tighter outline-none text-foreground placeholder:text-muted-foreground/30 text-brand-accent"
            />
            <div className="text-sm font-medium text-muted-foreground mt-1">
              = {formatFullNumber(calc.baseFullValue)}
            </div>
          </SoftCard>

        </div>

        {/* Discount Section */}
        {calc.discountPercentage > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex justify-between items-center mt-2"
          >
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Discount Applied (-{calc.discountPercentage}%)</p>
              <p className="text-emerald-700 dark:text-emerald-300 font-medium text-xs">
                Saved {formatCompactNumber(calc.baseSavings)} {calc.baseCurrency}
              </p>
            </div>
          </motion.div>
        )}

        {/* Discount Quick Buttons */}
        <div className="pt-2">
          <p className="text-sm font-bold text-foreground mb-3 px-1 uppercase tracking-wider">Quick Discount</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <SoftButton 
              variant={calc.discountPercentage === 0 ? 'primary' : 'secondary'}
              onClick={() => calc.setDiscountPercentage(0)}
              className="whitespace-nowrap px-5 py-3 rounded-xl text-sm font-bold"
            >
              None
            </SoftButton>
            {discountOpts.map(d => (
              <SoftButton
                key={d}
                variant={calc.discountPercentage === d ? 'primary' : 'secondary'}
                onClick={() => calc.setDiscountPercentage(d)}
                className="whitespace-nowrap px-5 py-3 rounded-xl text-sm font-bold"
              >
                -{d}%
              </SoftButton>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-background border-t border-border/50 pb-8">
        <div className="max-w-4xl mx-auto flex gap-3">
          <SoftButton 
            variant="secondary"
            className="flex-1 py-4 flex items-center justify-center gap-2"
            onClick={() => setIsCashCounterOpen(true)}
          >
            <Banknote className="w-5 h-5 text-foreground" />
            <span className="font-bold text-base text-foreground">Count Cash</span>
          </SoftButton>

          <SoftButton 
            variant="primary"
            className="flex-[2] py-4 shadow-soft-accent flex items-center justify-center gap-2 bg-brand-accent hover:bg-brand-accent/90"
            onClick={() => alert("Expense adding will be supported when linked to a trip.")}
          >
            <Plus className="w-5 h-5 text-white" />
            <span className="font-bold text-base text-white">Add to Expense</span>
          </SoftButton>
        </div>
      </div>
    </div>
  );
}
