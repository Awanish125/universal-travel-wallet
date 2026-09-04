import { Settlement } from '../../domain/entities/settlement';
import { db } from '../db/dexie-db';
import { SettlementMapper } from '../mappers/settlement-mapper';
import { WalletMapper } from '../mappers/wallet-mapper';

export class SettlementRepository {
  /**
   * Saves a settlement. If a wallet is provided, records a movement and deducts balance.
   */
  async save(settlement: Settlement): Promise<void> {
    const record = SettlementMapper.toPersistence(settlement);
    
    await db.transaction('rw', db.settlements, db.wallets, db.walletMovements, async () => {
      // 1. Save settlement
      await db.settlements.put(record);

      // 2. If it was paid from a local wallet, deduct the balance
      if (settlement.walletId) {
        const walletRecord = await db.wallets.get(settlement.walletId);
        
        if (walletRecord) {
          const wallet = WalletMapper.toDomain(walletRecord);
          
          if (wallet.balance.currency !== settlement.amount.currency) {
             throw new Error(`Currency mismatch. Wallet is ${wallet.balance.currency} but settlement is ${settlement.amount.currency}`);
          }
          
          const newBalance = wallet.balance.subtract(settlement.amount);
          walletRecord.balance = newBalance.toDecimalString();
          
          await db.wallets.put(walletRecord);

          // 3. Log Wallet Movement for payer (SETTLEMENT_OUT)
          await db.walletMovements.put({
            id: crypto.randomUUID(),
            tripId: settlement.tripId,
            walletId: wallet.id,
            amount: settlement.amount.toDecimalString(),
            currency: settlement.amount.currency,
            type: 'SETTLEMENT_OUT',
            referenceType: 'SETTLEMENT',
            referenceId: settlement.id,
            date: settlement.date,
            note: settlement.note,
          });
        }
      }
    });
  }

  async findByTripId(tripId: string): Promise<Settlement[]> {
    const records = await db.settlements
      .where('tripId')
      .equals(tripId)
      .reverse()
      .sortBy('date');
      
    return records.map(SettlementMapper.toDomain);
  }
}

export const settlementRepository = new SettlementRepository();
