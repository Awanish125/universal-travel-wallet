import { Money } from '../financial/money';
import { SplitMethod } from '../financial/splits';

export interface ExpenseSplitShare {
  participantId: string;
  amount: Money;
  percentage?: number;
}

export interface ExpenseProps {
  id: string;
  tripId: string;
  payerId: string;
  originalAmount: Money;
  baseAmount: Money;
  exchangeRate: string;
  category: string;
  paymentMethod: string;
  walletId?: string;
  isShared: boolean;
  splitMethod: SplitMethod;
  splits: ExpenseSplitShare[];
  note?: string;
  imageUrl?: string;
  date: string;
  createdAt: string;
}

export class Expense {
  readonly id: string;
  readonly tripId: string;
  readonly payerId: string;
  readonly originalAmount: Money;
  readonly baseAmount: Money;
  readonly exchangeRate: string;
  readonly category: string;
  readonly paymentMethod: string;
  readonly walletId?: string;
  readonly isShared: boolean;
  readonly splitMethod: SplitMethod;
  readonly splits: ExpenseSplitShare[];
  readonly note?: string;
  readonly imageUrl?: string;
  readonly date: string;
  readonly createdAt: string;

  constructor(props: ExpenseProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.payerId = props.payerId;
    this.originalAmount = props.originalAmount;
    this.baseAmount = props.baseAmount;
    this.exchangeRate = props.exchangeRate;
    this.category = props.category;
    this.paymentMethod = props.paymentMethod;
    this.walletId = props.walletId;
    this.isShared = props.isShared;
    this.splitMethod = props.splitMethod;
    this.splits = props.splits;
    this.note = props.note;
    this.imageUrl = props.imageUrl;
    this.date = props.date;
    this.createdAt = props.createdAt;
  }
}
