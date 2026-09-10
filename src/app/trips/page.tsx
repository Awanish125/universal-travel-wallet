'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  FileText,
  Globe,
  MoreVertical,
  Plane,
  Plus,
  Receipt,
  Repeat2,
  Trash2,
} from 'lucide-react';

import { db } from '../../infrastructure/db/dexie-db';
import { TripMapper } from '../../infrastructure/mappers/trip-mapper';
import { SoftCard } from '../../components/common/SoftCard';
import { SoftButton } from '../../components/common/SoftButton';
import { StaggerContainer, StaggerItem } from '../../components/common/StaggerContainer';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { DeleteTripDialog } from '../../components/trips/DeleteTripDialog';
import { currencyBadge } from '../../lib/currency-format';
import { Trip } from '../../domain/entities/trip';

export default function TripsPage() {
  const router = useRouter();
  const records = useLiveQuery(() => db.trips.orderBy('createdAt').reverse().toArray());
  const [tripPendingDelete, setTripPendingDelete] = useState<Trip | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (records === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="animate-pulse text-muted-foreground">Loading trips...</p>
      </div>
    );
  }

  const trips = records.map(TripMapper.toDomain);

  return (
    <div className="min-h-screen bg-background pb-36 md:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My trips</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {trips.length === 0
                ? 'Start by adding where you are going.'
                : `${trips.length} trip${trips.length === 1 ? '' : 's'} saved on this device`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <ThemeToggle />
            </div>
            {/* A visible primary action, so adding a trip never depends on the
                floating button alone. */}
            <SoftButton
              variant="primary"
              onClick={() => router.push('/trips/new')}
              className="hidden sm:inline-flex"
            >
              <Plus className="h-4 w-4" />
              New trip
            </SoftButton>
          </div>
        </header>

        {trips.length === 0 ? (
          <SoftCard className="mt-6 flex flex-col items-center gap-4 py-14 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-strong shadow-soft-outer-sm">
              <Plane className="h-10 w-10 text-brand-accent" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">No trips yet</h2>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                Create your first trip to track spending, split bills and settle up — all
                offline.
              </p>
            </div>
            <SoftButton variant="primary" onClick={() => router.push('/trips/new')}>
              <Plus className="h-4 w-4" />
              Create your first trip
            </SoftButton>
          </SoftCard>
        ) : (
          <StaggerContainer className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trips.map((trip) => (
              <StaggerItem key={trip.id}>
                <SoftCard className="relative flex flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/trips/${trip.id}`)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <h3 className="truncate text-lg font-bold leading-tight text-foreground">
                        {trip.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-sm font-medium text-brand-accent">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{trip.country}</span>
                      </p>
                    </button>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        aria-label={`Actions for ${trip.name}`}
                        aria-expanded={openMenuId === trip.id}
                        onClick={() =>
                          setOpenMenuId((current) => (current === trip.id ? null : trip.id))
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>

                      {openMenuId === trip.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                            aria-hidden
                          />
                          <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-2xl border border-border bg-surface-strong py-1 shadow-soft-outer">
                            <TripMenuItem
                              icon={Receipt}
                              label="Add expense"
                              onClick={() => router.push(`/trips/${trip.id}/expense`)}
                            />
                            <TripMenuItem
                              icon={Repeat2}
                              label="Record exchange"
                              onClick={() => router.push(`/trips/${trip.id}/exchange`)}
                            />
                            <TripMenuItem
                              icon={BarChart3}
                              label="Analytics"
                              onClick={() => router.push(`/trips/${trip.id}/analytics`)}
                            />
                            <TripMenuItem
                              icon={FileText}
                              label="Summary report"
                              onClick={() => router.push(`/trips/${trip.id}/summary`)}
                            />
                            <TripMenuItem
                              icon={Trash2}
                              label="Delete trip"
                              destructive
                              onClick={() => {
                                setOpenMenuId(null);
                                setTripPendingDelete(trip);
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/trips/${trip.id}`)}
                    className="flex flex-col gap-3 text-left"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0 opacity-70" />
                      <span>
                        {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          trip.status === 'ACTIVE'
                            ? 'bg-success/15 text-success'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {trip.status === 'ACTIVE' ? 'Active' : 'Finished'}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {currencyBadge(trip.baseCurrency)} → {currencyBadge(trip.localCurrency)}
                      </span>
                    </div>
                  </button>
                </SoftCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Floating action button. It sits above the mobile bottom bar rather than
          behind it — previously it was pinned at bottom-6 with a lower z-index,
          so on phones the navigation bar covered it completely. */}
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 z-40 md:bottom-8 md:right-8">
        <SoftButton
          variant="primary"
          aria-label="Create a new trip"
          onClick={() => router.push('/trips/new')}
          className="h-16 w-16 rounded-full p-0"
        >
          <Plus className="h-7 w-7" />
        </SoftButton>
      </div>

      {tripPendingDelete && (
        <DeleteTripDialog
          isOpen
          tripId={tripPendingDelete.id}
          tripName={tripPendingDelete.name}
          onClose={() => setTripPendingDelete(null)}
          onDeleted={() => setTripPendingDelete(null)}
        />
      )}
    </div>
  );
}

function TripMenuItem({
  icon: Icon,
  label,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[44px] w-full items-center gap-3 px-4 text-sm font-semibold transition-colors hover:bg-accent-soft ${
        destructive ? 'text-destructive' : 'text-foreground'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
