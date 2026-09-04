import { Money } from '../financial/money';

export type WalletType = 'CASH' | 'BANK' | 'CARD' | 'UPI' | 'OTHER';

export interface WalletProps {
  id: string;
  tripId: string;
  name: string;
  type: WalletType;
  currency: string;
  balance: Money;
  createdAt: string;
}

export class Wallet {
  readonly id: string;
  readonly tripId: string;
  readonly name: string;
  readonly type: WalletType;
  readonly currency: string;
  readonly balance: Money;
  readonly createdAt: string;

  constructor(props: WalletProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.name = props.name;
    this.type = props.type;
    this.currency = props.currency.toUpperCase();
    this.balance = props.balance;
    this.createdAt = props.createdAt;
  }
}

export type WalletMovementType = 
  | 'EXPENSE' 
  | 'EXCHANGE_OUT' 
  | 'EXCHANGE_IN' 
  | 'SETTLEMENT_OUT' 
  | 'SETTLEMENT_IN' 
  | 'ADJUSTMENT';

export interface WalletMovementProps {
  id: string;
  tripId: string;
  walletId: string;
  amount: Money;
  type: WalletMovementType;
  referenceType: string;
  referenceId: string;
  date: string;
  note?: string;
}

export class WalletMovement {
  readonly id: string;
  readonly tripId: string;
  readonly walletId: string;
  readonly amount: Money;
  readonly type: WalletMovementType;
  readonly referenceType: string;
  readonly referenceId: string;
  readonly date: string;
  readonly note?: string;

  constructor(props: WalletMovementProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.walletId = props.walletId;
    this.amount = props.amount;
    this.type = props.type;
    this.referenceType = props.referenceType;
    this.referenceId = props.referenceId;
    this.date = props.date;
    this.note = props.note;
  }
}
