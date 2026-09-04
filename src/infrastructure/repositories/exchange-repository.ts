import { Exchange } from '../../domain/entities/exchange';
import { db } from '../db/dexie-db';
import { ExchangeMapper } from '../mappers/exchange-mapper';
import { WalletMapper } from '../mappers/wallet-mapper';

export class ExchangeRepository {
  /**
   * Saves an Exchange record atomically updating connected wallets and logging wallet movements.
   */
  async save(exchange: Exchange): Promise<void> {
    const record = ExchangeMapper.toPersistence(exchange);

    await db.transaction('rw', db.exchanges, db.wallets, db.walletMovements, async () => {
      // 1. Save Exchange record
      await db.exchanges.put(record);

      // 2. Process Given Wallet (Deduct Balance)
      if (exchange.givenWalletId) {
        const givenWalletRecord = await db.wallets.get(exchange.givenWalletId);
        if (givenWalletRecord) {
          const givenWallet = WalletMapper.toDomain(givenWalletRecord);
          if (givenWallet.balance.currency !== exchange.givenAmount.currency) {
            throw new Error(`Currency mismatch for given wallet: ${givenWallet.balance.currency} vs ${exchange.givenAmount.currency}`);
          }
          const newGivenBalance = givenWallet.balance.subtract(exchange.givenAmount);
          givenWalletRecord.balance = newGivenBalance.toDecimalString();
          await db.wallets.put(givenWalletRecord);

          // Log movement
          await db.walletMovements.put({
            id: crypto.randomUUID(),
            tripId: exchange.tripId,
            walletId: givenWallet.id,
            amount: exchange.givenAmount.toDecimalString(),
            currency: exchange.givenAmount.currency,
            type: 'EXCHANGE_OUT',
            referenceType: 'EXCHANGE',
            referenceId: exchange.id,
            date: exchange.date,
            note: exchange.note ? `Exchange Out: ${exchange.note}` : 'Currency Exchange Out',
          });
        }
      }

      // 3. Process Received Wallet (Add Balance)
      if (exchange.receivedWalletId) {
        const receivedWalletRecord = await db.wallets.get(exchange.receivedWalletId);
        if (receivedWalletRecord) {
          const receivedWallet = WalletMapper.toDomain(receivedWalletRecord);
          if (receivedWallet.balance.currency !== exchange.receivedAmount.currency) {
            throw new Error(`Currency mismatch for received wallet: ${receivedWallet.balance.currency} vs ${exchange.receivedAmount.currency}`);
          }
          const newReceivedBalance = receivedWallet.balance.add(exchange.receivedAmount);
          receivedWalletRecord.balance = newReceivedBalance.toDecimalString();
          await db.wallets.put(receivedWalletRecord);

          // Log movement
          await db.walletMovements.put({
            id: crypto.randomUUID(),
            tripId: exchange.tripId,
            walletId: receivedWallet.id,
            amount: exchange.receivedAmount.toDecimalString(),
            currency: exchange.receivedAmount.currency,
            type: 'EXCHANGE_IN',
            referenceType: 'EXCHANGE',
            referenceId: exchange.id,
            date: exchange.date,
            note: exchange.note ? `Exchange In: ${exchange.note}` : 'Currency Exchange In',
          });
        }
      }
    });
  }

  async findByTripId(tripId: string): Promise<Exchange[]> {
    const records = await db.exchanges
      .where('tripId')
      .equals(tripId)
      .reverse()
      .sortBy('date');

    return records.map(ExchangeMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.exchanges, db.wallets, db.walletMovements, async () => {
      const record = await db.exchanges.get(id);
      if (!record) return;

      const exchange = ExchangeMapper.toDomain(record);

      // Restore Given Wallet (Add back)
      if (exchange.givenWalletId) {
        const givenWalletRecord = await db.wallets.get(exchange.givenWalletId);
        if (givenWalletRecord) {
          const givenWallet = WalletMapper.toDomain(givenWalletRecord);
          const restoredBalance = givenWallet.balance.add(exchange.givenAmount);
          givenWalletRecord.balance = restoredBalance.toDecimalString();
          await db.wallets.put(givenWalletRecord);
        }
      }

      // Restore Received Wallet (Deduct back)
      if (exchange.receivedWalletId) {
        const receivedWalletRecord = await db.wallets.get(exchange.receivedWalletId);
        if (receivedWalletRecord) {
          const receivedWallet = WalletMapper.toDomain(receivedWalletRecord);
          const restoredBalance = receivedWallet.balance.subtract(exchange.receivedAmount);
          receivedWalletRecord.balance = restoredBalance.toDecimalString();
          await db.wallets.put(receivedWalletRecord);
        }
      }

      // Delete wallet movements
      await db.walletMovements.where('referenceId').equals(id).delete();
      // Delete exchange
      await db.exchanges.delete(id);
    });
  }
}

export const exchangeRepository = new ExchangeRepository();
