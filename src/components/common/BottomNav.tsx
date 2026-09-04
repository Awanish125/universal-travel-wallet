'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plane, Calculator, Compass, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render bottom nav on sub-routes like /trips/[id]/expense or /trips/[id]/exchange to avoid cluttering forms
  if (pathname.includes('/expense') || pathname.includes('/exchange') || pathname.includes('/summary')) {
    return null;
  }

  const navItems = [
    { label: 'Trips', path: '/trips', icon: Plane },
    { label: 'Calculator', path: '/calculator', icon: Calculator },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border/50 px-6 py-2 pb-6 max-w-md mx-auto print:hidden">
      <div className="flex justify-around items-center">
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
                  layoutId="bottomNavIndicator"
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
  );
}
