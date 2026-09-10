export type TripStatus = 'ACTIVE' | 'FINISHED' | 'ARCHIVED';

export interface TripProps {
  id: string;
  name: string;
  country: string;
  startDate: string;
  endDate: string;
  /** Home currency — the money the traveller thinks in. */
  baseCurrency: string;
  /** Local currency — the money spent at the destination. */
  localCurrency?: string;
  additionalCurrencies?: string[];
  budget?: string;
  dailyBudget?: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
}

export class Trip {
  readonly id: string;
  readonly name: string;
  readonly country: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly baseCurrency: string;
  readonly localCurrency: string;
  readonly additionalCurrencies: string[];
  readonly budget?: string;
  readonly dailyBudget?: string;
  readonly status: TripStatus;
  readonly createdAt: string;
  readonly updatedAt: string;

  constructor(props: TripProps) {
    this.id = props.id;
    this.name = props.name;
    this.country = props.country;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.baseCurrency = props.baseCurrency.toUpperCase();
    // Falls back to the home currency so a trip always has a spending
    // currency, including trips created before this field existed.
    this.localCurrency = (props.localCurrency || props.baseCurrency).toUpperCase();
    this.additionalCurrencies = (props.additionalCurrencies || []).map((c) => c.toUpperCase());
    this.budget = props.budget;
    this.dailyBudget = props.dailyBudget;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
