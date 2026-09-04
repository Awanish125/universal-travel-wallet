import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../infrastructure/db/dexie-db';
import { expenseRepository } from '../../infrastructure/repositories/expense-repository';
import { Expense } from '../entities/expense';
import { Wallet } from '../entities/wallet';
import { Money } from '../financial/money';
import { WalletMapper } from '../../infrastructure/mappers/wallet-mapper';

describe('ExpenseRepository', () => {
  beforeEach(async () => {
    await db.expenses.clear();
    await db.wallets.clear();
    await db.walletMovements.clear();
  });

  it('saves expense and deducts wallet balance atomically', async () => {
    // 1. Setup Wallet
    const wallet = new Wallet({
      id: 'wallet-1',
      tripId: 'trip-1',
      name: 'Test Wallet',
      type: 'CASH',
      currency: 'USD',
      balance: Money.fromDecimal('100.00', 'USD'),
      createdAt: new Date().toISOString(),
    });
    await db.wallets.put(WalletMapper.toPersistence(wallet));

    // 2. Setup Expense
    const expense = new Expense({
      id: 'exp-1',
      tripId: 'trip-1',
      payerId: 'user-1',
      originalAmount: Money.fromDecimal('25.50', 'USD'),
      baseAmount: Money.fromDecimal('25.50', 'USD'),
      exchangeRate: '1',
      category: 'cat-food',
      paymentMethod: 'CASH',
      walletId: 'wallet-1',
      isShared: false,
      splitMethod: 'EQUAL',
      splits: [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    // 3. Save Expense
    await expenseRepository.save(expense);

    // 4. Assert Expense saved
    const savedExp = await db.expenses.get('exp-1');
    expect(savedExp).not.toBeNull();

    // 5. Assert Wallet Balance Deducted (100 - 25.5 = 74.5)
    const updatedWallet = await db.wallets.get('wallet-1');
    expect(updatedWallet?.balance).toBe('74.5'); // Money string representation

    // 6. Assert Wallet Movement Logged
    const movements = await db.walletMovements.toArray();
    expect(movements.length).toBe(1);
    expect(movements[0].amount).toBe('25.5');
    expect(movements[0].type).toBe('EXPENSE');
    expect(movements[0].referenceId).toBe('exp-1');
  });

  it('restores wallet balance upon deletion', async () => {
    // Same setup
    const wallet = new Wallet({
      id: 'wallet-1',
      tripId: 'trip-1',
      name: 'Test Wallet',
      type: 'CASH',
      currency: 'USD',
      balance: Money.fromDecimal('100.00', 'USD'),
      createdAt: new Date().toISOString(),
    });
    await db.wallets.put(WalletMapper.toPersistence(wallet));

    const expense = new Expense({
      id: 'exp-1',
      tripId: 'trip-1',
      payerId: 'user-1',
      originalAmount: Money.fromDecimal('25.50', 'USD'),
      baseAmount: Money.fromDecimal('25.50', 'USD'),
      exchangeRate: '1',
      category: 'cat-food',
      paymentMethod: 'CASH',
      walletId: 'wallet-1',
      isShared: false,
      splitMethod: 'EQUAL',
      splits: [],
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    await expenseRepository.save(expense);
    await expenseRepository.delete('exp-1');

    // Expense deleted
    const savedExp = await db.expenses.get('exp-1');
    expect(savedExp).toBeUndefined();

    // Balance restored to 100
    const updatedWallet = await db.wallets.get('wallet-1');
    expect(updatedWallet?.balance).toBe('100');

    // Movement deleted
    const movements = await db.walletMovements.toArray();
    expect(movements.length).toBe(0);
  });
});
