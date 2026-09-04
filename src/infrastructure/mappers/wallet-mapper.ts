import { Wallet, WalletProps } from '../../domain/entities/wallet';
import { WalletRecord } from '../db/dexie-db';
import { Money } from '../../domain/financial/money';

export class WalletMapper {
  static toDomain(record: WalletRecord): Wallet {
    const props: WalletProps = {
      id: record.id,
      tripId: record.tripId,
      name: record.name,
      type: record.type,
      currency: record.currency,
      balance: Money.fromDecimal(record.balance, record.currency),
      createdAt: record.createdAt,
    };
    return new Wallet(props);
  }

  static toPersistence(wallet: Wallet): WalletRecord {
    return {
      id: wallet.id,
      tripId: wallet.tripId,
      name: wallet.name,
      type: wallet.type,
      currency: wallet.currency,
      balance: wallet.balance.toDecimalString(),
      createdAt: wallet.createdAt,
    };
  }
}
