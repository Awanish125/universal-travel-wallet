import { Money } from '../financial/money';

export type BudgetPeriod = 'TRIP' | 'DAILY';

export interface BudgetProps {
  id: string;
  tripId: string;
  categoryId: string; // 'OVERALL' or specific category ID
  amount: Money;
  period: BudgetPeriod;
}

export class Budget {
  readonly id: string;
  readonly tripId: string;
  readonly categoryId: string;
  readonly amount: Money;
  readonly period: BudgetPeriod;

  constructor(props: BudgetProps) {
    this.id = props.id;
    this.tripId = props.tripId;
    this.categoryId = props.categoryId;
    this.amount = props.amount;
    this.period = props.period;
  }
}
