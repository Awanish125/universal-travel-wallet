'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Upload, FileSpreadsheet, Database, ShieldCheck } from 'lucide-react';
import { BackupService } from '../../../domain/services/backup-service';
import { SoftCard } from '../../../components/common/SoftCard';
import { SoftButton } from '../../../components/common/SoftButton';

export default function BackupPage() {
  const router = useRouter();
  const [isImporting, setIsImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExportJson = async () => {
    try {
      await BackupService.exportToJson();
      setStatusMessage('Full JSON backup downloaded successfully!');
    } catch {
      setStatusMessage('Failed to export JSON backup.');
    }
  };

  const handleExportCsv = async () => {
    try {
      await BackupService.exportExpensesToCsv();
      setStatusMessage('Expenses CSV downloaded successfully!');
    } catch {
      setStatusMessage('Failed to export CSV.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      'Are you sure you want to restore data from this backup? Existing matching records will be safely updated.'
    );
    if (!confirmRestore) return;

    setIsImporting(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await BackupService.importFromJson(content);
        setStatusMessage('Backup restored successfully! All data has been merged.');
      } catch (err) {
        setStatusMessage('Error restoring backup. Please ensure it is a valid JSON file.');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-4 py-6 sticky top-0 bg-background z-10 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full text-foreground hover:bg-surface-strong transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Backup & Restore</h1>
        </div>
      </header>

      <main className="p-4 space-y-6 max-w-md mx-auto mt-2">
        
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent font-bold text-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Export Card */}
        <SoftCard className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Export Backup</h2>
              <p className="text-xs text-muted-foreground">Save your travel data offline</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <SoftButton 
              variant="primary" 
              onClick={handleExportJson}
              className="w-full py-3.5 text-sm font-bold bg-brand-accent shadow-soft-accent flex items-center justify-center gap-2"
            >
              <Database className="w-4 h-4" /> Export Complete JSON Backup
            </SoftButton>

            <SoftButton 
              variant="secondary" 
              onClick={handleExportCsv}
              className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export Expenses as CSV
            </SoftButton>
          </div>
        </SoftCard>

        {/* Import Card */}
        <SoftCard className="p-5 space-y-4 border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Restore Data</h2>
              <p className="text-xs text-muted-foreground">Import a previous JSON backup file</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="w-full cursor-pointer">
              <div className="w-full py-3.5 px-4 bg-surface text-foreground font-bold text-sm rounded-xl border border-border flex items-center justify-center gap-2 hover:bg-surface-strong transition-colors text-center shadow-soft-outer">
                <Upload className="w-4 h-4 text-purple-500" />
                {isImporting ? 'Restoring...' : 'Select JSON File to Restore'}
              </div>
              <input 
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>
        </SoftCard>

      </main>
    </div>
  );
}
