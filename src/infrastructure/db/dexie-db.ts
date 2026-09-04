import Dexie, { Table } from 'dexie';

export interface TripRecord {
  id: string;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  baseCurrency: string;
  additionalCurrencies?: string[];
  budget?: string;
  dailyBudget?: string;
  status: 'ACTIVE' | 'FINISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantRecord {
  id: string;
  tripId: string;
  name: string;
  avatar?: string;
  isUser: boolean;
  createdAt: string;
}

export interface CurrencyRecord {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
  flag?: string;
  isCustom: boolean;
}

export interface ExpenseSplitRecord {
  participantId: string;
  amount: string; // Serialized Money decimal string
  percentage?: number;
}

export interface ExpenseRecord {
  id: string;
  tripId: string;
  payerId: string;
  amount: string; // Serialized original Money string
  originalCurrency: string;
  baseCurrency: string;
  exchangeRate: string; // Captured rate snapshot
  baseAmount: string; // Serialized base Money string
  category: string;
  paymentMethod: string;
  walletId?: string;
  isShared: boolean;
  splitMethod: 'EQUAL' | 'PERCENTAGE' | 'CUSTOM';
  splits: ExpenseSplitRecord[];
  note?: string;
  imageUrl?: string;
  date: string;
  createdAt: string;
}

export interface WalletRecord {
  id: string;
  tripId: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CARD' | 'UPI' | 'OTHER';
  currency: string;
  balance: string; // Serialized Money string
  createdAt: string;
}

export interface WalletMovementRecord {
  id: string;
  tripId: string;
  walletId: string;
  amount: string;
  currency: string;
  type: 'EXPENSE' | 'EXCHANGE_OUT' | 'EXCHANGE_IN' | 'SETTLEMENT_OUT' | 'SETTLEMENT_IN' | 'ADJUSTMENT';
  referenceType: string;
  referenceId: string;
  date: string;
  note?: string;
}

export interface ExchangeRecord {
  id: string;
  tripId: string;
  givenWalletId?: string;
  givenAmount: string;
  givenCurrency: string;
  receivedWalletId?: string;
  receivedAmount: string;
  receivedCurrency: string;
  actualRate: string;
  marketRate: string;
  difference: string;
  gainLoss: string;
  fee: string;
  date: string;
  location?: string;
  provider?: string;
  note?: string;
}

export interface SettlementRecord {
  id: string;
  tripId: string;
  payerId: string;
  receiverId: string;
  amount: string;
  currency: string;
  baseAmount: string;
  baseCurrency: string;
  exchangeRate: string;
  paymentMethod: string;
  walletId?: string;
  isPartial: boolean;
  originalBalance: string;
  settledAmount: string;
  remainingBalance: string;
  note?: string;
  date: string;
  createdAt: string;
}

export interface BudgetRecord {
  id: string;
  tripId: string;
  categoryId: string;
  amount: string;
  period: 'TRIP' | 'DAILY';
}

export interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom: boolean;
  gradientRole?: string;
}

export interface NegotiationRecord {
  id: string;
  tripId: string;
  originalPrice: string;
  finalPrice: string;
  currency: string;
  baseCurrency: string;
  exchangeRate: string;
  discountPercentage: number;
  amountSaved: string;
  baseAmountSaved: string;
  date: string;
  note?: string;
  category?: string;
}

export interface RateCacheRecord {
  id: string; // Key: `${base}_${target}`
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  provider: string;
  timestamp: number;
}

export interface SettingRecord {
  key: string;
  value: string;
}

export class TravelWalletDexieDB extends Dexie {
  trips!: Table<TripRecord, string>;
  participants!: Table<ParticipantRecord, string>;
  currencies!: Table<CurrencyRecord, string>;
  expenses!: Table<ExpenseRecord, string>;
  wallets!: Table<WalletRecord, string>;
  walletMovements!: Table<WalletMovementRecord, string>;
  exchanges!: Table<ExchangeRecord, string>;
  settlements!: Table<SettlementRecord, string>;
  budgets!: Table<BudgetRecord, string>;
  categories!: Table<CategoryRecord, string>;
  negotiations!: Table<NegotiationRecord, string>;
  rateCache!: Table<RateCacheRecord, string>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('TravelWalletDB');
    this.version(1).stores({
      trips: 'id, name, status, createdAt',
      participants: 'id, tripId, name',
      currencies: 'code, name',
      expenses: 'id, tripId, payerId, category, date, createdAt',
      wallets: 'id, tripId, type, currency',
      walletMovements: 'id, tripId, walletId, referenceType, referenceId, date',
      exchanges: 'id, tripId, givenWalletId, receivedWalletId, date',
      settlements: 'id, tripId, payerId, receiverId, date',
      budgets: 'id, tripId, categoryId',
      categories: 'id, name, isCustom',
      negotiations: 'id, tripId, date',
      rateCache: 'id, baseCurrency, targetCurrency, timestamp',
      settings: 'key',
    });
  }
}

export const db = new TravelWalletDexieDB();
