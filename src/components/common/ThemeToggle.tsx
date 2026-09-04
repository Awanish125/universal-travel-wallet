'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check initial preference
    const isDark = document.documentElement.classList.contains('dark') || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9, rotate: 15 }}
      onClick={toggleTheme}
      className="p-2 rounded-full text-foreground hover:bg-surface-strong transition-colors cursor-pointer"
      title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'light' ? (
        <Sun className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon className="w-5 h-5 text-blue-400" />
      )}
    </motion.button>
  );
}
