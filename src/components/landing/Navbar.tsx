'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Calculator', href: '/calculator' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Travel Smarter', href: '#travel-smarter' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [isLight, setIsLight] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial html class
    const isLightMode = document.documentElement.classList.contains('light');
    setIsLight(isLightMode);
  }, []);

  const toggleTheme = () => {
    const nextMode = !isLight;
    setIsLight(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 w-full border-b border-border bg-background/85 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-12">
        {/* Brand Lockup */}
        <motion.a
          href="/"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-surface-strong p-1 shadow-clay-convex-sm border border-white/10">
            <Image
              src="/logo.png"
              alt="Travel Wallet"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-bold tracking-tight text-text-primary">
              Travel Wallet
            </span>
            <span className="text-[11px] font-medium tracking-wide text-text-secondary opacity-80">
              Any Currency, Anywhere.
            </span>
          </div>
        </motion.a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link, idx) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.08 }}
              className="group relative text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        {/* Actions (CTA + Theme Toggle) */}
        <div className="flex items-center gap-3">
          <motion.a
            href="/trips"
            whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }}
            whileTap={{ scale: 0.96 }}
            className="rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition-all sm:text-sm"
          >
            Get Started
          </motion.a>

          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-surface-strong text-text-primary shadow-clay-convex-sm transition-colors hover:border-white/20"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isLight ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isLight ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-300" />
              )}
            </motion.div>
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-surface-strong text-text-primary md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border bg-background px-6 py-4 md:hidden"
        >
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
