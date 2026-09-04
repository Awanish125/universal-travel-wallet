import { Settlement } from '../../domain/entities/settlement';
import { SettlementRecord } from '../db/dexie-db';
import { Money } from '../../domain/financial/money';

export class SettlementMapper {
  static toDomain(record: SettlementRecord): Settlement {
    return new Settlement({
      id: record.id,
      tripId: record.tripId,
      payerId: record.payerId,
      receiverId: record.receiverId,
      amount: Money.fromDecimal(record.amount, record.currency),
      baseAmount: Money.fromDecimal(record.baseAmount, record.baseCurrency),
      exchangeRate: record.exchangeRate,
      paymentMethod: record.paymentMethod,
      walletId: record.walletId,
      isPartial: record.isPartial,
      originalBalance: Money.fromDecimal(record.originalBalance, record.baseCurrency),
      settledAmount: Money.fromDecimal(record.settledAmount, record.baseCurrency),
      remainingBalance: Money.fromDecimal(record.remainingBalance, record.baseCurrency),
      note: record.note,
      date: record.date,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(settlement: Settlement): SettlementRecord {
    return {
      id: settlement.id,
      tripId: settlement.tripId,
      payerId: settlement.payerId,
      receiverId: settlement.receiverId,
      amount: settlement.amount.toDecimalString(),
      currency: settlement.amount.currency,
      baseAmount: settlement.baseAmount.toDecimalString(),
      baseCurrency: settlement.baseAmount.currency,
      exchangeRate: settlement.exchangeRate,
      paymentMethod: settlement.paymentMethod,
      walletId: settlement.walletId,
      isPartial: settlement.isPartial,
      originalBalance: settlement.originalBalance.toDecimalString(),
      settledAmount: settlement.settledAmount.toDecimalString(),
      remainingBalance: settlement.remainingBalance.toDecimalString(),
      note: settlement.note,
      date: settlement.date,
      createdAt: settlement.createdAt,
    };
  }
}
