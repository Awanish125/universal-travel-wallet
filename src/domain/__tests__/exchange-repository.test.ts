import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { exchangeRepository } from '../../infrastructure/repositories/exchange-repository';
import { Exchange } from '../entities/exchange';
import { Wallet } from '../entities/wallet';
import { Money } from '../financial/money';
import { WalletMapper } from '../../infrastructure/mappers/wallet-mapper';

describe('ExchangeRepository', () => {
  beforeEach(async () => {
    await db.exchanges.clear();
    await db.wallets.clear();
    await db.walletMovements.clear();
  });

  it('atomically deducts source wallet and credits target wallet on exchange', async () => {
    // 1. Setup Given Wallet (USD 500)
    const usdWallet = new Wallet({
      id: 'w-usd',
      tripId: 'trip-1',
      name: 'USD Cash',
      type: 'CASH',
      currency: 'USD',
      balance: Money.fromDecimal('500.00', 'USD'),
      createdAt: new Date().toISOString(),
    });
    await db.wallets.put(WalletMapper.toPersistence(usdWallet));

    // 2. Setup Received Wallet (IDR 0)
    const idrWallet = new Wallet({
      id: 'w-idr',
      tripId: 'trip-1',
      name: 'IDR Cash',
      type: 'CASH',
      currency: 'IDR',
      balance: Money.fromDecimal('0', 'IDR'),
      createdAt: new Date().toISOString(),
    });
    await db.wallets.put(WalletMapper.toPersistence(idrWallet));

    // 3. Create Exchange: 100 USD -> 1,500,000 IDR
    const exchange = new Exchange({
      id: 'ex-1',
      tripId: 'trip-1',
      givenWalletId: 'w-usd',
      givenAmount: Money.fromDecimal('100.00', 'USD'),
      receivedWalletId: 'w-idr',
      receivedAmount: Money.fromDecimal('1500000', 'IDR'),
      actualRate: '15000',
      marketRate: '15000',
      difference: Money.fromDecimal('0', 'IDR'),
      gainLoss: Money.fromDecimal('0', 'IDR'),
      fee: Money.fromDecimal('0', 'USD'),
      date: new Date().toISOString(),
      provider: 'Money Changer Kuta',
    });

    await exchangeRepository.save(exchange);

    // 4. Assert USD Wallet balance is now 400
    const updatedUsd = await db.wallets.get('w-usd');
    expect(updatedUsd?.balance).toBe('400');

    // 5. Assert IDR Wallet balance is now 1500000
    const updatedIdr = await db.wallets.get('w-idr');
    expect(updatedIdr?.balance).toBe('1500000');

    // 6. Assert Movements recorded
    const movements = await db.walletMovements.toArray();
    expect(movements).toHaveLength(2);
    expect(movements.find(m => m.type === 'EXCHANGE_OUT')?.amount).toBe('100');
    expect(movements.find(m => m.type === 'EXCHANGE_IN')?.amount).toBe('1500000');
  });
});
