'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Calculator, Globe, Home, Plane, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Trips', path: '/trips', icon: Plane },
  { label: 'Calculator', path: '/calculator', icon: Calculator },
  { label: 'Backup', path: '/settings/backup', icon: Settings },
];

function isCurrent(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

/**
 * The app's persistent navigation: a bottom bar on phones, a top bar from `md`
 * up.
 *
 * It renders on every route. It used to hide itself on the expense, exchange
 * and summary screens, which stranded the user on those pages with only the
 * browser's back button — the one place navigation matters most.
 *
 * Surfaces are opaque here: ADR 005 removed blur and translucency from the
 * product entirely.
 */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // The landing page carries its own marketing header, so only the mobile bar
  // is added there — two stacked desktop headers would just eat the viewport.
  const showDesktopHeader = pathname !== '/';

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-strong px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-10px_28px_-20px_rgba(0,0,0,0.9)] print:hidden md:hidden"
      >
        <ul className="mx-auto flex max-w-md items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isCurrent(pathname, item.path);

            return (
              <li key={item.path}>
                <button
                  type="button"
                  onClick={() => router.push(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className="relative flex min-h-[52px] min-w-[64px] select-none flex-col items-center justify-center gap-0.5 rounded-2xl px-3"
                >
                  {active && (
                    <motion.span
                      layoutId="mobileNavIndicator"
                      className="absolute inset-0 -z-10 rounded-2xl bg-accent-soft"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active ? 'text-brand-accent' : 'text-muted-foreground'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold tracking-tight transition-colors ${
                      active ? 'text-brand-accent' : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <header
        className={`sticky top-0 z-50 border-b border-border bg-surface-strong shadow-[0_1px_0_0_var(--border),0_10px_28px_-22px_rgba(0,0,0,0.9)] print:hidden ${
          showDesktopHeader ? 'hidden md:block' : 'hidden'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="group flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-clay-primary text-white shadow-soft-accent transition-transform group-hover:scale-105 group-active:scale-95">
              <Globe className="h-5 w-5" />
            </span>
            <span className="text-left">
              <span className="block text-base font-black leading-tight tracking-tight text-foreground">
                Universal Travel Wallet
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Any currency, offline
              </span>
            </span>
          </button>

          <nav aria-label="Main" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(pathname, item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => router.push(item.path)}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors ${
                    active
                      ? 'text-brand-accent'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="desktopNavIndicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-accent-soft shadow-[inset_0_0_0_1px_var(--accent-soft)]"
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <span className="ml-2 border-l border-border pl-3">
              <ThemeToggle />
            </span>
          </nav>
        </div>
      </header>
    </>
  );
}
