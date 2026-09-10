import { Wallet } from '../../domain/entities/wallet';
import { Money } from '../../domain/financial/money';
import { db } from '../db/dexie-db';
import { WalletMapper } from '../mappers/wallet-mapper';
import { newId } from '../../lib/id';

export class WalletRepository {
  /**
   * Saves a Wallet to the database (create or update).
   */
  async save(wallet: Wallet): Promise<void> {
    const record = WalletMapper.toPersistence(wallet);
    await db.wallets.put(record);
  }

  /**
   * Adds (or, with a negative amount, removes) money directly against a
   * wallet's balance — the "Adjust balance" action of Point 9. Unlike an
   * exchange or expense, this has no counterpart transaction: it is the
   * traveller correcting or topping up a wallet by hand (found cash,
   * an ATM withdrawal never logged elsewhere, a counting mistake). Logged as
   * an `ADJUSTMENT` wallet movement so it still shows in wallet history.
   */
  async adjustBalance(walletId: string, delta: Money, note?: string): Promise<void> {
    await db.transaction('rw', db.wallets, db.walletMovements, async () => {
      const record = await db.wallets.get(walletId);
      if (!record) throw new Error('Wallet not found');

      const wallet = WalletMapper.toDomain(record);
      const updated = wallet.balance.add(delta);
      record.balance = updated.toDecimalString();
      await db.wallets.put(record);

      await db.walletMovements.put({
        id: newId(),
        tripId: wallet.tripId,
        walletId: wallet.id,
        amount: delta.toDecimalString(),
        currency: delta.currency,
        type: 'ADJUSTMENT',
        referenceType: 'ADJUSTMENT',
        referenceId: wallet.id,
        date: new Date().toISOString(),
        note,
      });
    });
  }

  /**
   * Finds a Wallet by ID.
   */
  async findById(id: string): Promise<Wallet | null> {
    const record = await db.wallets.get(id);
    if (!record) return null;
    return WalletMapper.toDomain(record);
  }

  /**
   * Retrieves all Wallets for a specific Trip.
   */
  async findByTripId(tripId: string): Promise<Wallet[]> {
    const records = await db.wallets
      .where('tripId')
      .equals(tripId)
      .toArray();
    
    return records.map(WalletMapper.toDomain);
  }

  /**
   * Deletes a Wallet by ID.
   */
  async delete(id: string): Promise<void> {
    await db.wallets.delete(id);
  }
}

export const walletRepository = new WalletRepository();
