'use client';

import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';

export interface SearchableOption {
  /** Stored value, e.g. a currency code or a category id. */
  value: string;
  /** Main line shown in the list and in the closed control. */
  label: string;
  /** Optional second line shown under the label. */
  description?: string;
  /** Optional leading glyph — a code chip, a flag, an icon. */
  leading?: React.ReactNode;
  /** Extra text matched while searching but not displayed. */
  keywords?: string;
}

interface Props {
  options: SearchableOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  hint?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  /**
   * Renders a "create" row at the bottom of the list. Receives whatever the
   * user typed, so a missing option can be added without leaving the form.
   */
  onCreate?: (typedText: string) => void;
  createLabel?: string;
}

function matches(option: SearchableOption, query: string): boolean {
  if (!query) return true;
  const haystack = [option.value, option.label, option.description, option.keywords]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

/** Where the floating panel should sit, in viewport coordinates. */
interface PanelRect {
  left: number;
  top: number;
  width: number;
  /** Panel is above the trigger when there is not enough room below. */
  placement: 'below' | 'above';
  maxHeight: number;
}

/**
 * Accessible searchable dropdown used everywhere a list is long enough to need
 * typing: currencies, countries, categories, people, wallets.
 *
 * The panel is rendered through a portal and positioned in viewport
 * coordinates. Kept inside the control it inherited every ancestor's stacking
 * and overflow, so it slid underneath the next field and was clipped by a
 * sheet's scroll container — no z-index on the panel itself can fix that,
 * because the ancestor creates the stacking context.
 */
export function SearchableSelect({
  options,
  value,
  onChange,
  label,
  hint,
  placeholder = 'Select an option',
  searchPlaceholder = 'Type to search...',
  emptyMessage = 'Nothing matches your search.',
  disabled = false,
  className,
  error,
  onCreate,
  createLabel = 'Add',
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [rect, setRect] = useState<PanelRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const listboxId = useId();
  const errorId = useId();

  useEffect(() => setMounted(true), []);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => options.filter((o) => matches(o, query)), [options, query]);

  const position = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const box = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - box.bottom - 12;
    const spaceAbove = box.top - 12;
    const wantsAbove = spaceBelow < 220 && spaceAbove > spaceBelow;

    setRect({
      left: box.left,
      top: wantsAbove ? box.top : box.bottom,
      width: box.width,
      placement: wantsAbove ? 'above' : 'below',
      maxHeight: Math.max(180, Math.min(360, wantsAbove ? spaceAbove : spaceBelow)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    position();

    // Any scroll, anywhere, can move the trigger — including a sheet's own
    // scroll container, which is why this listens in the capture phase.
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [isOpen, position]);

  // Close when the user clicks or taps away, counting the portalled panel as
  // "inside" even though it is not a DOM descendant.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
    const raf = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Keep the highlighted row scrolled into view during keyboard navigation.
  useEffect(() => {
    const activeRow = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    activeRow?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function commit(optionValue: string) {
    onChange(optionValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleCreate() {
    onCreate?.(query.trim());
    setIsOpen(false);
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) commit(option.value);
      else if (onCreate && query.trim()) handleCreate();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === 'Tab') {
      setIsOpen(false);
    }
  }

  const panel =
    mounted && isOpen && rect
      ? createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              left: rect.left,
              width: rect.width,
              ...(rect.placement === 'below'
                ? { top: rect.top + 8 }
                : { bottom: window.innerHeight - rect.top + 8 }),
            }}
            className="z-[80] overflow-hidden rounded-2xl border border-border-strong bg-surface-strong shadow-clay-floating"
          >
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label={label ? `Search ${label}` : 'Search options'}
                // 16px is the line iOS/Android draw for "leave this input
                // alone" — anything smaller and the browser zooms the whole
                // page in to fit it on focus, which read as the dropdown
                // itself zooming. `text-base` here, `text-sm` everywhere
                // else this input's row uses it, is the fix.
                className="w-full bg-transparent py-1 text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-label={label}
              style={{ maxHeight: rect.maxHeight }}
              className="overflow-y-auto overscroll-contain py-1"
            >
              {filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => commit(option.value)}
                    className={clsx(
                      'mx-1 flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm',
                      index === activeIndex ? 'bg-accent-soft' : 'bg-transparent'
                    )}
                  >
                    {option.leading}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-foreground">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-accent" />}
                  </li>
                );
              })}

              {filtered.length === 0 && !onCreate && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {emptyMessage}
                </li>
              )}
            </ul>

            {onCreate && (
              <button
                type="button"
                onClick={handleCreate}
                className="flex min-h-[44px] w-full items-center gap-2 border-t border-border px-3 py-2 text-sm font-bold text-brand-accent hover:bg-accent-soft"
              >
                <Plus className="h-4 w-4 shrink-0" />
                {query.trim() ? `${createLabel} "${query.trim()}"` : createLabel}
              </button>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className={clsx('relative', className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">
          {label}
          {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
        </label>
      )}

      <div className="field-focus-ring" data-open={isOpen ? 'true' : undefined}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-describedby={error ? errorId : undefined}
          data-open={isOpen ? 'true' : undefined}
          data-invalid={error ? 'true' : undefined}
          className="field-surface flex items-center gap-2 text-left"
        >
          {selected?.leading}
          <span
            className={clsx(
              'flex-1 truncate text-sm',
              selected ? 'font-semibold text-foreground' : 'text-muted-foreground'
            )}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={clsx(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}

      {panel}
    </div>
  );
}
