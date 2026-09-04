import { db } from '../../infrastructure/db/dexie-db';

export class BackupService {
  /**
   * Exports the entire IndexedDB database into a formatted JSON string and triggers a browser download.
   */
  static async exportToJson(): Promise<void> {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      trips: await db.trips.toArray(),
      participants: await db.participants.toArray(),
      expenses: await db.expenses.toArray(),
      wallets: await db.wallets.toArray(),
      exchanges: await db.exchanges.toArray(),
      settlements: await db.settlements.toArray(),
      categories: await db.categories.toArray(),
      budgets: await db.budgets.toArray(),
      negotiations: await db.negotiations.toArray(),
      settings: await db.settings.toArray(),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `universal-travel-wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports expenses to CSV format and triggers browser download.
   */
  static async exportExpensesToCsv(): Promise<void> {
    const expenses = await db.expenses.toArray();
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['ID', 'TripID', 'PayerID', 'Amount', 'OriginalCurrency', 'BaseAmount', 'BaseCurrency', 'Category', 'Date', 'Note'];
    const rows = expenses.map(e => [
      e.id,
      e.tripId,
      e.payerId,
      e.amount,
      e.originalCurrency,
      e.baseAmount,
      e.baseCurrency,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      e.date,
      `"${(e.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-export-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Imports database tables from a JSON string.
   */
  static async importFromJson(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object' || !data.version) {
        throw new Error('Invalid backup file structure.');
      }

      await db.transaction('rw', [
        db.trips, db.participants, db.expenses, db.wallets, 
        db.exchanges, db.settlements, db.categories, db.budgets, 
        db.negotiations, db.settings
      ], async () => {
        if (Array.isArray(data.trips)) await db.trips.bulkPut(data.trips);
        if (Array.isArray(data.participants)) await db.participants.bulkPut(data.participants);
        if (Array.isArray(data.expenses)) await db.expenses.bulkPut(data.expenses);
        if (Array.isArray(data.wallets)) await db.wallets.bulkPut(data.wallets);
        if (Array.isArray(data.exchanges)) await db.exchanges.bulkPut(data.exchanges);
        if (Array.isArray(data.settlements)) await db.settlements.bulkPut(data.settlements);
        if (Array.isArray(data.categories)) await db.categories.bulkPut(data.categories);
        if (Array.isArray(data.budgets)) await db.budgets.bulkPut(data.budgets);
        if (Array.isArray(data.negotiations)) await db.negotiations.bulkPut(data.negotiations);
        if (Array.isArray(data.settings)) await db.settings.bulkPut(data.settings);
      });

      return true;
    } catch (error) {
      console.error('Failed to import JSON backup:', error);
      throw error;
    }
  }
}
