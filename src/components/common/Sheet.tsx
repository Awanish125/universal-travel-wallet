'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Short line under the title explaining what the sheet does. */
  description?: string;
  children: React.ReactNode;
  /** Sticky footer, e.g. the submit button. */
  footer?: React.ReactNode;
  className?: string;
}

/** How long the close animation is given before the sheet is torn down anyway. */
const EXIT_MS = 220;

/**
 * The single dialog shell for the whole app: a bottom sheet on phones, a
 * centered dialog from `sm` up (Point 87). Every modal used to repeat this
 * markup, so it now lives in one place (Rule 30).
 *
 * Renders through a portal so a sheet opened from inside a transformed or
 * scrolled container still covers the viewport.
 *
 * Unmounting is driven by an explicit timer rather than `AnimatePresence`,
 * which did not remove its child from inside this portal — the sheet stayed in
 * the DOM at opacity 0, an invisible full-screen layer that swallowed every
 * click on the page behind it. While closing, the overlay also drops
 * `pointer-events`, so it cannot block anything even if teardown is delayed.
 */
export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return;
    }
    const timer = window.setTimeout(() => setIsRendered(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Escape closes the sheet. `onClose` is usually an inline arrow, so it is read
  // through a ref — depending on it directly would re-run this effect on every
  // render of the parent.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const requestClose = useCallback(() => onCloseRef.current(), []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // The page behind must not scroll while a sheet is open. The value to restore
  // is captured only when the sheet opens; re-reading it on later renders would
  // capture the "hidden" it had just written and leave the page locked forever.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Move focus into the sheet so keyboard and screen-reader users land there.
  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  if (!mounted || !isRendered) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: EXIT_MS / 1000 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
    >
      <div onClick={requestClose} className="absolute inset-0 bg-black/50" aria-hidden />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={
          isOpen ? { y: 0, opacity: 1, scale: 1 } : { y: 24, opacity: 0, scale: 0.98 }
        }
        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
        className={clsx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-sheet border border-border bg-surface-strong shadow-soft-outer sm:max-w-md sm:rounded-sheet',
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-6 py-5">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-border bg-surface-strong px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
