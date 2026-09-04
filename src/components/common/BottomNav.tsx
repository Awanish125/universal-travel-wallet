'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plane, Calculator, Wallet, Compass, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render navigation on sub-form routes to avoid clutter
  if (pathname.includes('/expense') || pathname.includes('/exchange') || pathname.includes('/summary')) {
    return null;
  }

  const navItems = [
    { label: 'Trips', path: '/trips', icon: Plane },
    { label: 'Calculator', path: '/calculator', icon: Calculator },
  ];

  return (
    <>
      {/* MOBILE BOTTOM NAV (< md) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/50 px-6 py-2 pb-6 print:hidden">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path === '/trips' && pathname === '/');

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="relative flex flex-col items-center gap-1 py-1 px-4 cursor-pointer select-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute inset-0 bg-brand-accent/10 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-brand-accent font-bold scale-110' : 'text-muted-foreground hover:text-foreground'
                  }`} 
                />
                <span 
                  className={`text-[10px] font-bold tracking-tight transition-colors ${
                    isActive ? 'text-brand-accent' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* DESKTOP TOP HEADER NAV (≥ md) */}
      <header className="hidden md:block sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => router.push('/trips')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-accent/10 text-brand-accent flex items-center justify-center border border-brand-accent/20 group-hover:scale-105 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-foreground block leading-tight">
                Universal Travel Wallet
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-brand-accent block">
                Universal Offline Money
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="flex items-center gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.path || (item.path === '/trips' && pathname === '/');

              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'text-brand-accent bg-brand-accent/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-surface-strong'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pl-4 border-l border-border/50 flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
