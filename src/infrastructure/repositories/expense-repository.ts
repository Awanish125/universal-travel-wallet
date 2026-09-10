import { Expense } from '../../domain/entities/expense';
import { db } from '../db/dexie-db';
import { ExpenseMapper } from '../mappers/expense-mapper';
import { Money } from '../../domain/financial/money';
import { WalletMapper } from '../mappers/wallet-mapper';
import { newId } from '../../lib/id';

export class ExpenseRepository {
  /**
   * Saves an expense. If a wallet is provided, it records a movement and deducts the balance atomically.
   */
  async save(expense: Expense): Promise<void> {
    const expenseRecord = ExpenseMapper.toPersistence(expense);
    
    await db.transaction('rw', db.expenses, db.wallets, db.walletMovements, async () => {
      // 1. Save the expense
      await db.expenses.put(expenseRecord);

      // 2. If it was paid from a local wallet, deduct the balance
      if (expense.walletId) {
        const walletRecord = await db.wallets.get(expense.walletId);
        
        if (walletRecord) {
          const wallet = WalletMapper.toDomain(walletRecord);
          
          // Verify currencies match. For MVP, we assume the expense originalAmount is in the wallet's currency.
          if (wallet.balance.currency !== expense.originalAmount.currency) {
             throw new Error(`Currency mismatch. Wallet is ${wallet.balance.currency} but expense is ${expense.originalAmount.currency}`);
          }
          
          // Deduct from wallet
          const newBalance = wallet.balance.subtract(expense.originalAmount);
          walletRecord.balance = newBalance.toDecimalString();
          
          await db.wallets.put(walletRecord);

          // 3. Log Wallet Movement
          await db.walletMovements.put({
            id: newId(),
            tripId: expense.tripId,
            walletId: wallet.id,
            amount: expense.originalAmount.toDecimalString(),
            currency: expense.originalAmount.currency,
            type: 'EXPENSE',
            referenceType: 'EXPENSE',
            referenceId: expense.id,
            date: expense.date,
            note: expense.note,
          });
        }
      }
    });
  }

  /**
   * Finds an Expense by ID.
   */
  async findById(id: string): Promise<Expense | null> {
    const record = await db.expenses.get(id);
    if (!record) return null;
    return ExpenseMapper.toDomain(record);
  }

  /**
   * Finds all Expenses for a Trip, ordered by date descending.
   */
  async findByTripId(tripId: string): Promise<Expense[]> {
    const records = await db.expenses
      .where('tripId')
      .equals(tripId)
      .reverse()
      .sortBy('date');
      
    return records.map(ExpenseMapper.toDomain);
  }

  /**
   * Deletes an Expense, restoring the wallet balance if applicable.
   */
  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.expenses, db.wallets, db.walletMovements, async () => {
      const record = await db.expenses.get(id);
      if (!record) return;
      
      const expense = ExpenseMapper.toDomain(record);
      
      if (expense.walletId) {
        const walletRecord = await db.wallets.get(expense.walletId);
        if (walletRecord) {
          const wallet = WalletMapper.toDomain(walletRecord);
          // Restore the balance
          const newBalance = wallet.balance.add(expense.originalAmount);
          walletRecord.balance = newBalance.toDecimalString();
          await db.wallets.put(walletRecord);
        }
        
        // Remove the wallet movement
        await db.walletMovements
          .where('referenceId')
          .equals(id)
          .delete();
      }
      
      await db.expenses.delete(id);
    });
  }
}

export const expenseRepository = new ExpenseRepository();
