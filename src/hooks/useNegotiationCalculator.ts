import { useState, useEffect, useMemo, useCallback } from 'react';
import { Money } from '../domain/financial/money';
import { NegotiationCalculatorService } from '../domain/services/negotiation-calculator';
import { OpenCurrencyProvider } from '../infrastructure/rates/open-currency-provider';
import { CompositeRateManager } from '../infrastructure/rates/composite-manager';
import { formatCompactNumber } from '../domain/financial/shorthand';

// Use the new OpenCurrencyProvider which supports all world currencies
const rateManager = new CompositeRateManager(new OpenCurrencyProvider());

export function useNegotiationCalculator(
  initialBaseCurrency: string,
  initialTargetCurrency: string
) {
  const [baseCurrency, setBaseCurrency] = useState(initialBaseCurrency);
  const [targetCurrency, setTargetCurrency] = useState(initialTargetCurrency);
  
  // The raw string input by the user in whichever field they are typing
  const [inputStr, setInputStr] = useState('');
  
  // Which field is the user currently typing into? 'BASE' or 'TARGET'
  // Defaults to TARGET (e.g. IDR), since you usually type the foreign price first
  const [activeField, setActiveField] = useState<'BASE' | 'TARGET'>('TARGET');
  
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isFetchingRate, setIsFetchingRate] = useState(false);

  useEffect(() => {
    let active = true;
    async function fetchRate() {
      setIsFetchingRate(true);
      try {
        const rate = await rateManager.getRate(baseCurrency, targetCurrency);
        if (active) setExchangeRate(rate);
      } catch (error) {
        console.error('Failed to fetch rate:', error);
      } finally {
        if (active) setIsFetchingRate(false);
      }
    }
    fetchRate();
    return () => { active = false; };
  }, [baseCurrency, targetCurrency]);

  // Derived Values
  
  // 1. Determine the raw Money value of the currently active input
  const activeCurrency = activeField === 'BASE' ? baseCurrency : targetCurrency;
  const activePrice = useMemo(() => {
    return NegotiationCalculatorService.parseInput(inputStr, activeCurrency);
  }, [inputStr, activeCurrency]);

  // 2. Apply discount to the active price
  const activeDiscountedPrice = useMemo(() => {
    return NegotiationCalculatorService.applyDiscount(activePrice, discountPercentage);
  }, [activePrice, discountPercentage]);

  // 3. Convert that discounted price into the INACTIVE currency
  const inactiveCurrency = activeField === 'BASE' ? targetCurrency : baseCurrency;
  const convertedInactivePrice = useMemo(() => {
    const rateToUse = activeField === 'BASE' ? exchangeRate : (1 / exchangeRate);
    return NegotiationCalculatorService.convertToTargetCurrency(activeDiscountedPrice, inactiveCurrency, rateToUse);
  }, [activeDiscountedPrice, inactiveCurrency, activeField, exchangeRate]);

  // 4. Calculate savings in both currencies
  const activeSavings = useMemo(() => activePrice.subtract(activeDiscountedPrice), [activePrice, activeDiscountedPrice]);
  const inactiveSavings = useMemo(() => {
    const inactiveOriginal = NegotiationCalculatorService.convertToTargetCurrency(activePrice, inactiveCurrency, activeField === 'BASE' ? exchangeRate : (1 / exchangeRate));
    return inactiveOriginal.subtract(convertedInactivePrice);
  }, [activePrice, inactiveCurrency, activeField, exchangeRate, convertedInactivePrice]);

  // Exported formatted strings for the UI
  // Base Field
  const baseInputValue = activeField === 'BASE' ? inputStr : formatCompactNumber(convertedInactivePrice);
  const baseFullValue = activeField === 'BASE' ? activeDiscountedPrice : convertedInactivePrice;
  const baseSavings = activeField === 'BASE' ? activeSavings : inactiveSavings;

  // Target Field
  const targetInputValue = activeField === 'TARGET' ? inputStr : formatCompactNumber(convertedInactivePrice);
  const targetFullValue = activeField === 'TARGET' ? activeDiscountedPrice : convertedInactivePrice;
  const targetSavings = activeField === 'TARGET' ? activeSavings : inactiveSavings;

  // Actions
  const handleBaseChange = (val: string) => {
    setActiveField('BASE');
    setInputStr(val);
  };

  const handleTargetChange = (val: string) => {
    setActiveField('TARGET');
    setInputStr(val);
  };

  return {
    baseCurrency,
    setBaseCurrency,
    targetCurrency,
    setTargetCurrency,
    discountPercentage,
    setDiscountPercentage,
    exchangeRate,
    setExchangeRate,
    isFetchingRate,
    
    // UI bindings for Base Currency
    baseInputValue,
    baseFullValue,
    baseSavings,
    handleBaseChange,

    // UI bindings for Target Currency
    targetInputValue,
    targetFullValue,
    targetSavings,
    handleTargetChange,
  };
}
