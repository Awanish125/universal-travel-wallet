'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { WalletMapper } from '../../infrastructure/mappers/wallet-mapper';
import { Wallet } from '../../domain/entities/wallet';
import { SoftCard } from '../common/SoftCard';
import { CreditCard, Banknote, Landmark, Smartphone, MoreHorizontal } from 'lucide-react';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { StaggerContainer, StaggerItem } from '../common/StaggerContainer';
import { WalletDetailSheet } from './WalletDetailSheet';

interface Props {
  tripId: string;
}

const getWalletIcon = (type: string) => {
  switch (type) {
    case 'CASH': return <Banknote className="w-5 h-5 text-emerald-500" />;
    case 'CARD': return <CreditCard className="w-5 h-5 text-blue-500" />;
    case 'BANK': return <Landmark className="w-5 h-5 text-indigo-500" />;
    case 'UPI': return <Smartphone className="w-5 h-5 text-purple-500" />;
    default: return <MoreHorizontal className="w-5 h-5 text-gray-500" />;
  }
};

export function WalletList({ tripId }: Props) {
  const records = useLiveQuery(() => db.wallets.where('tripId').equals(tripId).toArray());
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  if (records === undefined) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading wallets...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl">
        <p className="text-sm text-muted-foreground text-center">No wallets added yet.<br/>Add a cash or card wallet to start.</p>
      </div>
    );
  }

  const wallets = records.map(WalletMapper.toDomain);

  return (
    <>
      <StaggerContainer className="grid grid-cols-1 gap-3">
        {wallets.map(wallet => (
          <StaggerItem key={wallet.id}>
            <SoftCard
              interactive
              onClick={() => setSelectedWallet(wallet)}
              className="p-4 flex items-center justify-between hover:border-brand-accent/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-strong shadow-clay-convex-sm flex items-center justify-center border border-white/5">
                  {getWalletIcon(wallet.type)}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{wallet.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{wallet.type.toLowerCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-foreground flex items-center gap-1 justify-end">
                  <span className="text-xs text-muted-foreground font-bold">{wallet.balance.currency}</span>
                  <AnimatedNumber value={wallet.balance.toNumber()} decimals={2} />
                </p>
              </div>
            </SoftCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <WalletDetailSheet
        wallet={selectedWallet}
        isOpen={selectedWallet !== null}
        onClose={() => setSelectedWallet(null)}
        onDeleted={() => setSelectedWallet(null)}
      />
    </>
  );
}
