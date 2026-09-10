'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, Download, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Sheet } from '../common/Sheet';
import { SoftButton } from '../common/SoftButton';
import { BackupService } from '../../domain/services/backup-service';
import { tripRepository } from '../../infrastructure/repositories/trip-repository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  /** Called after the trip and all of its data are gone. */
  onDeleted: () => void;
}

/**
 * Deleting a trip destroys every expense, wallet, exchange and settlement it
 * holds, and none of it can be recovered afterwards. So the dialog offers a
 * full download first and only unlocks the delete button once the user has
 * either saved a copy or explicitly said they do not want one.
 */
export function DeleteTripDialog({ isOpen, onClose, tripId, tripName, onDeleted }: Props) {
  const [hasExported, setHasExported] = useState(false);
  const [skipExport, setSkipExport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = hasExported || skipExport;

  async function handleExport(format: 'json' | 'csv') {
    setError(null);
    try {
      const ok =
        format === 'json'
          ? await BackupService.exportTripToJson(tripId)
          : await BackupService.exportTripExpensesToCsv(tripId);
      if (!ok) {
        setError('This trip could not be found. Nothing was downloaded.');
        return;
      }
      setHasExported(true);
    } catch (err) {
      console.error('Failed to export trip before deletion', err);
      setError('The download failed. Try again before deleting this trip.');
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      await tripRepository.delete(tripId);
      onDeleted();
    } catch (err) {
      console.error('Failed to delete trip', err);
      setError('This trip could not be deleted. Nothing was removed.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete "${tripName}"?`}
      description="Save a copy first — this cannot be undone."
      footer={
        <div className="flex gap-3">
          <SoftButton variant="secondary" className="flex-1" onClick={onClose}>
            Keep trip
          </SoftButton>
          <SoftButton
            variant="primary"
            disabled={!canDelete || isDeleting}
            onClick={handleDelete}
            className="flex-1 bg-destructive text-destructive-foreground shadow-none hover:brightness-110"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete forever'}
          </SoftButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="text-sm text-foreground">
            Every expense, wallet, exchange, settlement and companion in this trip is
            removed with it. There is no undo and no copy on any server.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-foreground">1. Download your data</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <SoftButton
              variant="secondary"
              onClick={() => handleExport('json')}
              className="justify-start"
            >
              <Download className="h-4 w-4" />
              Full backup (JSON)
            </SoftButton>
            <SoftButton
              variant="secondary"
              onClick={() => handleExport('csv')}
              className="justify-start"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Expenses (CSV)
            </SoftButton>
          </div>
          {hasExported && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <Check className="h-3.5 w-3.5" />
              Downloaded. You can restore it later from Backup &amp; Restore.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-foreground">2. Confirm</p>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
            <input
              type="checkbox"
              checked={skipExport}
              onChange={(e) => setSkipExport(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[color:var(--accent-primary)]"
            />
            <span className="text-sm text-foreground">
              I don&apos;t need a copy — delete this trip without downloading.
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </Sheet>
  );
}
