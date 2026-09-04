import { Money } from '../financial/money';

export interface ExchangeProps {
  id: string;
  tripId: string;
  givenWalletId?: string;
  givenAmount: Money;
  receivedWalletId?: string;
  receivedAmount: Money;
  actualRate: string;
  marketRate: string;
  difference: Money;
  gainLoss: Money;
  fee: Money;
  date: string;
  location?: string;
  provider?: string;
  note?: string;
}

export class Exchange {
  readonly id: string;
  readonly tripId: string;
  readonly givenWalletId?: string;
  readonly givenAmount: Money;
  readonly receivedWalletId?: string;
  readonly receivedAmount: Money;
  readonly actualRate: string;
  readonly marketRate: string;
  readonly difference: Money;
  readonly gainLoss: Money;
  readonly fee: Money;
  readonly date: string;
  readonly location?: string;
  readonly provider?: string;
  readonly note?: string;

  constructor(props: ExchangeProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.givenWalletId = props.givenWalletId;
    this.givenAmount = props.givenAmount;
    this.receivedWalletId = props.receivedWalletId;
    this.receivedAmount = props.receivedAmount;
    this.actualRate = props.actualRate;
    this.marketRate = props.marketRate;
    this.difference = props.difference;
    this.gainLoss = props.gainLoss;
    this.fee = props.fee;
    this.date = props.date;
    this.location = props.location;
    this.provider = props.provider;
    this.note = props.note;
  }
}
