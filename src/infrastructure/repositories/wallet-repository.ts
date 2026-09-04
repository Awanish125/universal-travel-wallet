import { Wallet } from '../../domain/entities/wallet';
import { db } from '../db/dexie-db';
import { WalletMapper } from '../mappers/wallet-mapper';

export class WalletRepository {
  /**
   * Saves a Wallet to the database (create or update).
   */
  async save(wallet: Wallet): Promise<void> {
    const record = WalletMapper.toPersistence(wallet);
    await db.wallets.put(record);
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
