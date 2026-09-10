'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { ExpenseMapper } from '../../infrastructure/mappers/expense-mapper';
import { SettlementMapper } from '../../infrastructure/mappers/settlement-mapper';
import { ParticipantMapper } from '../../infrastructure/mappers/participant-mapper';
import { BalanceEngine } from '../../domain/services/balance-engine';
import { SoftCard } from '../common/SoftCard';
import { SoftButton } from '../common/SoftButton';
import { CurrencyAmount } from '../common/CurrencyAmount';
import { HandCoins, User } from 'lucide-react';
import { SettlementModal } from '../settlements/SettlementModal';

interface Props {
  tripId: string;
  baseCurrency: string;
}

export function ParticipantBalancesList({ tripId, baseCurrency }: Props) {
  const [selectedDebt, setSelectedDebt] = useState<{fromId: string, toId: string, amount: string} | null>(null);

  const rawParticipants = useLiveQuery(() => db.participants.where('tripId').equals(tripId).toArray(), [tripId]);
  const rawExpenses = useLiveQuery(() => db.expenses.where('tripId').equals(tripId).toArray(), [tripId]);
  const rawSettlements = useLiveQuery(() => db.settlements.where('tripId').equals(tripId).toArray(), [tripId]);

  if (!rawParticipants || !rawExpenses || !rawSettlements) {
    return <div className="animate-pulse p-4 text-center text-sm text-muted-foreground">Calculating balances...</div>;
  }

  const participants = rawParticipants.map(ParticipantMapper.toDomain);
  const expenses = rawExpenses.map(ExpenseMapper.toDomain);
  const settlements = rawSettlements.map(SettlementMapper.toDomain);

  const participantIds = participants.map(p => p.id);
  const balances = BalanceEngine.calculateBalances(tripId, baseCurrency, participantIds, expenses, settlements);
  const simplifiedDebts = BalanceEngine.simplifyDebts(balances, baseCurrency);

  const me = participants.find(p => p.isUser);

  if (simplifiedDebts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl">
        <HandCoins className="w-10 h-10 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground text-center">All settled up!</p>
        <p className="text-xs text-muted-foreground/60 text-center">No one owes anything.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {simplifiedDebts.map((debt, index) => {
        const fromPerson = participants.find(p => p.id === debt.fromId);
        const toPerson = participants.find(p => p.id === debt.toId);
        
        if (!fromPerson || !toPerson) return null;

        // Simplify language based on user
        const isFromMe = fromPerson.isUser;
        const isToMe = toPerson.isUser;

        let statusText = '';
        if (isFromMe) {
          statusText = `You pay ${toPerson.name}`;
        } else if (isToMe) {
          statusText = `You take from ${fromPerson.name}`;
        } else {
          statusText = `${fromPerson.name} pays ${toPerson.name}`;
        }

        return (
          <SoftCard key={index} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFromMe ? 'bg-destructive/10 text-destructive' : 'bg-success/15 text-success'}`}>
                <User className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{statusText}</span>
                <CurrencyAmount
                  money={debt.amount}
                  className={`text-sm font-black ${isFromMe ? 'text-destructive' : 'text-foreground'}`}
                />
              </div>
            </div>
            <SoftButton 
              variant="primary" 
              onClick={() => setSelectedDebt({
                fromId: debt.fromId,
                toId: debt.toId,
                amount: debt.amount.toDecimalString()
              })}
              className="text-xs py-2 px-4 shadow-soft-accent"
            >
              Settle
            </SoftButton>
          </SoftCard>
        );
      })}

      {selectedDebt && (
        <SettlementModal
          tripId={tripId}
          baseCurrency={baseCurrency}
          debt={selectedDebt}
          isOpen={true}
          onClose={() => setSelectedDebt(null)}
        />
      )}
    </div>
  );
}
