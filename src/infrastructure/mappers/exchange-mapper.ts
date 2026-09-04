import { Exchange } from '../../domain/entities/exchange';
import { ExchangeRecord } from '../db/dexie-db';
import { Money } from '../../domain/financial/money';

export class ExchangeMapper {
  static toDomain(record: ExchangeRecord): Exchange {
    return new Exchange({
      id: record.id,
      tripId: record.tripId,
      givenWalletId: record.givenWalletId,
      givenAmount: Money.fromDecimal(record.givenAmount, record.givenCurrency),
      receivedWalletId: record.receivedWalletId,
      receivedAmount: Money.fromDecimal(record.receivedAmount, record.receivedCurrency),
      actualRate: record.actualRate,
      marketRate: record.marketRate,
      difference: Money.fromDecimal(record.difference, record.receivedCurrency),
      gainLoss: Money.fromDecimal(record.gainLoss, record.receivedCurrency),
      fee: Money.fromDecimal(record.fee, record.givenCurrency),
      date: record.date,
      location: record.location,
      provider: record.provider,
      note: record.note,
    });
  }

  static toPersistence(exchange: Exchange): ExchangeRecord {
    return {
      id: exchange.id,
      tripId: exchange.tripId,
      givenWalletId: exchange.givenWalletId,
      givenAmount: exchange.givenAmount.toDecimalString(),
      givenCurrency: exchange.givenAmount.currency,
      receivedWalletId: exchange.receivedWalletId,
      receivedAmount: exchange.receivedAmount.toDecimalString(),
      receivedCurrency: exchange.receivedAmount.currency,
      actualRate: exchange.actualRate,
      marketRate: exchange.marketRate,
      difference: exchange.difference.toDecimalString(),
      gainLoss: exchange.gainLoss.toDecimalString(),
      fee: exchange.fee.toDecimalString(),
      date: exchange.date,
      location: exchange.location,
      provider: exchange.provider,
      note: exchange.note,
    };
  }
}
