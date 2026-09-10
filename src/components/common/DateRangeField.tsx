'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DateRangeField — a start/end date picker with the span between them
 * highlighted, the way a hotel booking calendar behaves.
 *
 * Built on this project's own tokens rather than on a component library: Point
 * 98 and Rule 68 forbid mixing a second UI system in, and a library picker
 * would still need every surface, shadow and radius overridden to look like the
 * rest of the app. Dates are handled as local `YYYY-MM-DD` strings with plain
 * `Date` arithmetic, so there is no date library either (Rule 25).
 */

interface Props {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** `YYYY-MM-DD` in the viewer's own timezone — never the UTC shift `toISOString` gives. */
function toKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromKey(key: string): Date | null {
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

/** The 6×7 grid a month is drawn on, including the days either side of it. */
function buildMonthGrid(month: Date): Date[] {
  const first = startOfMonth(month);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function formatLong(key: string): string {
  const date = fromKey(key);
  if (!date) return '';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function nightsBetween(startKey: string, endKey: string): number {
  const start = fromKey(startKey);
  const end = fromKey(endKey);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function DateRangeField({
  startDate,
  endDate,
  onChange,
  label = 'Dates',
  hint,
  error,
  className,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  /** Which end of the range the next click sets. */
  const [pending, setPending] = useState<'start' | 'end'>('start');
  /** The day under the pointer, so the span previews before the second click. */
  const [hovered, setHovered] = useState<string | null>(null);
  const [month, setMonth] = useState<Date>(() => fromKey(startDate) ?? new Date());

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const box = trigger.getBoundingClientRect();
    const width = Math.max(box.width, 320);
    setRect({
      left: Math.min(box.left, Math.max(8, window.innerWidth - width - 8)),
      top: box.bottom,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    position();
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [isOpen, position]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Reset only when the panel opens. Watching `startDate` here as well meant
  // that choosing a start immediately reset the flow back to "pick a start",
  // so the second click could never land on the end date.
  const startDateRef = useRef(startDate);
  startDateRef.current = startDate;

  useEffect(() => {
    if (!isOpen) return;
    setPending('start');
    setHovered(null);
    setMonth(fromKey(startDateRef.current) ?? new Date());
  }, [isOpen]);

  const todayKey = useMemo(() => toKey(new Date()), []);
  const grid = useMemo(() => buildMonthGrid(month), [month]);

  /** The end of the span as the user sees it right now, real or previewed. */
  const previewEnd = pending === 'end' && hovered && hovered > startDate ? hovered : endDate;

  function handleDayClick(key: string) {
    if (pending === 'start') {
      // Starting a new range: the old end only survives if it is still after.
      onChange({ startDate: key, endDate: endDate && endDate >= key ? endDate : key });
      setPending('end');
      return;
    }

    if (key < startDate) {
      // Clicking before the start restarts the range there rather than
      // rejecting the click, which is what a booking calendar does.
      onChange({ startDate: key, endDate: key });
      setPending('end');
      return;
    }

    onChange({ startDate, endDate: key });
    setPending('start');
    setIsOpen(false);
  }

  const nights = nightsBetween(startDate, endDate);

  const panel =
    mounted && isOpen && rect
      ? createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', left: rect.left, top: rect.top + 8, width: rect.width }}
            className="z-[80] overflow-hidden rounded-2xl border border-border-strong bg-surface-strong p-3 shadow-clay-floating"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                aria-label="Previous month"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent-soft hover:text-brand-accent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-bold text-foreground">
                {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </span>
              <button
                type="button"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent-soft hover:text-brand-accent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-2 text-center text-xs text-muted-foreground">
              {pending === 'start' ? 'Pick the day you leave' : 'Now pick the day you come back'}
            </p>

            <div className="grid grid-cols-7 gap-y-1" role="grid">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-text-muted"
                >
                  {day}
                </div>
              ))}

              {grid.map((day) => {
                const key = toKey(day);
                const inMonth = day.getMonth() === month.getMonth();
                const isStart = key === startDate;
                const isEnd = key === previewEnd;
                const inRange =
                  Boolean(startDate) && Boolean(previewEnd) && key > startDate && key < previewEnd;
                const isEdge = isStart || isEnd;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDayClick(key)}
                    onMouseEnter={() => setHovered(key)}
                    aria-label={formatLong(key)}
                    aria-pressed={isEdge}
                    className={clsx(
                      'relative flex h-9 items-center justify-center text-sm transition-colors',
                      // The span is a continuous band, so only its two ends are
                      // rounded — that is what makes it read as one stay.
                      inRange && 'bg-accent-soft text-foreground',
                      isStart && previewEnd && previewEnd !== startDate && 'rounded-l-xl',
                      isEnd && previewEnd !== startDate && 'rounded-r-xl',
                      isEdge && 'bg-gradient-clay-primary font-bold text-white',
                      !inRange && !isEdge && 'rounded-xl hover:bg-accent-soft',
                      !inMonth && !isEdge && !inRange && 'text-text-disabled',
                      inMonth && !isEdge && !inRange && 'text-foreground'
                    )}
                  >
                    {day.getDate()}
                    {key === todayKey && !isEdge && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-brand-accent" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-2">
              <button
                type="button"
                onClick={() => {
                  const key = toKey(new Date());
                  onChange({ startDate: key, endDate: key });
                  setMonth(new Date());
                  setPending('end');
                }}
                className="rounded-lg px-2 py-1 text-xs font-bold text-brand-accent hover:bg-accent-soft"
              >
                Today
              </button>
              <span className="text-xs text-muted-foreground">
                {nights > 0
                  ? `${nights} night${nights === 1 ? '' : 's'}`
                  : 'Same-day trip'}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-2 py-1 text-xs font-bold text-foreground hover:bg-accent-soft"
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className={clsx('relative', className)}>
      <label className="mb-1 block text-sm font-medium text-foreground">
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
      </label>

      <div className="field-focus-ring" data-open={isOpen ? 'true' : undefined}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          data-open={isOpen ? 'true' : undefined}
          data-invalid={error ? 'true' : undefined}
          className="field-surface flex items-center gap-3 text-left"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">
            {startDate ? (
              <>
                <span className="font-semibold text-foreground">{formatLong(startDate)}</span>
                <span className="mx-1.5 text-muted-foreground">→</span>
                <span className="font-semibold text-foreground">{formatLong(endDate)}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Pick your dates</span>
            )}
          </span>
          {nights > 0 && (
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
              {nights}n
            </span>
          )}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {panel}
    </div>
  );
}
