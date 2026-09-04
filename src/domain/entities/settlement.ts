import { Money } from '../financial/money';

export interface SettlementProps {
  id: string;
  tripId: string;
  payerId: string;
  receiverId: string;
  amount: Money;
  baseAmount: Money;
  exchangeRate: string;
  paymentMethod: string;
  walletId?: string;
  isPartial: boolean;
  originalBalance: Money;
  settledAmount: Money;
  remainingBalance: Money;
  note?: string;
  date: string;
  createdAt: string;
}

export class Settlement {
  readonly id: string;
  readonly tripId: string;
  readonly payerId: string;
  readonly receiverId: string;
  readonly amount: Money;
  readonly baseAmount: Money;
  readonly exchangeRate: string;
  readonly paymentMethod: string;
  readonly walletId?: string;
  readonly isPartial: boolean;
  readonly originalBalance: Money;
  readonly settledAmount: Money;
  readonly remainingBalance: Money;
  readonly note?: string;
  readonly date: string;
  readonly createdAt: string;

  constructor(props: SettlementProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.payerId = props.payerId;
    this.receiverId = props.receiverId;
    this.amount = props.amount;
    this.baseAmount = props.baseAmount;
    this.exchangeRate = props.exchangeRate;
    this.paymentMethod = props.paymentMethod;
    this.walletId = props.walletId;
    this.isPartial = props.isPartial;
    this.originalBalance = props.originalBalance;
    this.settledAmount = props.settledAmount;
    this.remainingBalance = props.remainingBalance;
    this.note = props.note;
    this.date = props.date;
    this.createdAt = props.createdAt;
  }
}
