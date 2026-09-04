import { GlassCard } from '../components/common/GlassCard';
import { GradientIconTile } from '../components/common/GradientIconTile';
import { GlassButton } from '../components/common/GlassButton';
import { Wallet } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-text-primary">
      <div className="w-full max-w-md space-y-6">
        <GlassCard variant="elevated" className="flex flex-col items-center text-center space-y-4 p-8">
          <GradientIconTile icon={<Wallet />} role="primary" size="xl" />
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Universal Travel Wallet
            </h1>
            <p className="text-sm text-text-secondary">
              Technical Foundation & System Architecture Active
            </p>
          </div>
          <div className="pt-2 text-xs text-text-muted border-t border-white/10 w-full flex justify-between items-center">
            <span>Status: Phase 1 Ready</span>
            <span className="financial-num text-accent-strong font-mono">Offline-First IndexedDB</span>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
