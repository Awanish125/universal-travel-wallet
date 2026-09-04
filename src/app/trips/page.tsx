'use client';

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../infrastructure/db/dexie-db';
import { SoftCard } from '../../components/common/SoftCard';
import { SoftButton } from '../../components/common/SoftButton';
import { Plus, Plane, Calendar, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StaggerContainer, StaggerItem } from '../../components/common/StaggerContainer';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export default function TripsPage() {
  const trips = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray());
  const router = useRouter();

  if (trips === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading trips...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          My Trips
        </h1>
        <ThemeToggle />
      </header>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center space-y-4">
          <div className="w-24 h-24 bg-surface-strong rounded-full flex items-center justify-center shadow-clay-convex-sm border border-white/5">
            <Plane className="w-10 h-10 text-brand-accent opacity-80" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">No trips yet</h2>
            <p className="text-muted-foreground text-sm">Create your first trip to start tracking your travel finances.</p>
          </div>
        </div>
      ) : (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {trips.map((trip) => (
            <StaggerItem 
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.id}`)}
            >
              <SoftCard interactive className="p-5 flex flex-col space-y-4 hover:border-brand-accent/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-tight">{trip.name}</h3>
                    <p className="text-sm font-medium text-brand-accent flex items-center gap-1 mt-1">
                      <Globe className="w-3.5 h-3.5" />
                      {trip.country}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${trip.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 opacity-70" />
                    <span>{new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <span className="opacity-40">-</span>
                  <span>{new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </SoftCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <SoftButton 
          variant="primary" 
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-soft-accent bg-brand-accent hover:bg-brand-accent/90"
          onClick={() => router.push('/trips/new')}
        >
          <Plus className="w-6 h-6 text-white" />
        </SoftButton>
      </div>
    </div>
  );
}
