import { db } from '../../infrastructure/db/dexie-db';

/** Everything belonging to one trip, in one JSON document. */
export interface TripExport {
  version: number;
  kind: 'trip';
  exportedAt: string;
  trip: unknown;
  participants: unknown[];
  expenses: unknown[];
  wallets: unknown[];
  walletMovements: unknown[];
  exchanges: unknown[];
  settlements: unknown[];
  budgets: unknown[];
  negotiations: unknown[];
  categories: unknown[];
}

function downloadBlob(contents: string, mimeType: string, filename: string): void {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Makes a filename safe on every OS. */
function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'trip';
}

function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? '' : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

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
  /**
   * Collects every record belonging to one trip. Used before deleting a trip so
   * the user keeps a restorable copy of what they are about to lose.
   */
  static async collectTripData(tripId: string): Promise<TripExport | null> {
    const trip = await db.trips.get(tripId);
    if (!trip) return null;

    return {
      version: 1,
      kind: 'trip',
      exportedAt: new Date().toISOString(),
      trip,
      participants: await db.participants.where('tripId').equals(tripId).toArray(),
      expenses: await db.expenses.where('tripId').equals(tripId).toArray(),
      wallets: await db.wallets.where('tripId').equals(tripId).toArray(),
      walletMovements: await db.walletMovements.where('tripId').equals(tripId).toArray(),
      exchanges: await db.exchanges.where('tripId').equals(tripId).toArray(),
      settlements: await db.settlements.where('tripId').equals(tripId).toArray(),
      budgets: await db.budgets.where('tripId').equals(tripId).toArray(),
      negotiations: await db.negotiations.where('tripId').equals(tripId).toArray(),
      categories: await db.categories.toArray(),
    };
  }

  /** Downloads one trip's complete data as JSON. */
  static async exportTripToJson(tripId: string): Promise<boolean> {
    const data = await BackupService.collectTripData(tripId);
    if (!data) return false;

    const name = slugify((data.trip as { name?: string }).name || 'trip');
    downloadBlob(
      JSON.stringify(data, null, 2),
      'application/json',
      `${name}-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    return true;
  }

  /** Downloads one trip's expenses as a spreadsheet-friendly CSV. */
  static async exportTripExpensesToCsv(tripId: string): Promise<boolean> {
    const data = await BackupService.collectTripData(tripId);
    if (!data) return false;

    const participants = data.participants as Array<{ id: string; name: string }>;
    const categories = data.categories as Array<{ id: string; name: string }>;
    const expenses = data.expenses as Array<Record<string, unknown>>;

    const headers = [
      'Date',
      'Category',
      'Note',
      'Paid by',
      'Amount',
      'Currency',
      'Home amount',
      'Home currency',
      'Exchange rate',
      'Payment method',
      'Shared',
    ];

    const rows = expenses.map((expense) => [
      expense.date,
      categories.find((c) => c.id === expense.category)?.name ?? expense.category,
      expense.note ?? '',
      participants.find((p) => p.id === expense.payerId)?.name ?? expense.payerId,
      expense.amount,
      expense.originalCurrency,
      expense.baseAmount,
      expense.baseCurrency,
      expense.exchangeRate,
      expense.paymentMethod,
      expense.isShared ? 'Shared' : 'Personal',
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(','))
      .join(String.fromCharCode(10));
    const name = slugify((data.trip as { name?: string }).name || 'trip');
    downloadBlob(csv, 'text/csv', `${name}-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    return true;
  }

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
