import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { walletRepository } from '../../infrastructure/repositories/wallet-repository';
import { Wallet } from '../entities/wallet';
import { Money } from '../financial/money';

describe('WalletRepository', () => {
  beforeEach(async () => {
    await db.wallets.clear();
    await db.walletMovements.clear();
  });

  const createSampleWallet = (id: string, tripId: string = 'trip-1') => {
    return new Wallet({
      id,
      tripId,
      name: `Wallet ${id}`,
      type: 'CASH',
      currency: 'USD',
      balance: Money.fromDecimal('500.50', 'USD'),
      createdAt: new Date().toISOString(),
    });
  };

  it('saves and retrieves a wallet by ID', async () => {
    const wallet = createSampleWallet('wallet-1');
    await walletRepository.save(wallet);

    const retrieved = await walletRepository.findById('wallet-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('wallet-1');
    expect(retrieved?.name).toBe('Wallet wallet-1');
    expect(retrieved?.balance.toDecimalString()).toBe('500.5');
  });

  it('returns null for non-existent wallet', async () => {
    const retrieved = await walletRepository.findById('non-existent');
    expect(retrieved).toBeNull();
  });

  it('finds all wallets by trip ID', async () => {
    await walletRepository.save(createSampleWallet('wallet-1', 'trip-1'));
    await walletRepository.save(createSampleWallet('wallet-2', 'trip-1'));
    await walletRepository.save(createSampleWallet('wallet-3', 'trip-2'));

    const trip1Wallets = await walletRepository.findByTripId('trip-1');
    expect(trip1Wallets.length).toBe(2);

    const trip2Wallets = await walletRepository.findByTripId('trip-2');
    expect(trip2Wallets.length).toBe(1);
  });

  it('deletes a wallet', async () => {
    await walletRepository.save(createSampleWallet('wallet-1'));
    let retrieved = await walletRepository.findById('wallet-1');
    expect(retrieved).not.toBeNull();

    await walletRepository.delete('wallet-1');
    retrieved = await walletRepository.findById('wallet-1');
    expect(retrieved).toBeNull();
  });

  describe('adjustBalance', () => {
    it('adds money and logs an ADJUSTMENT movement', async () => {
      await walletRepository.save(createSampleWallet('wallet-1'));

      await walletRepository.adjustBalance(
        'wallet-1',
        Money.fromDecimal('100', 'USD'),
        'Found cash'
      );

      const wallet = await walletRepository.findById('wallet-1');
      expect(wallet?.balance.toDecimalString()).toBe('600.5');

      const movements = await db.walletMovements.where('walletId').equals('wallet-1').toArray();
      expect(movements).toHaveLength(1);
      expect(movements[0].type).toBe('ADJUSTMENT');
      expect(movements[0].amount).toBe('100');
      expect(movements[0].note).toBe('Found cash');
    });

    it('removes money with a negative amount', async () => {
      await walletRepository.save(createSampleWallet('wallet-1'));

      await walletRepository.adjustBalance('wallet-1', Money.fromDecimal('-50', 'USD'));

      const wallet = await walletRepository.findById('wallet-1');
      expect(wallet?.balance.toDecimalString()).toBe('450.5');
    });

    it('throws for a wallet that does not exist', async () => {
      await expect(
        walletRepository.adjustBalance('missing', Money.fromDecimal('10', 'USD'))
      ).rejects.toThrow();
    });
  });
});
